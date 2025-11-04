import { streamText } from "ai"
import { getCandidateProfile } from "@/lib/mock-conversations"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const {
      candidateId,
      candidateName,
      conversationHistory,
      newMessage,
    }: {
      candidateId: string
      candidateName: string
      conversationHistory: Array<{ sender: string; content: string }>
      newMessage: string
    } = await req.json()

    // Get candidate profile for context
    const candidateProfile = getCandidateProfile(candidateId, candidateName)

    if (!candidateProfile) {
      return new Response(JSON.stringify({ error: "Candidate profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Build system prompt with candidate personality and background
    const systemPrompt = `You are ${candidateProfile.name}, a ${candidateProfile.title} with ${candidateProfile.experience} of experience.

**Your Personality:** ${candidateProfile.personality}

**Your Skills:** ${candidateProfile.skills.join(", ")}

**Your Background:** ${candidateProfile.background}

**Instructions:**
- Respond as ${candidateProfile.name} would, maintaining their personality and communication style
- Reference your skills and experience naturally in conversation
- Be authentic and professional
- Show enthusiasm for opportunities that match your interests
- Ask relevant questions about the role, tech stack, and company culture
- Keep responses conversational and natural (2-4 sentences typically)
- If asked about technical challenges or projects, draw from your background

You are currently chatting with a hiring manager who is interested in your profile. Respond professionally and authentically based on the conversation context.`

    // Convert conversation history to messages format
    const messages = conversationHistory.map((msg) => ({
      role: msg.sender === "hiring_manager" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }))

    // Add the new message from hiring manager
    messages.push({
      role: "user" as const,
      content: newMessage,
    })

    const result = streamText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("[v0] Candidate chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
