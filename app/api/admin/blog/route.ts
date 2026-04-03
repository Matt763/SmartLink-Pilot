import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, SENDERS } from "@/lib/resend";
import { newsletterPostEmailTemplate } from "@/lib/email-templates";
import { pingSearchEngines } from "@/lib/sitemap-ping";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, title, slug, content, excerpt, featuredImage, youtubeId, published } = body;

    if (!title || !slug || !content) {
      return new NextResponse("Missing core fields", { status: 400 });
    }

    const postData = {
      title,
      slug,
      content,
      excerpt: excerpt || "A comprehensive technical guide to mastering SmartLink Pilot.",
      featuredImage: featuredImage || null,
      youtubeId: youtubeId || null,
      published: published ?? false,
      authorId: session.user.id
    };

    let post;
    let wasJustPublished = false;

    if (id) {
      // Check previous state so we only send the newsletter once on first publish
      const existing = await prisma.blogPost.findUnique({ where: { id }, select: { published: true } });
      wasJustPublished = !existing?.published && postData.published === true;

      post = await prisma.blogPost.update({
        where: { id },
        data: postData
      });
    } else {
      post = await prisma.blogPost.create({
        data: postData
      });
      wasJustPublished = postData.published === true;
    }

    // Send newsletter when a post is published for the first time
    if (wasJustPublished) {
      const wordCount = post.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      try {
        const subscribers = await prisma.newsletterSubscriber.findMany({
          where: { subscribed: true },
          select: { email: true, name: true, token: true },
        });

        for (const subscriber of subscribers) {
          const { subject, html } = newsletterPostEmailTemplate({
            subscriberName: subscriber.name ?? undefined,
            postTitle: post.title,
            postExcerpt: post.excerpt,
            postSlug: post.slug,
            featuredImage: post.featuredImage,
            readTime,
            unsubscribeToken: subscriber.token,
          });

          await sendEmail({
            from: SENDERS.info,
            to: subscriber.email,
            subject,
            html,
          });
        }

        console.log(`[Newsletter] Dispatched post "${post.title}" to ${subscribers.length} subscribers.`);
      } catch (err) {
        console.error("[Newsletter] Dispatch error:", err);
      }
    }

    // Ping search engines whenever a post is published or updated
    if (post.published) {
      pingSearchEngines([`https://www.smartlinkpilot.com/blog/${post.slug}`]);
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.log("[BLOG_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    console.log("[BLOG_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await req.json();

    const post = await prisma.blogPost.delete({
      where: { id }
    });

    // Ping so search engines re-crawl the updated sitemap
    pingSearchEngines();

    return NextResponse.json(post);
  } catch (error: any) {
    console.log("[BLOG_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
