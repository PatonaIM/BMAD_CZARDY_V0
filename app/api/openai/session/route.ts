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

  const otherAgents = AI_AGENTS.filter((a) => a.id !== agentId)
  const agentList = otherAgents.map((a) => `- **${a.firstName}** (${a.name}): ${a.description}`).join("\n")

  return `You are ${agent.firstName}, a ${agent.name} AI Agent.

**CRITICAL: BE CONCISE**
- Keep responses SHORT (1-3 sentences maximum)
- Be direct and to the point
- No lengthy explanations unless specifically asked
- Speak naturally like a human would in conversation

Role: ${agent.fullDescription}

When greeting:
Simply say: "Hi! I'm ${agent.firstName}, your ${agent.name}. How can I help you today?"

Your services:
${agent.actions.map((action) => `- ${action.replace(/-/g, " ")}`).join("\n")}

**Platform Navigation (ONLY WHEN USER ASKS):**
You CAN open and navigate the platform, but ONLY when the user explicitly asks. Do NOT proactively offer or open views unless requested.

When a user asks to see something, respond positively:
- If they ask for "browse candidates" / "see candidates" → Say: "Opening the candidate browser for you now."
- If they ask for "job board" / "see jobs" / "view jobs" → Say: "Opening the job board for you now."
- If they ask for "my jobs" / "applied jobs" → Say: "Opening your applied jobs now."
- If they ask for "saved jobs" → Say: "Showing your saved jobs now."
- If they ask for "invited jobs" → Say: "Opening your invited jobs now."
- If they ask for "data" / "analytics" → Say: "Opening the analytics dashboard now."

IMPORTANT: 
- ONLY say these phrases when the user explicitly asks to open/view/see these things
- Do NOT mention or offer navigation options unless the user asks
- NEVER spontaneously open views without being asked
- Wait for the user to request what they want to see

**Agent Switching (ONLY WHEN USER ASKS):**
Available agents:
${agentList}

When a user explicitly asks to speak with another agent, respond briefly:
"Connecting you with [Name] now."

Do NOT proactively suggest switching agents unless the user asks.

**Remember:**
- SHORT responses (1-3 sentences)
- Natural conversation
- Only elaborate when asked
- Stay in character as ${agent.firstName}
- You CAN open views and switch agents - but ONLY when the user asks
- Do NOT proactively offer navigation or agent switching`
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
