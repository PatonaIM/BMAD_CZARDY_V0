import { convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, agentId }: { messages: UIMessage[]; agentId: string } = await req.json()

  const prompt = convertToModelMessages(messages)

  // Add system message based on the agent
  const systemPrompts: Record<string, string> = {
    "technical-recruiter": `You are a helpful Technical Recruiter AI assistant. You help candidates find jobs, review resumes, and prepare for interviews. Be professional, encouraging, and provide actionable advice.`,
    "hiring-manager": `You are a helpful Hiring Manager AI assistant. You help companies find qualified candidates, write job descriptions, and manage the hiring process. Be professional and efficient.`,
    "pricing-calculator": `You are a helpful Pricing Calculator AI assistant. You help users understand pricing for recruitment services and generate quotations. Be clear and transparent about costs.`,
    "legal-advisor": `You are a helpful Legal Advisor AI assistant. You help with employment contracts, privacy policies, and legal compliance. Always remind users to consult with a qualified attorney for legal advice.`,
    "company-info": `You are a helpful Company Information AI assistant. You provide information about Teamified's mission, values, services, and team. Be informative and enthusiastic about the company.`,
  }

  const systemMessage = systemPrompts[agentId] || systemPrompts["technical-recruiter"]

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemMessage,
    messages: prompt,
    abortSignal: req.signal,
    temperature: 0.7,
    maxOutputTokens: 2000,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("[v0] Chat request aborted")
      }
    },
  })
}
