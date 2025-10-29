"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Menu, Plus, Mic, ArrowUp, Copy, Download, FileText, ChevronDown } from "lucide-react"
import { AI_AGENTS, type AIAgent } from "@/types/agents"
import type { WorkspaceContent } from "@/types/workspace"

interface ChatMainProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  onOpenWorkspace: (content: WorkspaceContent) => void
}

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  responseType?: "text" | "code" | "table" | "file" | "image"
  thinking?: boolean
  thinkingTime?: number
  agentId?: string
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
  const summary = `\n\n**In Summary**\n\n${loremParagraphs[6]}\n\n${loremParagraphs[7]}`
  return `${mainContent}${summary}`
}

const generateBulletResponse = () => {
  const intro = loremParagraphs[0]
  const bullets = loremBullets.map((bullet) => `• ${bullet}`).join("\n")
  const summary = `\n\n**Summary**\n\n${loremParagraphs[1]}`
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

export function ChatMain({ isSidebarOpen, onToggleSidebar, onOpenWorkspace }: ChatMainProps) {
  const [message, setMessage] = useState("")
  const [welcomeQuestion, setWelcomeQuestion] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [activeAgent, setActiveAgent] = useState<AIAgent>(AI_AGENTS[0])
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false)
  const lastUserMessageRef = useRef<HTMLDivElement>(null)
  const agentDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomeQuestions.length)
    setWelcomeQuestion(welcomeQuestions[randomIndex])
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (lastUserMessageRef.current) {
        lastUserMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
    return () => clearTimeout(timer)
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

    // Command routing
    if (lowerMessage === "large text") {
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
      // Default: simple text response
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

      // Open workspace if needed
      if (shouldOpenWorkspace && workspaceContent) {
        setTimeout(() => onOpenWorkspace(workspaceContent), 100)
      }
    }, 2000)
  }

  const handlePreviewClick = (fileType: string) => {
    onOpenWorkspace({ type: "pdf", title: "candidate-resume.pdf" })
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
        content: `Switched to **${agent.name}**. ${agent.description}`,
        agentId: agent.id,
      },
    ])
  }

  const isCentered = messages.length === 0

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
        <div className="w-10 flex-shrink-0" />
      </header>

      <main
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
                    placeholder="Ask anything"
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

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { text: "Help me land a job offer for an open role", emoji: "💼" },
                  { text: "Calculate sample quotation for me", emoji: "💰" },
                  { text: "Open a job for my company", emoji: "📢" },
                  { text: "Tell me more about Teamified AI", emoji: "🤖" },
                ].map((suggestion) => (
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

              <footer className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">Teamified AI can make mistakes. Check important info.</p>
              </footer>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-8 space-y-6">
            {messages.map((msg, index) => {
              const isLastUserMessage = msg.type === "user" && index === messages.map((m) => m.type).lastIndexOf("user")
              const messageAgent = msg.agentId ? AI_AGENTS.find((a) => a.id === msg.agentId) : activeAgent
              return (
                <div key={msg.id} ref={isLastUserMessage ? lastUserMessageRef : null}>
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
                        <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">{msg.content}</div>

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
                  placeholder="Ask anything"
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

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { text: "Help me land a job offer for an open role", emoji: "💼" },
                { text: "Calculate sample quotation for me", emoji: "💰" },
                { text: "Open a job for my company", emoji: "📢" },
                { text: "Tell me more about Teamified AI", emoji: "🤖" },
              ].map((suggestion) => (
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

            <footer className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">Teamified AI can make mistakes. Check important info.</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
