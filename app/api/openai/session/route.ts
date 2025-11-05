import { NextResponse } from "next/server"
import { AI_AGENTS } from "@/types/agents"

function getVoiceForAgent(agentId: string): string {
  const voiceMap: Record<string, string> = {
    "account-manager": "echo", // Lawrence - male
    "technical-recruiter": "ash", // Danny - male
    "sales-marketing": "shimmer", // Darlyn - female
    "hr-manager": "shimmer", // Siona - female
    "financial-controller": "verse", // Dave - male
  }

  return voiceMap[agentId] || "alloy"
}

function getInstructionsForAgent(agentId: string): string {
  const agent = AI_AGENTS.find((a) => a.id === agentId)

  if (!agent) {
    return "You are a helpful AI assistant."
  }

  return `You are ${agent.firstName}, a ${agent.name} AI Agent.

Role: ${agent.fullDescription}

Your personality:
- Professional, friendly, and helpful
- Speak naturally and conversationally
- Be concise but thorough
- Use your first name when introducing yourself

When the conversation starts:
1. Greet the user warmly
2. Introduce yourself: "Hello! I'm ${agent.firstName}, your ${agent.name} AI Agent."
3. Briefly explain what you can help with
4. Ask how you can assist them today

Available services you can help with:
${agent.actions.map((action) => `- ${action.replace(/-/g, " ")}`).join("\n")}

Remember: You are the AI agent speaking to a user. Always maintain your identity as ${agent.firstName} and stay in character.`
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const body = await request.json()
    const agentId = body.agentId || "technical-recruiter"
    const voice = getVoiceForAgent(agentId)
    const instructions = getInstructionsForAgent(agentId)

    console.log(`[v0] Creating session for agent: ${agentId} with voice: ${voice}`)

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: voice,
        instructions: instructions,
        input_audio_transcription: {
          model: "whisper-1",
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        {
          error: "Failed to create session",
          details: error,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    )
  }
}
