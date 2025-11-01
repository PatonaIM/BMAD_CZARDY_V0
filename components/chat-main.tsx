"use client"

import type React from "react"
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
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
  Crown,
  Users,
} from "lucide-react"
import { AI_AGENTS, type AIAgent } from "@/types/agents"
import type { WorkspaceContent } from "@/types/workspace"
import { MarkdownRenderer } from "./markdown-renderer"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

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
  isWelcome?: boolean
  promptSuggestions?: Array<{ text: string; icon: React.ReactNode }>
}

// Define JobListing type for clarity in handleJobApplication
type JobListing = {
  title: string
  company: string
  location: string
  type: string
  salary: string
  jobSummary?: string
  description: string
  skillMatch: number
  // Add other relevant properties as needed
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

const generateWelcomeMessage = (agent: AIAgent, userRole: "candidate" | "hiring_manager"): string => {
  if (userRole === "candidate") {
    return `Hello! Welcome to Teamified AI! I'm **${agent.firstName}**, your **${agent.name}** AI Agent. ${agent.icon}

I'm excited to help you find your next great opportunity! To get started, I've opened a Candidate Profile form in the workspace on the right where you can share your information with me.

${loremParagraphs[0]}

${loremParagraphs[1]}

## Here's what I can help you with:

${loremParagraphs[2]}

${loremParagraphs[3]}

Please take a moment to complete your profile, and then we can start exploring opportunities that match your skills and experience!

What would you like to know about the opportunities we have available?`
  } else {
    return `Hello! Welcome to Teamified AI! I'm **${agent.firstName}**, your **${agent.name}** AI Agent. ${agent.icon}

I'm excited to help you build your team with Teamified! To get started, I've opened the Enterprise Account Setup in the workspace on the right.

## Let's Get Your Company Profile Set Up

${loremParagraphs[0]}

${loremParagraphs[1]}

I'm here to guide you through the setup process and answer any questions you might have about:

- Setting up your company information
- Configuring your hiring preferences
- Understanding our enterprise solutions
- Exploring features that match your needs

${loremParagraphs[2]}

Please take a moment to complete your company profile, and then we can discuss which Teamified solutions would work best for your organization!

What would you like to know as you get started?`
  }
}

const generateProfileSavedMessage = (): string => {
  return `Excellent! Your profile has been saved successfully. 🎉

${loremParagraphs[0]}

Now that I have your information, I can help you in several ways. Here are some things we can do together:`
}

export const ChatMain = forwardRef<
  {
    handleProfileSaved: () => void
    switchAgent: (agentId: string) => void
    showPricingGuidance: () => void
    showPaymentSuccess: () => void
    showMyJobsSummary: (appliedCount: number, savedCount: number) => void // Added showMyJobsSummary
    showJobViewSummary: (job: any) => void // Added showJobViewSummary
    handleJobApplication: (job: JobListing) => void // Added handler for job application
  },
  ChatMainProps
>(({ isSidebarOpen, onToggleSidebar, onOpenWorkspace, initialAgentId, shouldShowWelcome }, ref) => {
  const [inputMessage, setInputMessage] = useState("")
  const [welcomeQuestion, setWelcomeQuestion] = useState("")
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
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const lastUserMessageRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const agentDropdownRef = useRef<HTMLDivElement>(null)

  const {
    messages: aiMessages,
    sendMessage,
    status,
  } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    body: {
      agentId: activeAgent.id,
    },
    initialMessages: [], // Start with an empty array, welcome messages are handled separately
  })

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomeQuestions.length)
    setWelcomeQuestion(welcomeQuestions[randomIndex])
  }, [])

  useEffect(() => {
    if (initialAgentId) {
      const agent = AI_AGENTS.find((a) => a.id === initialAgentId)
      if (agent && agent.id !== activeAgent.id) {
        console.log("[v0] Syncing activeAgent with initialAgentId:", initialAgentId)
        setActiveAgent(agent)
      }
    }
  }, [initialAgentId])

  useEffect(() => {
    if (shouldShowWelcome && initialAgentId) {
      const agent = AI_AGENTS.find((a) => a.id === initialAgentId)
      if (agent) {
        console.log("[v0] Adding welcome message for agent:", agent.name)
        const userRole = agent.id === "technical-recruiter" ? "candidate" : "hiring_manager"
        setLocalMessages([
          {
            id: `welcome-${Date.now()}`,
            type: "ai",
            content: generateWelcomeMessage(agent, userRole),
            agentId: agent.id,
            isAgentSwitch: false,
            isWelcome: true, // Mark as welcome message
          },
        ])
      }
    }
  }, [shouldShowWelcome, initialAgentId])

  useEffect(() => {
    if (!aiMessages) return

    const convertedMessages: Message[] = aiMessages.map((msg) => {
      // Find the corresponding agent if it's an AI message. If not, use the active agent.
      const messageAgent = AI_AGENTS.find((a) => a.id === msg.extra?.agentId) || activeAgent

      let content = ""
      if (msg.parts && msg.parts.length > 0) {
        // Extract from parts array (typical for AI responses)
        content = msg.parts.map((part) => (part.type === "text" ? part.text : "")).join("")
      } else if (msg.content) {
        // Use content directly if parts don't exist (typical for user messages)
        content = typeof msg.content === "string" ? msg.content : ""
      }

      return {
        id: msg.id,
        type: msg.role === "user" ? "user" : "ai",
        content,
        agentId: messageAgent.id,
        responseType: msg.extra?.responseType,
        thinkingTime: msg.extra?.thinkingTime,
        promptSuggestions: msg.extra?.promptSuggestions,
      }
    })

    const aiMessageIds = new Set(convertedMessages.map((m) => m.id))

    // Preserve welcome messages, agent switch messages, and any local messages not from AI
    const preservedLocalMessages = localMessages.filter(
      (m) => !aiMessageIds.has(m.id) && (m.isWelcome || m.isAgentSwitch || m.type === "user"),
    )

    const hasWelcomeMessages = localMessages.some((m) => m.isWelcome)
    const wouldClearWelcome =
      hasWelcomeMessages && preservedLocalMessages.length === 0 && convertedMessages.length === 0

    if (wouldClearWelcome) {
      console.log("[v0] Skipping localMessages update to preserve welcome message")
      return
    }

    const newMessages = [...preservedLocalMessages, ...convertedMessages]

    const messagesChanged =
      newMessages.length !== localMessages.length ||
      newMessages.some((msg, idx) => msg.id !== localMessages[idx]?.id || msg.content !== localMessages[idx]?.content)

    if (messagesChanged) {
      console.log(
        "[v0] Updating localMessages. Preserved:",
        preservedLocalMessages.length,
        "AI:",
        convertedMessages.length,
      )
      setLocalMessages(newMessages)
    }
  }, [aiMessages, activeAgent])

  useEffect(() => {
    if (localMessages.length > 0 && messagesContainerRef.current) {
      if (localMessages.length === 1) {
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
  }, [localMessages, status])

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

  useImperativeHandle(ref, () => ({
    handleProfileSaved: () => {
      setLocalMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content: generateProfileSavedMessage(),
          agentId: activeAgent.id,
          promptSuggestions: [
            { text: "Search for jobs matching my profile", icon: <Briefcase className="w-4 h-4" /> },
            { text: "Review and improve my CV", icon: <FileText className="w-4 h-4" /> },
            { text: "Help me prepare for interviews", icon: <Sparkles className="w-4 h-4" /> },
            {
              text: "Upgrade to Premium for unlimited access",
              icon: <Sparkles className="w-4 h-4 text-[#A16AE8]" />,
            },
          ],
        },
      ])
    },
    switchAgent: (agentId: string) => {
      console.log("[v0] switchAgent called with agentId:", agentId)
      const agent = AI_AGENTS.find((a) => a.id === agentId)
      if (agent) {
        console.log("[v0] Agent found:", agent.name)
        handleAgentChange(agent)
      } else {
        console.log("[v0] Agent not found for id:", agentId)
      }
    },
    showPricingGuidance: () => {
      console.log("[v0] showPricingGuidance called")
      const pricingMessage = `Great! Let's find the perfect plan for your organization. 🎯

I've analyzed our enterprise offerings, and here's what each plan provides:

## 💼 **Basic Plan** - $300/month
Perfect for **small teams** needing payroll and HR essentials. Best if you:
- Need global payroll and tax management
- Want HR record keeping without complexity
- Have a limited budget but need core services

## 🎯 **Recruiter Plan** - 9% of base salary per hire
Ideal for **growing companies** focused on hiring. Best if you:
- Only want to pay when you successfully hire
- Need full recruitment lifecycle support
- Require compliance and onboarding assistance

## ⚡ **Enterprise Plan** - $500/month ⭐ MOST POPULAR
Our **most popular choice**! Best if you:
- Need equipment (laptops, accessories) for your team
- Want smart office locations and workspace setup
- Require full access to all Teamified AI Agents

## 👑 **Premium Plan** - 30% + $300/month 🏆 ALL-IN
The **complete solution** with everything included. Best if you:
- Want dedicated account management
- Need continuous HR and compliance support
- Require equipment, office space, AND premium AI features
- Want dashboarding and analytics capabilities

**Which aspects are most important for your organization?** I can help you compare specific features or answer questions about any plan!`

      setLocalMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content: pricingMessage,
          agentId: activeAgent.id,
          promptSuggestions: [
            { text: "Compare Basic vs Enterprise plans", icon: <Building2 className="w-4 h-4" /> },
            { text: "What's included in the Premium plan?", icon: <Crown className="w-4 h-4" /> },
            { text: "How does the Recruiter plan pricing work?", icon: <Users className="w-4 h-4" /> },
            { text: "Which plan is best for a 50-person team?", icon: <Briefcase className="w-4 h-4" /> },
          ],
        },
      ])
    },
    showPaymentSuccess: () => {
      console.log("[v0] showPaymentSuccess called")
      const congratsMessage = `Congratulations! Your payment has been successfully processed! 🎉

Welcome to Teamified Enterprise! You now have full access to all our premium features and AI agents.

## What's Next?

Now that your account is set up, let's get you started with building your team! Here are some things we can do together:

**Create Your First Job Opening** - I can help you craft compelling job descriptions that attract top talent. Just tell me about the role you're looking to fill.

**Set Up Your Hiring Pipeline** - Let's configure your recruitment workflow, interview stages, and evaluation criteria.

**Explore AI Agent Capabilities** - Discover how our specialized AI agents can streamline your entire hiring process.

**Import Existing Job Postings** - Already have job descriptions? I can help you import and optimize them for better results.

${loremParagraphs[0]}

I'm here to help you every step of the way. What would you like to start with?`

      setLocalMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content: congratsMessage,
          agentId: activeAgent.id,
          promptSuggestions: [
            { text: "Create a new job opening", icon: <Briefcase className="w-4 h-4" /> },
            { text: "Show me how to write a job description", icon: <FileText className="w-4 h-4" /> },
            { text: "Set up my hiring pipeline", icon: <Building2 className="w-4 h-4" /> },
            { text: "Explore all AI agent features", icon: <Sparkles className="w-4 h-4" /> },
          ],
        },
      ])
    },
    showMyJobsSummary: (appliedCount: number, savedCount: number) => {
      console.log("[v0] showMyJobsSummary called with applied:", appliedCount, "saved:", savedCount)

      const summaryMessage = `Great to see you exploring opportunities! Let me give you a quick summary of your job activity. 📊

## Your Job Activity

**Applied Jobs:** ${appliedCount} ${appliedCount === 1 ? "position" : "positions"}
${appliedCount > 0 ? "You've taken the first step by applying to these roles. I'll help you track your applications and prepare for interviews." : "You haven't applied to any jobs yet. Let me help you find positions that match your skills!"}

**Saved Jobs:** ${savedCount} ${savedCount === 1 ? "position" : "positions"}
${savedCount > 0 ? "These are jobs you're interested in but haven't applied to yet. Ready to take the next step?" : "You haven't saved any jobs yet. When you find interesting positions, save them to review later!"}

${loremParagraphs[0]}

## What Would You Like to Do Next?

I can help you with your job search in several ways. Whether you want to refine your applications, prepare for interviews, or explore new opportunities, I'm here to assist!

${loremParagraphs[1]}`

      setLocalMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content: summaryMessage,
          agentId: activeAgent.id,
          promptSuggestions: [
            { text: "Help me apply to my saved jobs", icon: <Briefcase className="w-4 h-4" /> },
            { text: "Find more jobs matching my profile", icon: <Briefcase className="w-4 h-4" /> },
            { text: "Prepare me for upcoming interviews", icon: <Sparkles className="w-4 h-4" /> },
            { text: "Review and improve my resume", icon: <FileText className="w-4 h-4" /> },
          ],
        },
      ])
    },
    showJobViewSummary: (job: JobListing) => {
      console.log("[v0] showJobViewSummary called for job:", job.title)

      const skillMatchText =
        job.skillMatch >= 80 ? "excellent match" : job.skillMatch >= 60 ? "good match" : "moderate match"

      const summaryMessage = `Great choice! Let me give you a quick overview of this opportunity. 📋

## ${job.title} at ${job.company}

**Location:** ${job.location} | **Type:** ${job.type} | **Salary:** ${job.salary}

**Your Skill Match:** ${job.skillMatch}% - This is ${skillMatchText === "excellent match" ? "an" : "a"} **${skillMatchText}** for your profile! ${job.skillMatch >= 80 ? "🎯" : job.skillMatch >= 60 ? "✨" : "💡"}

### Quick Summary

${job.jobSummary ? job.jobSummary.split("\n").slice(0, 3).join("\n") : job.description}

${loremParagraphs[0]}

### What I Can Help You With

I'm here to support you through every step of the application process. Whether you want to apply now, save this for later, or prepare yourself better, I've got you covered!

${loremParagraphs[1]}`

      setLocalMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content: summaryMessage,
          agentId: activeAgent.id,
          promptSuggestions: [
            { text: "Apply to this Job", icon: <Briefcase className="w-4 h-4" /> },
            { text: "Save this job for later", icon: <FileText className="w-4 h-4" /> },
            { text: "Take AI Assessments to increase Skill Match Score", icon: <Sparkles className="w-4 h-4" /> },
            { text: "Take Mock AI Interviews to prepare for this job", icon: <Sparkles className="w-4 h-4" /> },
          ],
        },
      ])
    },
    handleJobApplication: (job: JobListing) => {
      console.log("[v0] handleJobApplication called for job:", job.title)

      console.log("[v0] Dispatching interview-option-selected event immediately")
      window.dispatchEvent(new CustomEvent("interview-option-selected"))
      console.log("[v0] Event dispatched: interview-option-selected")

      // Send "Apply to this job" command to chat
      handleCommandOrMessage("Apply to this job")
    },
  }))

  const handlePreviewClick = (fileType: string) => {
    onOpenWorkspace({ type: "pdf", title: "candidate-resume.pdf" })
  }

  const handleReopenWorkspace = () => {
    if (lastWorkspaceContent) {
      onOpenWorkspace(lastWorkspaceContent)
    }
  }

  const handleCommandOrMessage = (text: string) => {
    const lowerText = text.toLowerCase().trim()

    // 1. Simple Text - handled at the end (default case)

    // 2. Large Text
    if (lowerText === "large text") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateLargeResponse(),
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])
      return true
    }

    // 3. Bullet Text
    if (lowerText === "bullet text") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateBulletResponse(),
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])
      return true
    }

    // 4. PDF (with file attachment, no preview change)
    if (lowerText === "pdf") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateShortResponse(),
        responseType: "file",
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])
      return true
    }

    // 5. PDF Preview (opens PDF viewer in workspace)
    if (lowerText === "pdf preview") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateLargeResponse(),
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])

      // Open PDF viewer in workspace
      onOpenWorkspace({ type: "pdf", title: "candidate-resume.pdf" })
      setHasOpenedWorkspace(true)
      setLastWorkspaceContent({ type: "pdf", title: "candidate-resume.pdf" })

      return true
    }

    // 6. Table (with tabular data, no preview change)
    if (lowerText === "table") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateShortResponse(),
        responseType: "table",
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])
      return true
    }

    // 7. Table Preview (opens table workspace)
    if (lowerText === "table preview") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateLargeResponse(),
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])

      // Open table workspace
      onOpenWorkspace({ type: "table", title: "Candidate Table" })
      setHasOpenedWorkspace(true)
      setLastWorkspaceContent({ type: "table", title: "Candidate Table" })

      return true
    }

    // 8. Image (with image thumbnail, no preview change)
    if (lowerText === "image") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateShortResponse(),
        responseType: "image",
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])
      return true
    }

    // 9. Image Preview (opens large image preview with next/prev)
    if (lowerText === "image preview") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateLargeResponse(),
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])

      // Open image preview workspace
      onOpenWorkspace({ type: "image", title: "Image Gallery" })
      setHasOpenedWorkspace(true)
      setLastWorkspaceContent({ type: "image", title: "Image Gallery" })

      return true
    }

    // 10. Video Preview (opens video player with transcriptions)
    if (lowerText === "video preview") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateLargeResponse(),
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])

      // Open video player workspace
      onOpenWorkspace({ type: "video", title: "Video Player" })
      setHasOpenedWorkspace(true)
      setLastWorkspaceContent({ type: "video", title: "Video Player" })

      return true
    }

    // 11. Code (with code snippet, no preview change)
    if (lowerText === "code" || lowerText === "show code") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateShortResponse(),
        responseType: "code",
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])
      return true
    }

    // 12. Code Preview (opens code preview with file structure)
    if (lowerText === "code preview") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateLargeResponse(),
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])

      // Open code preview workspace
      onOpenWorkspace({ type: "code", title: "server.js", data: codeSnippet })
      setHasOpenedWorkspace(true)
      setLastWorkspaceContent({ type: "code", title: "server.js", data: codeSnippet })

      return true
    }

    // 13. Job Board (opens job board grid)
    if (lowerText === "job board") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateLargeResponse(),
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])

      // Open job board workspace
      onOpenWorkspace({ type: "job-board", title: "Available Positions" })
      setHasOpenedWorkspace(true)
      setLastWorkspaceContent({ type: "job-board", title: "Available Positions" })

      return true
    }

    // 14. Data Analytics (opens data analytics with charts)
    if (lowerText === "data") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateLargeResponse(),
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])

      // Open data analytics workspace
      onOpenWorkspace({ type: "analytics", title: "Recruitment Analytics" })
      setHasOpenedWorkspace(true)
      setLastWorkspaceContent({ type: "analytics", title: "Recruitment Analytics" })

      return true
    }

    // 15. Apply to this job (shows interview options)
    if (lowerText === "apply to this job") {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        agentId: activeAgent.id,
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `# AI Interview (Recommended)

Take an AI-powered interview that provides instant feedback and speeds up your application process. Our AI interviews are designed to assess your skills efficiently and give you immediate results.

**Benefits:**
- ⚡ Instant scheduling - start immediately
- 🎯 Personalized questions based on the role
- 📊 Immediate feedback and results
- 🚀 Priority consideration by hiring managers

# Traditional Interview

Schedule a traditional interview with our hiring team. This option follows the standard recruitment process with human interviewers.

**What to expect:**
- 📅 Scheduled at mutual convenience
- 👥 Interview with hiring managers
- ⏰ Standard processing time
- 📋 Traditional evaluation process

**Please note:** We prioritize candidates who choose AI interviews as it significantly speeds up the hiring process and allows us to move faster with qualified candidates. AI interview candidates typically receive responses within 24-48 hours, while traditional interviews may take 1-2 weeks to schedule and complete.

Which interview format would you prefer?`,
        agentId: activeAgent.id,
        promptSuggestions: [
          { text: "I'd like to schedule an AI interview", icon: <Sparkles className="w-4 h-4" /> },
          { text: "I prefer a traditional interview", icon: <Users className="w-4 h-4" /> },
        ],
      }

      setLocalMessages((prev) => [...prev, userMsg, aiMsg])
      return true
    }

    // Not a command, return false to send to OpenAI
    return false
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      const isCommand = handleCommandOrMessage(inputMessage)
      if (!isCommand) {
        sendMessage(inputMessage)
      }
      setInputMessage("")
    }
  }

  const handleSuggestionClick = (suggestionText: string) => {
    setInputMessage(suggestionText)
  }

  const handlePromptSuggestionClick = (suggestionText: string) => {
    console.log("[v0] Prompt suggestion clicked:", suggestionText)
    handleCommandOrMessage(suggestionText)
  }

  const handleAgentChange = (agent: AIAgent) => {
    console.log("[v0] handleAgentChange called with agent:", agent.name)
    setActiveAgent(agent)
    setIsAgentDropdownOpen(false)

    const introMessage = generateAgentIntroduction(agent)
    console.log("[v0] Adding agent introduction message to chat")

    setLocalMessages((prev) => [
      ...prev,
      {
        id: `agent-switch-${Date.now()}`,
        type: "ai",
        content: introMessage,
        agentId: agent.id,
        isAgentSwitch: true,
      },
    ])
  }

  const isCentered = localMessages.length === 0 && aiMessages.length === 0
  const isThinking = status === "in_progress"

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
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-background">
      <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-background">
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
        className={`flex-1 min-h-0 px-6 relative bg-background ${isCentered ? "flex items-center justify-center" : "flex flex-col overflow-y-auto"}`}
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
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
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
                      disabled={!inputMessage.trim() || isThinking}
                      className={`p-2.5 rounded-full transition-all ${inputMessage.trim() && !isThinking ? "bg-gradient-to-r from-[#A16AE8] to-[#8096FD] hover:shadow-lg hover:scale-105" : "bg-muted"}`}
                      aria-label="Send message"
                    >
                      <ArrowUp
                        className={`w-5 h-5 ${inputMessage.trim() && !isThinking ? "text-white" : "text-muted-foreground"}`}
                      />
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
            {localMessages.map((msg, index) => {
              const isLastUserMessage =
                msg.type === "user" && index === localMessages.map((m) => m.type).lastIndexOf("user")
              const isLastMessage = index === localMessages.length - 1
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

                        {msg.promptSuggestions && msg.promptSuggestions.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            {msg.promptSuggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handlePromptSuggestionClick(suggestion.text)}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-left rounded-xl border border-border hover:bg-accent hover:border-[#A16AE8] transition-all group"
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#A16AE8]/10 to-[#8096FD]/10 flex items-center justify-center group-hover:from-[#A16AE8]/20 group-hover:to-[#8096FD]/20 transition-all">
                                  {suggestion.icon}
                                </div>
                                <span className="flex-1">{suggestion.text}</span>
                              </button>
                            ))}
                          </div>
                        )}

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
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
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
                    disabled={!inputMessage.trim() || isThinking}
                    className={`p-2.5 rounded-full transition-all ${inputMessage.trim() && !isThinking ? "bg-gradient-to-r from-[#A16AE8] to-[#8096FD] hover:shadow-lg hover:scale-105" : "bg-muted"}`}
                    aria-label="Send message"
                  >
                    <ArrowUp
                      className={`w-5 h-5 ${inputMessage.trim() && !isThinking ? "text-white" : "text-muted-foreground"}`}
                    />
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
})

ChatMain.displayName = "ChatMain"
