import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { buildSystemPrompt } from "@/config/agent-prompts"
import { AI_AGENTS } from "@/types/agents"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const {
      messages,
      agentId,
      workspaceContext,
      commandsContext,
    }: { messages: UIMessage[]; agentId: string; workspaceContext?: string; commandsContext?: string } =
      await req.json()

    let systemMessage = buildSystemPrompt(agentId, AI_AGENTS, false)

    if (workspaceContext && workspaceContext.trim().length > 0) {
      systemMessage += workspaceContext
      systemMessage +=
        "\n\n**IMPORTANT INSTRUCTIONS:**\n" +
        "- When the user asks questions about the workspace content (e.g., 'What's their experience?', 'Tell me about this candidate', 'How many applied jobs?'), use the workspace context above to provide accurate, specific answers.\n" +
        "- Reference the actual data shown in the workspace.\n" +
        "- If the user asks about something not in the workspace context, use your general knowledge to provide helpful information."
    } else {
      systemMessage +=
        "\n\n**IMPORTANT INSTRUCTIONS:**\n" +
        "- The user currently has no workspace open or the workspace is empty.\n" +
        "- Use your general knowledge and expertise to answer their questions.\n" +
        "- If they ask about specific data that would normally be in a workspace (like candidate details or job information), politely let them know they need to open the relevant workspace first.\n" +
        "- For general questions about recruitment, job searching, career advice, or Teamified services, provide helpful and informative responses based on your knowledge."
    }

    if (commandsContext && commandsContext.trim().length > 0) {
      systemMessage += commandsContext
      systemMessage +=
        "\n\n**Note:** These commands are available for the user to execute. When appropriate, you can mention them in your responses, but don't list them all unless the user asks for help or available commands."
    }

    const prompt = convertToModelMessages(messages)

    const result = streamText({
      model: "openai/gpt-4o-mini",
      system: systemMessage,
      prompt,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] Chat API error:", error)
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
