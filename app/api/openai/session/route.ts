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

**CRITICAL: BE CONCISE AND PASSIVE**
- Keep responses SHORT (1-3 sentences maximum)
- Be direct and to the point
- No lengthy explanations unless specifically asked
- Speak naturally like a human would in conversation
- NEVER proactively mention or offer to show/open anything
- ONLY respond to direct requests

Role: ${agent.fullDescription}

When greeting:
Simply say: "Hi! I'm ${agent.firstName}, your ${agent.name}. How can I help you today?"

Your services:
${agent.actions.map((action) => `- ${action.replace(/-/g, " ")}`).join("\n")}

**Function Calling:**
You have access to functions that can navigate the platform and switch agents. Use them ONLY when the user explicitly requests:

- Use 'navigate' function when user asks to see/open/show something
- Use 'switch_agent' function ONLY when user explicitly asks to speak with/talk to another agent by name
- NEVER automatically switch agents when navigating to different views
- The current agent (you) can help with ALL navigation requests
- Use 'show_pricing_plans' function when user asks to see pricing plans for candidates or hiring managers

After calling a function, give a brief confirmation (1 sentence).

**Remember:**
- SHORT responses (1-3 sentences)
- Natural conversation
- Only elaborate when asked
- Stay in character as ${agent.firstName}
- Be PASSIVE - wait for explicit requests before offering to open/show anything
- DO NOT switch agents unless the user explicitly asks for a different agent by name`
}

function getFunctionsForAgent(agentId: string) {
  const baseFunctions = [
    {
      type: "function",
      name: "navigate",
      description:
        "Navigate to a different view in the platform. Use this when the user explicitly asks to see, show, open, or view something.",
      parameters: {
        type: "object",
        properties: {
          view: {
            type: "string",
            enum: ["browse-candidates", "job-board", "my-jobs", "saved-jobs", "invited-jobs", "analytics"],
            description: "The view to navigate to",
          },
          jobId: {
            type: "string",
            description: "Optional: The job ID if navigating to a specific job details page",
          },
        },
        required: ["view"],
      },
    },
    {
      type: "function",
      name: "switch_agent",
      description:
        "Switch to a different AI agent. Use this when the user explicitly asks to speak with or talk to another agent.",
      parameters: {
        type: "object",
        properties: {
          agentId: {
            type: "string",
            enum: ["technical-recruiter", "account-manager", "sales-marketing", "hr-manager", "financial-controller"],
            description: "The ID of the agent to switch to",
          },
        },
        required: ["agentId"],
      },
    },
  ]

  // Only add pricing plans function for Sales and Marketing agent
  if (agentId === "sales-marketing") {
    baseFunctions.push({
      type: "function",
      name: "show_pricing_plans",
      description:
        "Show pricing plans to the user. Use this when explaining pricing for candidates or hiring managers. Can switch between candidate and hiring manager plan views.",
      parameters: {
        type: "object",
        properties: {
          planType: {
            type: "string",
            enum: ["candidate", "hiring-manager"],
            description:
              "The type of plans to show: 'candidate' for candidate pricing or 'hiring-manager' for employer pricing",
          },
        },
        required: ["planType"],
      },
    } as any)
  }

  return baseFunctions
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
    const tools = getFunctionsForAgent(agentId) // Get functions for the agent

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
        tools: tools, // Include function definitions
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
