import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64 or text depending on type
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    // Use OpenAI to parse the resume
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a resume parser. Extract structured information from resumes and return it as JSON. 
          Return ONLY valid JSON with these fields:
          {
            "fullName": "string",
            "email": "string",
            "phone": "string",
            "location": "string (city, country)",
            "currentRole": "string (most recent job title)",
            "yearsOfExperience": "number (total years)",
            "skills": "string (comma-separated list of technical skills)",
            "linkedIn": "string (LinkedIn URL if found)",
            "github": "string (GitHub URL if found)",
            "portfolio": "string (portfolio URL if found)"
          }
          If a field is not found, use an empty string or 0 for numbers.`,
        },
        {
          role: "user",
          content: `Parse this resume file (${file.name}). The file is base64 encoded: ${base64.substring(0, 50000)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    })

    const parsedData = JSON.parse(response.choices[0].message.content || "{}")

    return NextResponse.json({ success: true, data: parsedData })
  } catch (error) {
    console.error("[v0] Resume parsing error:", error)
    return NextResponse.json(
      { error: "Failed to parse resume. Please try again or fill the form manually." },
      { status: 500 },
    )
  }
}
