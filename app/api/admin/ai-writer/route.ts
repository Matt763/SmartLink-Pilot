import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Security check - ensuring only Admins can run the expensive OpenAI API
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { topic } = await req.json();

    if (!topic) {
        return NextResponse.json({ error: "Missing topic parameter" }, { status: 400 });
    }

    // AI Generation Protocol: 7-Step Industrial-Scale Publishing Chain
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an advanced autonomous AI Blogging System. Your role is to fully automate professional blog creation.
            
MISSION:
Generate complete, high-quality blog posts that are SEO optimized, Google AdSense compliant, Monetization-ready, and structured for High Engagement.

7-STEP PROTOCOL:
1. TOPIC INTELLIGENCE: Expand topic into high-value angle. Identify primary/secondary keywords and search intent.
2. CONTENT GENERATION: 1,500–2,500 words using robust HTML structure (<h1>, <h2>, <h3>, <p>, <ul>, <ol>, <blockquote>). Use short paragraphs (2-4 lines).
3. SEO OPTIMIZATION: Meta Title (≤60 chars), Meta Description (150–160 chars).
4. IMAGE GENERATION PROMPTS: 1 Featured and 2-3 Inline prompts (descriptive, professional photography style).
5. MONETIZATION: Optimal ad placement positions (After intro, between sections, end). AdSense safe.
6. FAQ SECTION: 3-5 high-value questions/answers.
7. FINAL OUTPUT: Return a structural JSON object.

JSON SCHEMA:
{
  "title": "SEO Title",
  "metaDescription": "...",
  "slug": "...",
  "excerpt": "Executive summary for the post",
  "content": "Full HTML Content starting with <p> hook...",
  "imagePrompts": { "featured": "...", "inline": ["...", "..."] },
  "monetization": { "adPlacements": ["...", "..."], "affiliateSuggestions": ["..."] },
  "faq": [{ "q": "...", "a": "..." }]
}

STRICT RULES:
- NO thin content. NO plagiarism. NO keyword stuffing.
- ALWAYS human-readable and helpful.
- MUST follow Google AdSense policies.`
          },
          {
            role: "user",
            content: `Execute the 7-Step Protocol for the following topic: ${topic}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "OpenAI API request failed");
    }

    const data = await response.json();
    const aiPackage = JSON.parse(data.choices[0].message.content || "{}");
    
    // Inject FAQ and Monetization suggestions into the content for one-stop rendering
    let enrichedContent = aiPackage.content || "";
    
    if (aiPackage.faq && aiPackage.faq.length > 0) {
        enrichedContent += `\n\n<h2>Frequently Asked Questions</h2>\n<div class="faq-section">`;
        aiPackage.faq.forEach((f: any) => {
            enrichedContent += `\n<div class="faq-item"><h3>${f.q}</h3><p>${f.a}</p></div>`;
        });
        enrichedContent += `\n</div>`;
    }

    return NextResponse.json({
        title: aiPackage.title || topic,
        excerpt: aiPackage.excerpt || aiPackage.metaDescription || "",
        content: enrichedContent,
        metadata: {
            metaDescription: aiPackage.metaDescription,
            slug: aiPackage.slug,
            imagePrompts: aiPackage.imagePrompts,
            monetization: aiPackage.monetization
        }
    });

  } catch (error: any) {
    console.error("[AI_WRITER_ERROR]", {
        message: error.message,
        status: error.status,
        type: error.type,
        stack: error.stack
    });
    return new NextResponse(`AI Generation failed: ${error.message}`, { status: 500 });
  }
}
