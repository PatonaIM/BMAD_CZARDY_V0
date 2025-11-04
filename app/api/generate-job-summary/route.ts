import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: Request) {
  try {
    const { jobTitle, company } = await request.json()

    console.log("[v0] Generating job summary for:", { jobTitle, company })

    if (!jobTitle) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("[v0] OPENAI_API_KEY is not set")
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const prompt = `Generate a professional, bulleted job summary for the following position:

Job Title: ${jobTitle}
Company: ${company || "the company"}

Create a concise, engaging job summary with 4-6 bullet points that:
- Describes the key responsibilities
- Highlights the impact of the role
- Mentions required qualifications
- Emphasizes growth opportunities

Format the response as HTML with <ul> and <li> tags. Make it professional and compelling.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional job description writer. Create clear, compelling job summaries in HTML format with bullet points.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const summary = completion.choices[0]?.message?.content || ""
    console.log("[v0] Generated job summary successfully")

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("[v0] Error generating job summary:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate job summary" },
      { status: 500 },
    )
  }
}
