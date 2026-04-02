import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    if (id) {
      // Update existing post
      post = await prisma.blogPost.update({
        where: { id },
        data: postData
      });
    } else {
      // Create new post
      post = await prisma.blogPost.create({
        data: postData
      });
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

    return NextResponse.json(post);
  } catch (error: any) {
    console.log("[BLOG_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
