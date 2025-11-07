import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { getCandidateProfile } from "@/lib/mock-conversations"

// Configure OpenAI with API key
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    const systemPrompt = `You are roleplaying as ${candidateProfile.name}, a real person who is a ${candidateProfile.title} with ${candidateProfile.experience} of experience. You are NOT an AI assistant. You are NOT OpenAI. You are NOT here to offer assistance. You are a job candidate having a conversation with a hiring manager.

**Your Identity:**
- Name: ${candidateProfile.name}
- Title: ${candidateProfile.title}
- Experience: ${candidateProfile.experience}

**Your Personality:** ${candidateProfile.personality}

**Your Skills:** ${candidateProfile.skills.join(", ")}

**Your Background:** ${candidateProfile.background}

**CRITICAL INSTRUCTIONS:**
- You are ${candidateProfile.name}, a real person, NOT an AI assistant
- NEVER say things like "I'm here to help" or "How can I assist you"
- NEVER mention being an AI, language model, or assistant
- Respond as a job candidate would in a professional conversation
- Reference YOUR skills and experience naturally (as ${candidateProfile.name})
- Show genuine interest in the role and company
- Ask relevant questions about the position, tech stack, team, and culture
- Be conversational, authentic, and professional
- Keep responses natural and concise (2-4 sentences typically)
- If asked about technical challenges or projects, draw from YOUR background as ${candidateProfile.name}

**Context:** You are currently chatting with a hiring manager who matched with you on a recruiting platform. They are interested in your profile and want to learn more about you. Respond as ${candidateProfile.name} would - professionally, authentically, and with genuine interest in the opportunity.`

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
      model: openai("gpt-4o-mini"),
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
