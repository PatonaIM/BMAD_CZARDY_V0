"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Menu, Plus, Mic, ArrowUp, Copy, Download, FileText, ChevronDown } from "lucide-react"

interface ChatMainProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  responseType?: "text" | "code" | "table" | "file"
  thinking?: boolean
  thinkingTime?: number
}

const welcomeQuestions = [
  "What brings you here today — a new role or a new hire?",
  "Ready to meet your next big opportunity?",
  "Who are we helping you find — your dream job or your next top performer?",
  "What's your next move in the world of work?",
  "Looking to join a team or build one?",
  "Shall we match the right person to the right role?",
  "What do you want to discover today — talent or opportunity?",
  "Is it time to start your next interview, or open your next role?",
  "How can AI help you move your career or company forward today?",
  "Ready to see what Teamified AI can do for your hiring journey?",
]

const loremParagraphs = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
  "Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.",
  "Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis.",
  "Id tincidunt sapien vel quam. Duis lobortis massa imperdiet quam. Suspendisse potenti. Pellentesque commodo eros a enim. Vestibulum turpis sem, aliquet eget, lobortis pellentesque, rutrum eu, nisl.",
]

const loremBullets = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris",
  "Duis aute irure dolor in reprehenderit in voluptate velit",
  "Excepteur sint occaecat cupidatat non proident",
  "Sunt in culpa qui officia deserunt mollit anim id est laborum",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur",
  "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet",
]

const generateShortResponse = () => {
  return loremParagraphs[0]
}

const generateLargeResponse = () => {
  const mainContent = loremParagraphs.slice(0, 6).join("\n\n")
  const summary = `**In Summary**\n\n${loremParagraphs[6]}\n\n${loremParagraphs[7]}`
  return `${mainContent}\n\n${summary}`
}

const generateBulletResponse = () => {
  const intro = loremParagraphs[0]
  const bullets = loremBullets.map((bullet) => `• ${bullet}`).join("\n")
  const conclusion = loremParagraphs[1]
  return `${intro}\n\n${bullets}\n\n${conclusion}`
}

const generateVariedLoremIpsum = () => {
  const responseTypes = ["short", "medium", "long", "bullets"]
  const randomType = responseTypes[Math.floor(Math.random() * responseTypes.length)]

  switch (randomType) {
    case "short":
      return loremParagraphs[0]
    case "medium":
      return loremParagraphs.slice(0, 2).join("\n\n")
    case "long":
      const numParagraphs = Math.floor(Math.random() * 3) + 3 // 3-5 paragraphs
      return loremParagraphs.slice(0, numParagraphs).join("\n\n")
    case "bullets":
      const numBullets = Math.floor(Math.random() * 3) + 3 // 3-5 bullets
      const intro = loremParagraphs[0]
      const bullets = loremBullets
        .slice(0, numBullets)
        .map((bullet) => `• ${bullet}`)
        .join("\n")
      return `${intro}\n\n${bullets}`
    default:
      return loremParagraphs[0]
  }
}

const codeSnippet = `import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

/**
 * Issue a short-lived Realtime session token to the browser.
 * Never expose your real API key to the client.
 */
app.get("/session", async (req, res) => {
  const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-realtime-2025-08-20",
      voice: "alloy"
    }),
  });
  
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log("Server running on port 3000"));`

const tableData = {
  headers: ["Candidate", "Position", "Experience", "Status", "Match Score"],
  rows: [
    ["Sarah Johnson", "Senior Full-Stack Developer", "8 years", "Interview Scheduled", "95%"],
    ["Michael Chen", "AI Engineer", "5 years", "Under Review", "88%"],
    ["Emily Rodriguez", "Product Manager", "6 years", "Offer Extended", "92%"],
    ["David Kim", "DevOps Engineer", "7 years", "Technical Assessment", "85%"],
    ["Jessica Taylor", "UX Designer", "4 years", "Phone Screen", "90%"],
  ],
}

export function ChatMain({ isSidebarOpen, onToggleSidebar }: ChatMainProps) {
  const [message, setMessage] = useState("")
  const [welcomeQuestion, setWelcomeQuestion] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastUserMessageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomeQuestions.length)
    setWelcomeQuestion(welcomeQuestions[randomIndex])
  }, [])

  useEffect(() => {
    // Small delay to ensure DOM has updated
    const timer = setTimeout(() => {
      if (lastUserMessageRef.current) {
        lastUserMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [messages, isThinking])

  const simulateAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase().trim()
    let responseType: "text" | "code" | "table" | "file" = "text"
    let content = ""

    if (lowerMessage === "test") {
      content = generateShortResponse()
    } else if (lowerMessage === "test large") {
      content = generateLargeResponse()
    } else if (lowerMessage === "bullet") {
      content = generateBulletResponse()
    } else if (lowerMessage.includes("code")) {
      responseType = "code"
      content = generateVariedLoremIpsum()
    } else if (lowerMessage.includes("table")) {
      responseType = "table"
      content = generateVariedLoremIpsum()
    } else if (lowerMessage.includes("file")) {
      responseType = "file"
      content = generateVariedLoremIpsum()
    } else {
      content = generateVariedLoremIpsum()
    }

    setIsThinking(true)
    const thinkingTime = Math.floor(Math.random() * 20) + 15 // 15-35 seconds

    setTimeout(() => {
      setIsThinking(false)
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: "ai",
        content,
        responseType,
        thinkingTime,
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: message,
      }
      setMessages((prev) => [...prev, userMessage])

      simulateAIResponse(message)
      setMessage("")
    }
  }

  const handleSuggestionClick = (suggestionText: string) => {
    setMessage(suggestionText)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 text-center">
          <span className="text-sm font-medium">Teamified AI</span>
        </div>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-3xl">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#A16AE8] to-[#8096FD] mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-white">T</span>
                </div>
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#A16AE8] to-[#8096FD] bg-clip-text text-transparent">
                  Teamified AI
                </h1>
                <p className="text-2xl text-muted-foreground mb-8">{welcomeQuestion}</p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
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
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-8 space-y-6">
            {messages.map((msg, index) => {
              const isLastUserMessage = msg.type === "user" && index === messages.map((m) => m.type).lastIndexOf("user")
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
                                onClick={copyCode}
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
                                  <button className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white hover:shadow-lg transition-all">
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
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {isThinking && (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 rounded-full bg-[#A16AE8] animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-[#8096FD] animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-[#A16AE8] animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="px-6 pb-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center bg-card border border-border rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <button
                type="button"
                className="absolute left-4 p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Add attachment"
              >
                <Plus className="w-5 h-5 text-muted-foreground" />
              </button>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask anything"
                className="flex-1 px-14 py-4 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
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
                  className={`p-2.5 rounded-full transition-all ${
                    message.trim()
                      ? "bg-gradient-to-r from-[#A16AE8] to-[#8096FD] hover:shadow-lg hover:scale-105"
                      : "bg-muted"
                  }`}
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
    </div>
  )
}
