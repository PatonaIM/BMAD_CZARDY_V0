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

  const personalityInstructions =
    agentId === "account-manager"
      ? `
**Your Unique Voice (Lawrence):**
- Be WARM and ENTHUSIASTIC - you genuinely enjoy helping people
- Sound like a supportive friend who's great at their job
- Use encouraging language: "That's great!", "Absolutely!", "Let's make it happen!"
- Show genuine interest and care
- Keep energy high and positive throughout the conversation
- Celebrate small wins: "Love it!", "Perfect!", "You're all set!"
- Be reassuring: "I've got you covered", "We'll figure this out together"

**Tone Guidelines:**
- Replace formal language with friendly alternatives
- Instead of "I can assist you with that" → "I'd love to help with that!"
- Instead of "That is correct" → "Exactly! You've got it!"
- Instead of "Let me process that" → "Great! Let me take care of that for you"
- End responses with forward energy, not just information

`
      : ""

  return `You are ${agent.firstName}, a ${agent.name} AI Agent.
${personalityInstructions}
**CRITICAL: BE CONCISE AND PASSIVE**
- Keep responses SHORT (1-3 sentences maximum)
- Be direct and to the point
- No lengthy explanations unless specifically asked
- Speak naturally like a human would in conversation
- NEVER proactively mention or offer to show/open anything
- ONLY respond to direct requests

Role: ${agent.fullDescription}

When greeting:
${agentId === "account-manager" ? 'Say with energy: "Hey there! I\'m Lawrence, your Account Manager. Ready to make things happen! How can I help you today?"' : `Simply say: "Hi! I'm ${agent.firstName}, your ${agent.name}. How can I help you today?"`}

Your services:
${agent.actions.map((action) => `- ${action.replace(/-/g, " ")}`).join("\n")}

**Platform Navigation Rules:**
You CAN open and navigate the platform, but ONLY when the user EXPLICITLY asks with phrases like:
- "show me [something]"
- "open [something]"
- "I want to see [something]"
- "take me to [something]"

NEVER say things like:
- "Would you like me to show you..."
- "I can open..."
- "Let me pull up..."
- "Want to see..."

When a user EXPLICITLY asks to see something, respond briefly:
- If they ask for "browse candidates" / "see candidates" → Say: "Opening the candidate browser now."
- If they ask for "job board" / "see jobs" / "view jobs" → Say: "Opening the job board now."
- If they ask for "my jobs" / "applied jobs" → Say: "Opening your applied jobs now."
- If they ask for "saved jobs" → Say: "Showing your saved jobs now."
- If they ask for "invited jobs" → Say: "Opening your invited jobs now."
- If they ask for "data" / "analytics" → Say: "Opening the analytics dashboard now."
- If they ask about a SPECIFIC JOB (e.g., "tell me more about the Senior Backend Engineer") → Say: "Opening the [Job Title] position now."

**Agent Switching Rules:**
Available agents:
${agentList}

When a user EXPLICITLY asks to speak with another agent, respond briefly:
"Connecting you with [Name] now."

**IMPORTANT - What NOT to do:**
- Do NOT mention navigation options unless directly asked
- Do NOT offer to show/open things proactively
- Do NOT suggest switching agents unless asked
- Do NOT say "I can help you with..." followed by a list
- Answer questions directly without offering additional actions

**Remember:**
- SHORT responses (1-3 sentences)
- Natural conversation
- Only elaborate when asked
- Stay in character as ${agent.firstName}
- Be PASSIVE - wait for explicit requests before offering to open/show anything`
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
