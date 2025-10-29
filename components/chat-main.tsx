"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Menu,
  Plus,
  Mic,
  ArrowUp,
  Copy,
  Download,
  FileText,
  ChevronDown,
  Sparkles,
  Briefcase,
  Building2,
  Calculator,
  Scale,
  Info,
  PanelRight,
} from "lucide-react"
import { AI_AGENTS, type AIAgent } from "@/types/agents"
import type { WorkspaceContent } from "@/types/workspace"
import { MarkdownRenderer } from "./markdown-renderer"

interface ChatMainProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  onOpenWorkspace: (content: WorkspaceContent) => void
  initialAgentId?: string | null
  shouldShowWelcome?: boolean
}

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  responseType?: "text" | "code" | "table" | "file" | "image"
  thinking?: boolean
  thinkingTime?: number
  agentId?: string
  isAgentSwitch?: boolean // Added flag to indicate agent switch messages
}

const welcomeQuestions = [
  "What can Teamified AI assist you with today?",
  "How may I help you with your job search?",
  "Need help with a project? Let me know!",
  "Curious about AI capabilities? Ask away!",
]

const loremParagraphs = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
  "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
]

const loremBullets = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris",
  "Duis aute irure dolor in reprehenderit in voluptate velit",
  "Excepteur sint occaecat cupidatat non proident",
]

const generateShortResponse = () => loremParagraphs[0]

const generateLargeResponse = () => {
  const mainContent = loremParagraphs.slice(0, 5).join("\n\n")
  const summary = `\n\n## In Summary\n\n${loremParagraphs[6]}\n\n${loremParagraphs[7]}`
  return `${mainContent}${summary}`
}

const generateBulletResponse = () => {
  const intro = loremParagraphs[0]
  const bullets = loremBullets.map((bullet) => `• ${bullet}`).join("\n")
  const summary = `\n\n## Summary\n\n${loremParagraphs[1]}`
  return `${intro}\n\n${bullets}${summary}`
}

const codeSnippet = `import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/session", async (req, res) => {
  const response = await fetch("https://api.example.com/v1/sessions", {
    method: "POST",
    headers: { "Authorization": \`Bearer \${process.env.API_KEY}\` },
    body: JSON.stringify({ model: "gpt-4" })
  });
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log("Server running"));`

const tableData = {
  headers: ["Candidate", "Position", "Experience", "Status", "Match Score"],
  rows: [
    ["Sarah Johnson", "Senior Full-Stack Developer", "8 years", "Interview Scheduled", "95%"],
    ["Michael Chen", "AI Engineer", "5 years", "Under Review", "88%"],
    ["Emily Rodriguez", "Product Manager", "6 years", "Offer Extended", "92%"],
    ["David Kim", "DevOps Engineer", "7 years", "Technical Assessment", "85%"],
  ],
}

// Helper function to format command names
const formatCommandName = (command: string): string => {
  return command
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Helper function to generate agent introduction message
const generateAgentIntroduction = (agent: AIAgent): string => {
  const commandsList = agent.actions.map((action) => `- *${action} - ${formatCommandName(action)}`).join("\n")

  return `Hello! I'm **${agent.firstName}**. Your **${agent.name}** AI Agent. ${agent.icon}

${agent.fullDescription}

## Available Commands:
- *help - Show this command list
${commandsList}

Simply type the command or just ask your queries away!

${agent.callToAction}`
}

// Helper function to generate help message
const generateHelpMessage = (agent: AIAgent): string => {
  const commandsList = agent.actions.map((action) => `- *${action} - ${formatCommandName(action)}`).join("\n")

  return `## Available Commands for ${agent.name} ${agent.icon}

Here are all the commands I can help you with:

- *help - Show this command list
${commandsList}

Simply type any command (e.g., \`*service-overview\`) or just ask your questions naturally!

${agent.callToAction}`
}

type SuggestionCategory = "suggested" | "apply-to-jobs" | "hiring" | "quote-me" | "legal" | "about-us"

const suggestionsByCategory: Record<SuggestionCategory, Array<{ text: string; emoji: string }>> = {
  suggested: [
    { text: "Tell me more about Teamified AI", emoji: "🤖" },
    { text: "Show me available AI agents", emoji: "👥" },
    { text: "What can you help me with?", emoji: "💡" },
    { text: "Explain your capabilities", emoji: "✨" },
  ],
  "apply-to-jobs": [
    { text: "Help me land a job offer for an open role", emoji: "💼" },
    { text: "Show me open positions matching my skills", emoji: "🎯" },
    { text: "Review my resume and suggest improvements", emoji: "📄" },
    { text: "Prepare me for upcoming interviews", emoji: "🎤" },
  ],
  hiring: [
    { text: "Open a job for my company", emoji: "📢" },
    { text: "Show me qualified candidates for my role", emoji: "👔" },
    { text: "Help me write a job description", emoji: "✍️" },
    { text: "Schedule interviews with shortlisted candidates", emoji: "📅" },
  ],
  "quote-me": [
    { text: "Calculate sample quotation for me", emoji: "💰" },
    { text: "Show me pricing for recruitment services", emoji: "💵" },
    { text: "Generate an employment contract", emoji: "📋" },
    { text: "Explain your service packages", emoji: "📦" },
  ],
  legal: [
    { text: "Show me your privacy policy", emoji: "🔒" },
    { text: "Explain your terms and conditions", emoji: "📜" },
    { text: "What are your data protection policies?", emoji: "🛡️" },
    { text: "Generate a non-disclosure agreement", emoji: "🤝" },
  ],
  "about-us": [
    { text: "Tell me about Teamified's mission and values", emoji: "🎯" },
    { text: "Who are the people behind Teamified?", emoji: "👥" },
    { text: "What services does Teamified offer?", emoji: "🚀" },
    { text: "How can I contact Teamified?", emoji: "📞" },
  ],
}

const categoryTabs: Array<{ id: SuggestionCategory; label: string; icon: React.ReactNode }> = [
  { id: "suggested", label: "Suggested", icon: <Sparkles className="w-4 h-4" /> },
  { id: "apply-to-jobs", label: "Apply to Jobs", icon: <Briefcase className="w-4 h-4" /> },
  { id: "hiring", label: "Hiring", icon: <Building2 className="w-4 h-4" /> },
  { id: "quote-me", label: "Pricing", icon: <Calculator className="w-4 h-4" /> },
  { id: "legal", label: "Legal", icon: <Scale className="w-4 h-4" /> },
  { id: "about-us", label: "About Us", icon: <Info className="w-4 h-4" /> },
]

const generateCandidateWelcome = (): string => {
  return `Hello! Welcome to Teamified AI! I'm **Danny**, your **Technical Recruiter** AI Agent. 🎯

I'm excited to help you find your next great opportunity! To get started, I've opened a Candidate Profile form in the workspace on the right where you can share your information with me.

${loremParagraphs[0]}

${loremParagraphs[1]}

## Here's what I can help you with:

${loremParagraphs[2]}

${loremParagraphs[3]}

Please take a moment to complete your profile, and then we can start exploring opportunities that match your skills and experience!

What would you like to know about the opportunities we have available?`
}

export function ChatMain({
  isSidebarOpen,
  onToggleSidebar,
  onOpenWorkspace,
  initialAgentId,
  shouldShowWelcome,
}: ChatMainProps) {
  const [message, setMessage] = useState("")
  const [welcomeQuestion, setWelcomeQuestion] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [activeAgent, setActiveAgent] = useState<AIAgent>(() => {
    if (initialAgentId) {
      return AI_AGENTS.find((agent) => agent.id === initialAgentId) || AI_AGENTS[0]
    }
    return AI_AGENTS[0]
  })
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false)
  const [activeSuggestionTab, setActiveSuggestionTab] = useState<SuggestionCategory>("suggested")
  const [hasOpenedWorkspace, setHasOpenedWorkspace] = useState(false)
  const [lastWorkspaceContent, setLastWorkspaceContent] = useState<WorkspaceContent | null>(null)
  const lastUserMessageRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const agentDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomeQuestions.length)
    setWelcomeQuestion(welcomeQuestions[randomIndex])
  }, [])

  useEffect(() => {
    if (shouldShowWelcome && initialAgentId) {
      const agent = AI_AGENTS.find((a) => a.id === initialAgentId)
      if (agent) {
        setMessages([
          {
            id: Date.now().toString(),
            type: "ai",
            content: generateCandidateWelcome(),
            agentId: agent.id,
            isAgentSwitch: false,
          },
        ])
      }
    }
  }, [shouldShowWelcome, initialAgentId])

  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      if (messages.length === 1) {
        requestAnimationFrame(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = 0
          }
        })
      } else {
        const timer = setTimeout(() => {
          if (lastUserMessageRef.current) {
            lastUserMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
          } else if (lastMessageRef.current && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
              top: messagesContainerRef.current.scrollHeight,
              behavior: "smooth",
            })
          }
        }, 100)
        return () => clearTimeout(timer)
      }
    }
  }, [messages, isThinking])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(event.target as Node)) {
        setIsAgentDropdownOpen(false)
      }
    }
    if (isAgentDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isAgentDropdownOpen])

  const simulateAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase().trim()
    let responseType: "text" | "code" | "table" | "file" | "image" = "text"
    let content = ""
    let shouldOpenWorkspace = false
    let workspaceContent: WorkspaceContent | null = null

    if (lowerMessage === "*help") {
      content = generateHelpMessage(activeAgent)
    } else if (lowerMessage === "large text") {
      content = generateLargeResponse()
    } else if (lowerMessage === "bullet text") {
      content = generateBulletResponse()
    } else if (lowerMessage === "pdf") {
      responseType = "file"
      content = generateShortResponse()
    } else if (lowerMessage === "pdf preview") {
      content = generateLargeResponse()
      shouldOpenWorkspace = true
      workspaceContent = { type: "pdf", title: "employment-contract.pdf" }
    } else if (lowerMessage === "table") {
      responseType = "table"
      content = generateShortResponse()
    } else if (lowerMessage === "table preview") {
      content = generateLargeResponse()
      shouldOpenWorkspace = true
      workspaceContent = { type: "table", title: "Candidate Data" }
    } else if (lowerMessage === "image") {
      responseType = "image"
      content = generateShortResponse()
    } else if (lowerMessage === "image preview") {
      content = generateLargeResponse()
      shouldOpenWorkspace = true
      workspaceContent = { type: "image", title: "Dashboard Screenshot" }
    } else if (lowerMessage === "video preview") {
      content = generateLargeResponse()
      shouldOpenWorkspace = true
      workspaceContent = { type: "video", title: "Product Demo Video" }
    } else if (lowerMessage === "code") {
      responseType = "code"
      content = generateShortResponse()
    } else if (lowerMessage === "code preview") {
      content = generateLargeResponse()
      shouldOpenWorkspace = true
      workspaceContent = { type: "code", title: "server.js", data: codeSnippet }
    } else if (lowerMessage === "job board") {
      content = generateLargeResponse()
      shouldOpenWorkspace = true
      workspaceContent = { type: "job-board", title: "Open Positions" }
    } else if (lowerMessage === "data") {
      content = generateLargeResponse()
      shouldOpenWorkspace = true
      workspaceContent = { type: "analytics", title: "Recruitment Analytics" }
    } else {
      content = generateShortResponse()
    }

    setIsThinking(true)
    const thinkingTime = Math.floor(Math.random() * 20) + 15

    setTimeout(() => {
      setIsThinking(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content,
          responseType,
          thinkingTime,
          agentId: activeAgent.id,
        },
      ])

      if (shouldOpenWorkspace && workspaceContent) {
        setHasOpenedWorkspace(true)
        setLastWorkspaceContent(workspaceContent)
        setTimeout(() => onOpenWorkspace(workspaceContent), 100)
      }
    }, 2000)
  }

  const handlePreviewClick = (fileType: string) => {
    onOpenWorkspace({ type: "pdf", title: "candidate-resume.pdf" })
  }

  const handleReopenWorkspace = () => {
    if (lastWorkspaceContent) {
      onOpenWorkspace(lastWorkspaceContent)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "user",
          content: message,
        },
      ])
      simulateAIResponse(message)
      setMessage("")
    }
  }

  const handleSuggestionClick = (suggestionText: string) => {
    setMessage(suggestionText)
  }

  const handleAgentChange = (agent: AIAgent) => {
    setActiveAgent(agent)
    setIsAgentDropdownOpen(false)
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "ai",
        content: generateAgentIntroduction(agent),
        agentId: agent.id,
        isAgentSwitch: true,
      },
    ])
  }

  const isCentered = messages.length === 0

  const renderSuggestions = () => (
    <>
      <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-2">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSuggestionTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeSuggestionTab === tab.id
                ? "bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white shadow-md"
                : "bg-card border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {suggestionsByCategory[activeSuggestionTab].map((suggestion) => (
          <button
            key={suggestion.text}
            onClick={() => handleSuggestionClick(suggestion.text)}
            className="px-4 py-3 text-sm text-left rounded-2xl border border-border hover:bg-accent hover:border-[#A16AE8] transition-all"
          >
            <span className="mr-2">{suggestion.emoji}</span>
            {suggestion.text}
          </button>
        ))}
      </div>
    </>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-accent transition-colors flex-shrink-0"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 text-center">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-[#A16AE8] to-[#8096FD] bg-clip-text text-transparent">
            Teamified AI
          </h2>
        </div>
        <div className="flex-shrink-0">
          {hasOpenedWorkspace && (
            <button
              onClick={handleReopenWorkspace}
              className="p-2 rounded-lg hover:bg-accent transition-colors group"
              aria-label="Reopen workspace"
              title="Reopen workspace"
            >
              <PanelRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          )}
        </div>
      </header>

      <main
        ref={messagesContainerRef}
        className={`flex-1 min-h-0 px-6 relative ${isCentered ? "flex items-center justify-center" : "flex flex-col overflow-y-auto"}`}
      >
        {isCentered ? (
          <div className="w-full max-w-3xl">
            <div className="text-center mb-12">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${activeAgent.color}, ${activeAgent.color}dd)` }}
              >
                <span className="text-4xl">{activeAgent.icon}</span>
              </div>
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-[#A16AE8] to-[#8096FD] bg-clip-text text-transparent">
                Teamified AI
              </h1>
              <p className="text-2xl text-muted-foreground mb-8">{welcomeQuestion}</p>
            </div>

            <div className="animate-in fade-in duration-500">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center bg-card border border-border rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="absolute left-4 flex items-center gap-1">
                    <button
                      type="button"
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                      aria-label="Add attachment"
                    >
                      <Plus className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="relative" ref={agentDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                        className="p-1.5 rounded-lg hover:bg-accent transition-all group"
                        aria-label="Select AI Agent"
                        title={activeAgent.name}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: activeAgent.color }}
                        >
                          <span className="text-base">{activeAgent.icon}</span>
                        </div>
                      </button>
                      {isAgentDropdownOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
                          <div className="p-3 border-b border-border bg-muted">
                            <h3 className="text-sm font-semibold text-foreground">Select AI Agent</h3>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {AI_AGENTS.map((agent) => (
                              <button
                                key={agent.id}
                                type="button"
                                onClick={() => handleAgentChange(agent)}
                                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors text-left ${activeAgent.id === agent.id ? "bg-accent/50" : ""}`}
                              >
                                <div
                                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                                  style={{ backgroundColor: agent.color }}
                                >
                                  <span className="text-xl">{agent.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-semibold text-foreground">{agent.name}</h4>
                                    {activeAgent.id === agent.id && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask anything or type *help to know what I can do!"
                    className="flex-1 pl-28 pr-24 py-4 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center gap-2 pr-2">
                    <button
                      type="button"
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                      aria-label="Voice input"
                    >
                      <Mic className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className={`p-2.5 rounded-full transition-all ${message.trim() ? "bg-gradient-to-r from-[#A16AE8] to-[#8096FD] hover:shadow-lg hover:scale-105" : "bg-muted"}`}
                      aria-label="Send message"
                    >
                      <ArrowUp className={`w-5 h-5 ${message.trim() ? "text-white" : "text-muted-foreground"}`} />
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-6">{renderSuggestions()}</div>

              <footer className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">Teamified AI can make mistakes. Check important info.</p>
              </footer>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto pt-8 pb-8 space-y-6">
            {messages.map((msg, index) => {
              const isLastUserMessage = msg.type === "user" && index === messages.map((m) => m.type).lastIndexOf("user")
              const isLastMessage = index === messages.length - 1
              const messageAgent = msg.agentId ? AI_AGENTS.find((a) => a.id === msg.agentId) : activeAgent
              return (
                <div
                  key={msg.id}
                  ref={isLastUserMessage ? lastUserMessageRef : isLastMessage ? lastMessageRef : null}
                  className="message-enter"
                >
                  {msg.isAgentSwitch && (
                    <div className="flex items-center gap-4 mb-8 mt-8">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: messageAgent?.color }}
                        >
                          <span className="text-xs">{messageAgent?.icon}</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          Switched to {messageAgent?.name}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>
                  )}

                  {msg.type === "user" ? (
                    <div className="flex justify-end mb-6">
                      <div className="max-w-[80%] px-5 py-3 rounded-3xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white shadow-lg">
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: messageAgent?.color }}
                        >
                          <span className="text-lg">{messageAgent?.icon}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">{messageAgent?.name}</span>
                      </div>
                      {msg.thinkingTime && (
                        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">Thought for {msg.thinkingTime}s</span>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      )}
                      <div className="space-y-4">
                        <MarkdownRenderer content={msg.content} />

                        {msg.responseType === "code" && (
                          <div className="rounded-2xl overflow-hidden border border-border bg-card">
                            <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
                              <span className="text-xs font-mono text-muted-foreground">server.js</span>
                              <button
                                onClick={() => navigator.clipboard.writeText(codeSnippet)}
                                className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg hover:bg-accent transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                Copy code
                              </button>
                            </div>
                            <div className="p-4 overflow-x-auto">
                              <pre className="text-xs font-mono leading-relaxed">
                                <code className="text-foreground">{codeSnippet}</code>
                              </pre>
                            </div>
                          </div>
                        )}

                        {msg.responseType === "table" && (
                          <div className="rounded-2xl overflow-hidden border border-border bg-card">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border bg-muted">
                                    {tableData.headers.map((header) => (
                                      <th key={header} className="px-4 py-3 text-left font-medium text-foreground">
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableData.rows.map((row, idx) => (
                                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-accent/50">
                                      {row.map((cell, cellIdx) => (
                                        <td key={cellIdx} className="px-4 py-3 text-foreground">
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {msg.responseType === "file" && (
                          <div className="rounded-2xl border border-border bg-card p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#A16AE8] to-[#8096FD] flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground mb-1">candidate-resume.pdf</h4>
                                <p className="text-xs text-muted-foreground mb-3">2.4 MB • PDF Document</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handlePreviewClick("pdf")}
                                    className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white hover:shadow-lg transition-all"
                                  >
                                    Preview
                                  </button>
                                  <button className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-accent transition-colors flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Download
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {msg.responseType === "image" && (
                          <div className="rounded-2xl border border-border bg-card p-4">
                            <img
                              src="/dashboard-analytics-interface.png"
                              alt="Dashboard preview"
                              className="w-full rounded-xl"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {isThinking && (
              <div className="mb-6 message-enter">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: activeAgent.color }}
                  >
                    <span className="text-lg">{activeAgent.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{activeAgent.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Thinking</span>
                  <div className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#A16AE8] animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#8096FD] animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#A16AE8] animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {!isCentered && (
        <div className="px-6 pb-6">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-center bg-card border border-border rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="absolute left-4 flex items-center gap-1">
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                    aria-label="Add attachment"
                  >
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <div className="relative" ref={agentDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                      className="p-1.5 rounded-lg hover:bg-accent transition-all group"
                      aria-label="Select AI Agent"
                      title={activeAgent.name}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: activeAgent.color }}
                      >
                        <span className="text-base">{activeAgent.icon}</span>
                      </div>
                    </button>
                    {isAgentDropdownOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
                        <div className="p-3 border-b border-border bg-muted">
                          <h3 className="text-sm font-semibold text-foreground">Select AI Agent</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {AI_AGENTS.map((agent) => (
                            <button
                              key={agent.id}
                              type="button"
                              onClick={() => handleAgentChange(agent)}
                              className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors text-left ${activeAgent.id === agent.id ? "bg-accent/50" : ""}`}
                            >
                              <div
                                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: agent.color }}
                              >
                                <span className="text-xl">{agent.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-semibold text-foreground">{agent.name}</h4>
                                  {activeAgent.id === agent.id && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask anything or type *help to know what I can do!"
                  className="flex-1 pl-28 pr-24 py-4 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
                <div className="flex items-center gap-2 pr-2">
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                    aria-label="Voice input"
                  >
                    <Mic className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className={`p-2.5 rounded-full transition-all ${message.trim() ? "bg-gradient-to-r from-[#A16AE8] to-[#8096FD] hover:shadow-lg hover:scale-105" : "bg-muted"}`}
                    aria-label="Send message"
                  >
                    <ArrowUp className={`w-5 h-5 ${message.trim() ? "text-white" : "text-muted-foreground"}`} />
                  </button>
                </div>
              </div>
            </form>

            <footer className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">Teamified AI can make mistakes. Check important info.</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
