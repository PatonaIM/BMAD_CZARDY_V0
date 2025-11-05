"use server"

import { generateText } from "ai"

const RESERVED_COMMANDS = [
  {
    command: "browse candidates",
    description: "Browse and swipe through candidate profiles",
    keywords: [
      "browse candidates",
      "see candidates",
      "look at candidates",
      "view candidates",
      "swipe candidates",
      "check candidates",
    ],
  },
  {
    command: "job board",
    description: "View all available job positions",
    keywords: ["job board", "available jobs", "open positions", "see jobs", "view jobs", "job listings", "all jobs"],
  },
  {
    command: "my jobs",
    description: "View jobs the user has applied to or saved",
    keywords: ["my jobs", "my applications", "applied jobs", "saved jobs", "my positions"],
  },
  {
    command: "data",
    description: "View analytics and data dashboard",
    keywords: ["data", "analytics", "dashboard", "statistics", "metrics", "insights", "reports"],
  },
]

export async function detectCommandIntent(userInput: string): Promise<{
  isCommand: boolean
  command?: string
  confidence: number
}> {
  // First, try exact matching (case-insensitive)
  const normalizedInput = userInput.toLowerCase().trim()

  for (const cmd of RESERVED_COMMANDS) {
    if (normalizedInput === cmd.command || cmd.keywords.some((k) => normalizedInput === k)) {
      return {
        isCommand: true,
        command: cmd.command,
        confidence: 1.0,
      }
    }
  }

  // If no exact match, use AI to detect intent
  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a command intent detector. Analyze the user's input and determine if it matches any of these reserved commands:

${RESERVED_COMMANDS.map((cmd) => `- "${cmd.command}": ${cmd.description}`).join("\n")}

User input: "${userInput}"

Respond with ONLY a JSON object in this exact format:
{
  "isCommand": true/false,
  "command": "exact command name" or null,
  "confidence": 0.0 to 1.0
}

Rules:
- Only return isCommand: true if you're confident (>0.7) the user wants to trigger a command
- The command field must be the EXACT command name from the list above
- If the user is just having a conversation and mentions these topics casually, return isCommand: false
- Be strict: only detect commands when the user clearly wants to perform an action

Examples:
- "I wanted to browse some candidates" → {"isCommand": true, "command": "browse candidates", "confidence": 0.9}
- "Show me the job board" → {"isCommand": true, "command": "job board", "confidence": 0.95}
- "We should browse candidates later" → {"isCommand": false, "command": null, "confidence": 0.3}
- "Tell me about the candidates" → {"isCommand": false, "command": null, "confidence": 0.4}`,
    })

    let cleanedText = text.trim()

    // Remove markdown code blocks (```json ... ``` or ``` ... ```)
    if (cleanedText.startsWith("```")) {
      // Remove opening ```json or ```
      cleanedText = cleanedText.replace(/^```(?:json)?\s*\n?/, "")
      // Remove closing ```
      cleanedText = cleanedText.replace(/\n?```\s*$/, "")
      cleanedText = cleanedText.trim()
    }

    // Parse the AI response
    const result = JSON.parse(cleanedText)

    // Only return command if confidence is high enough
    if (result.isCommand && result.confidence >= 0.7) {
      return {
        isCommand: true,
        command: result.command,
        confidence: result.confidence,
      }
    }

    return {
      isCommand: false,
      confidence: result.confidence || 0,
    }
  } catch (error) {
    console.error("[v0] Error detecting command intent:", error)
    return {
      isCommand: false,
      confidence: 0,
    }
  }
}
