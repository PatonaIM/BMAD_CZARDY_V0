"use client"

import type React from "react"
import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from "react"
import {
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
  Code,
  MessageSquare,
  CheckCircle,
} from "lucide-react"
import { AI_AGENTS, type AIAgent } from "@/types/agents"
import type { WorkspaceContent } from "@/types/workspace"
import { MarkdownRenderer } from "./markdown-renderer"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { getCandidateConversation, saveCandidateMessage } from "@/lib/mock-conversations"
import { VoiceMode, type VoiceModeRef } from "./voice-mode" // Changed import to include type VoiceModeRef
import { detectCommandIntent } from "@/app/actions/detect-command-intent"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  responseType?: "text" | "code" | "table" | "file" | "image" | "challenge-button" // Added challenge-button
  thinking?: boolean
  thinkingTime?: number
  agentId?: string
  isAgentSwitch?: boolean // Added flag to indicate agent switch messages
  isWelcome?: boolean
  promptSuggestions?: Array<{ text: string; icon: React.ReactNode }>
  // Added for action button
  hasActionButton?: boolean
  actionButtonText?: string
  actionButtonHandler?: string
  avatar?: string // Profile picture URL for candidate messages
  senderName?: string // Full name of the sender
  timestamp?: string // Timestamp for the message
  // </CHANGE>
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
  matchedCandidates?: Array<{
    id: string
    name: string
    skillMatch?: number
    skills?: string[]
    experience?: string
    takeHomeChallengeScore?: number
    location?: string
  }>
  // Add other relevant properties as needed
}

// Define CandidateProfile type for clarity
type CandidateProfile = {
  id: string
  name: string
  avatar?: string
  skillMatch?: number
  experience?: string
  location?: string
  skills?: string[]
  takeHomeChallengeScore?: number
  // </CHANGE>
  title?: string // Added for candidate-profile-view context
  summary?: string // Added for candidate-profile-view context
  email?: string // Added for candidate-profile-view context
  phone?: string // Added for candidate-profile-view context
  linkedin?: string // Added for candidate-profile-view context
  github?: string // Added for candidate-profile-view context
  takeHomeChallengeStatus?: string // Added for candidate-profile-view context
  aiInterviewStatus?: string // Added for candidate-profile-view context
  aiInterviewScore?: number // Added for candidate-profile-view context
  aiGeneratedInsights?: string[] // Added for candidate-profile-view context
  // </CHANGE>
}

// Define ChatMainRef for forwardRef
interface ChatMainRef {
  handleProfileSaved: () => void
  switchAgent: (agentId: string) => void
  showPricingGuidance: () => void
  showPaymentSuccess: () => void
  showMyJobsSummary: (appliedCount: number, savedCount: number) => void // Added showMyJobsSummary
  showJobViewSummary: (job: JobListing) => void // Added showJobViewSummary
  handleJobApplication: (job: JobListing) => void // Added handler for job application
  handleStartChallenge: () => void // Added handler for challenge button click
  handleSubmitChallengeRequest: () => void
  handleSubmissionComplete: () => void
  // </CHANGE>
  sendMessageFromWorkspace: (message: string) => void
  sendAIMessageFromWorkspace: (message: string, agentId?: string) => void // Added method to send AI messages from workspace
  // </CHANGE>
  showJobBoardSummary: () => void
  showCandidateChat: (candidate: CandidateProfile) => void // Updated type to CandidateProfile
  introduceMatchedCandidate: (
    candidate: CandidateProfile, // Updated type to CandidateProfile
    hiringManagerName: string,
    position: string,
    company: string,
  ) => void
  sendCandidateInsights: (candidate: CandidateProfile) => void // Added sendCandidateInsights, updated type
  showJobInsights: (job: JobListing) => void
  // </CHANGE>
  clearMessages: () => void // Expose clearMessages method
}

export interface ChatMainProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  onOpenWorkspace: (content: WorkspaceContent) => void
  initialAgentId?: string | null
  shouldShowWelcome?: boolean
  currentWorkspaceContent?: WorkspaceContent
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
  "Totam aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
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

const codeSnippet = `from flask import Flask, jsonify, request
import os
import requests

app = Flask(__name__)

@app.route('/session', methods=['GET'])
def get_session():
    api_key = os.environ.get('API_KEY')
    response = requests.post(
        'https://api.example.com/v1/sessions',
        headers={'Authorization': f'Bearer {api_key}'},
        json={'model': 'gpt-4'}
    )
    data = response.json()
    return jsonify(data)

if __name__ == '__main__':
    app.run(port=3000, debug=True)`

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

const formatWorkspaceContext = (content: WorkspaceContent | undefined): string => {
  if (!content) {
    console.log("[v0] No workspace content available")
    return ""
  }

  console.log("[v0] Formatting workspace context for type:", content.type)

  let context = "\n\n**CURRENT WORKSPACE CONTEXT:**\n"

  switch (content.type) {
    case "candidate-profile-view":
    case "candidate-profile":
      if (content.candidate) {
        const c = content.candidate
        context += `The user is currently viewing a candidate profile:\n`
        context += `- Name: ${c.name}\n`
        context += `- Title: ${c.title}\n`
        context += `- Location: ${c.location}\n`
        context += `- Experience: ${c.experience}\n`
        context += `- Skills: ${c.skills.join(", ")}\n`
        context += `- Skill Match: ${c.skillMatch}%\n`
        context += `- Summary: ${c.summary}\n`
        if (c.email) context += `- Email: ${c.email}\n`
        if (c.phone) context += `- Phone: ${c.phone}\n`
        if (c.linkedin) context += `- LinkedIn: ${c.linkedin}\n`
        if (c.github) context += `- GitHub: ${c.github}\n`
        context += `- Take Home Challenge: ${c.takeHomeChallengeStatus}\n`
        if (c.takeHomeChallengeScore) context += `- Challenge Score: ${c.takeHomeChallengeScore}%\n`
        context += `- AI Interview: ${c.aiInterviewStatus}\n`
        if (c.aiInterviewScore) context += `- Interview Score: ${c.aiInterviewScore}%\n`
        if (c.aiGeneratedInsights.length > 0) {
          context += `- AI Insights: ${c.aiGeneratedInsights.join("; ")}\n`
        }
      } else {
        console.log("[v0] Candidate profile workspace has no candidate data")
      }
      break

    case "browse-candidates":
      if (content.candidates && content.candidates.length > 0) {
        context += `The user is browsing candidates. There are ${content.candidates.length} candidates available.\n`
        if (content.currentCandidateIndex !== undefined) {
          const currentCandidate = content.candidates[content.currentCandidateIndex]
          if (currentCandidate) {
            context += `Currently viewing: ${currentCandidate.name} (${currentCandidate.title})\n`
          }
        }
      } else {
        console.log("[v0] Browse candidates workspace has no candidates")
      }
      break

    case "job-view":
      if (content.job) {
        const j = content.job
        context += `The user is currently viewing a job posting:\n`
        context += `- Title: ${j.title}\n`
        context += `- Company: ${j.company}\n`
        context += `- Location: ${j.location}\n`
        context += `- Type: ${j.type}\n`
        context += `- Salary: ${j.salary}\n`
        context += `- Posted: ${j.posted}\n`
        if (j.description) context += `- Description: ${j.description}\n`
        if (j.requirements && j.requirements.length > 0) {
          context += `- Requirements: ${j.requirements.join("; ")}\n`
        }
        if (j.applied) context += `- Status: Already applied\n`
        if (j.saved) context += `- Status: Saved\n`
        if (j.skillMatch) context += `- Skill Match: ${j.skillMatch}%\n`
        if (j.applicationStage) context += `- Application Stage: ${j.applicationStage}\n`
      } else {
        console.log("[v0] Job view workspace has no job data")
      }
      break

    case "job-board":
      context += `The user is viewing the job board with available positions.\n`
      if (content.data?.jobs) {
        const jobs = content.data.jobs
        const appliedJobs = jobs.filter((j: JobListing) => j.applied)
        const savedJobs = jobs.filter((j: JobListing) => j.saved)
        context += `- Total jobs: ${jobs.length}\n`
        context += `- Applied jobs: ${appliedJobs.length}\n`
        context += `- Saved jobs: ${savedJobs.length}\n`
      } else {
        console.log("[v0] Job board workspace has no jobs data")
      }
      break

    case "candidate-swipe":
      if (content.candidates && content.candidates.length > 0) {
        context += `The user is in candidate swipe mode with ${content.candidates.length} candidates.\n`
      } else {
        console.log("[v0] Candidate swipe workspace has no candidates")
      }
      break

    default:
      if (content.title) {
        context += `The user is viewing: ${content.title}\n`
      } else {
        console.log("[v0] Unknown workspace type with no title:", content.type)
      }
  }

  console.log("[v0] Workspace context formatted:", context.length, "characters")
  return context
}
// </CHANGE>

export const ChatMain = forwardRef<ChatMainRef, ChatMainProps>(
  (
    { isSidebarOpen, onToggleSidebar, onOpenWorkspace, initialAgentId, shouldShowWelcome, currentWorkspaceContent },
    ref,
  ) => {
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
    const [hasChallengeWelcomeShown, setHasChallengeWelcomeShown] = useState(false)
    const [currentChatCandidate, setCurrentChatCandidate] = useState<CandidateProfile | null>(null) // Updated to CandidateProfile
    const [isVoiceMode, setIsVoiceMode] = useState(false)
    const lastUserMessageRef = useRef<HTMLDivElement>(null)
    const lastMessageRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const agentDropdownRef = useRef<HTMLDivElement>(null)
    const voiceModeRef = useRef<VoiceModeRef>(null) // Ref for VoiceMode methods

    // State for workspace management, tied to voice mode commands
    const [isWorkspaceOpen, setWorkspaceOpen] = useState(false)
    const [workspaceType, setWorkspaceType] = useState<WorkspaceContent["type"] | null>(null)

    const {
      messages: aiMessages,
      sendMessage,
      status,
      setMessages,
    } = useChat({
      transport: new DefaultChatTransport({ api: "/api/chat" }),
      body: {
        agentId: activeAgent.id,
        workspaceContext: formatWorkspaceContext(currentWorkspaceContent),
        // </CHANGE>
      },
      initialMessages: [], // Start with an empty array, welcome messages are handled separately
      onError: (error) => {
        console.error("[v0] useChat error:", error)
      },
      onFinish: (message) => {
        console.log("[v0] useChat finished:", message)
      },
    })

    const isCentered = localMessages.length === 0 && aiMessages.length === 0
    const isThinking = status === "in_progress"

    useEffect(() => {
      console.log("[v0] aiMessages updated:", aiMessages.length, "messages")
      if (aiMessages.length > 0) {
        console.log("[v0] Last message:", aiMessages[aiMessages.length - 1])
      }
    }, [aiMessages])

    useEffect(() => {
      if (!aiMessages || aiMessages.length === 0) {
        return
      }

      const convertedMessages: Message[] = aiMessages.map((msg) => {
        // Find the corresponding agent if it's an AI message. If not, use the active agent.
        const messageAgent = AI_AGENTS.find((a) => a.id === msg.extra?.agentId) || activeAgent

        let content = ""
        if (msg.parts && msg.parts.length > 0) {
          content = msg.parts.map((part) => (part.type === "text" ? part.text : "")).join("")
        } else if (msg.content) {
          content = typeof msg.content === "string" ? msg.content : ""
        }

        const responseType = msg.extra?.responseType

        return {
          id: msg.id,
          type: msg.role === "user" ? "user" : "ai", // Corrected: user role should map to "user" type
          content,
          agentId: messageAgent.id,
          responseType,
          thinkingTime: msg.extra?.thinkingTime,
          promptSuggestions: msg.extra?.promptSuggestions,
          hasActionButton: msg.extra?.hasActionButton,
          actionButtonText: msg.extra?.actionButtonText,
          actionButtonHandler: msg.extra?.actionButtonHandler,
        }
      })

      const aiMessageIds = new Set(convertedMessages.map((m) => m.id))

      const preservedLocalMessages = localMessages.filter((m) => !aiMessageIds.has(m.id))

      const hasWelcomeMessages = localMessages.some((m) => m.isWelcome)
      const wouldClearWelcome =
        hasWelcomeMessages && preservedLocalMessages.length === 0 && convertedMessages.length === 0

      if (wouldClearWelcome) {
        return
      }

      const newMessages = [...preservedLocalMessages, ...convertedMessages]

      newMessages.sort((a, b) => {
        // Extract timestamp from message ID (format: timestamp string or backend ID)
        const getTimestamp = (msg: Message) => {
          // If ID is a number string (timestamp), use it
          const idAsNumber = Number.parseInt(msg.id)
          if (!isNaN(idAsNumber) && idAsNumber > 1000000000000) {
            return idAsNumber
          }
          // Otherwise, parse the timestamp string
          return new Date(msg.timestamp || 0).getTime()
        }

        return getTimestamp(a) - getTimestamp(b)
      })
      // </CHANGE>

      const messagesChanged =
        newMessages.length !== localMessages.length ||
        newMessages.some((msg, idx) => msg.id !== localMessages[idx]?.id || msg.content !== localMessages[idx]?.content)

      if (messagesChanged) {
        setLocalMessages(newMessages)
      }
    }, [aiMessages, activeAgent]) // Fixed dependency to use activeAgent object instead of activeAgent.id

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

    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, [localMessages, isThinking])

    useEffect(() => {
      if (
        lastWorkspaceContent?.type === "code" &&
        lastWorkspaceContent?.title === "Take Home Challenge" &&
        !hasChallengeWelcomeShown
      ) {
        // Switch to Technical Recruiter agent
        const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")
        if (technicalRecruiter) {
          setActiveAgent(technicalRecruiter)
        }

        setMessages([])

        const welcomeMessage: Message = {
          id: `welcome-${Date.now()}`,
          type: "ai",
          content: `Welcome to your Take Home Challenge! 👨‍💻

I'm your Technical Recruiter, and I'll be guiding you through this coding challenge.

**Challenge Instructions:**

The code editor on the right contains a Python Flask server implementation. Your task is to:

1. Review the existing code structure
2. Identify any bugs or issues
3. Implement the missing functionality
4. Ensure the server runs correctly

**What I'm looking for:**
- Clean, readable code
- Proper error handling
- Best practices in Python development
- Attention to detail

Feel free to ask me any questions about the challenge. When you're ready to submit, let me know and I'll review your solution.

Good luck! 🚀`,
          agentId: technicalRecruiter?.id || activeAgent.id,
          promptSuggestions: [
            { text: "I have a question about the challenge", icon: <MessageSquare className="w-4 h-4" /> },
            { text: "Can you explain the requirements?", icon: <FileText className="w-4 h-4" /> },
            { text: "I'm ready to submit my solution", icon: <CheckCircle className="w-4 h-4" /> },
          ],
        }

        setLocalMessages([welcomeMessage])
        setHasChallengeWelcomeShown(true)
      }
    }, [lastWorkspaceContent, hasChallengeWelcomeShown])

    // Declare handleStartChallenge here
    const handleStartChallenge = () => {
      setHasChallengeWelcomeShown(false)

      // Show loading animation
      onOpenWorkspace({ type: "challenge-loading", title: "Take Home Challenge" })
      setHasOpenedWorkspace(true)
      setLastWorkspaceContent({ type: "challenge-loading", title: "Take Home Challenge" })

      // AFTER 3 SECONDS, SHOW THE CODE PREVIEW WORKSPACE (SAME AS "CODE PREVIEW" COMMAND)
      setTimeout(() => {
        onOpenWorkspace({
          type: "code",
          title: "Take Home Challenge",
          data: codeSnippet,
        })
        // Update lastWorkspaceContent to trigger the useEffect that resets conversation
        setLastWorkspaceContent({ type: "code", title: "Take Home Challenge" })
      }, 3000)
    }

    const handleSubmitChallengeRequest = () => {
      // Switch to Technical Recruiter if not already
      const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")
      if (technicalRecruiter && activeAgent.id !== "technical-recruiter") {
        setActiveAgent(technicalRecruiter)
      }

      const confirmationMessage: Message = {
        id: `submit-confirmation-${Date.now()}`,
        type: "ai",
        content: `Before you submit your Take Home Challenge, please read this carefully:

**⚠️ Important Submission Guidelines:**

• **You can only submit once.** Once you click submit, you cannot make any further changes to your code.

• **Current GitHub version will be submitted.** The version currently in your GitHub repository (jonesy02/coding-challenge.git) will be sent to the hiring managers.

• **Make sure you've pushed your most recent code to GitHub.** If you haven't pushed your most recent code to GitHub, please do so before submitting.

**What happens after submission:**

1. Your code will be reviewed by our technical team
2. We'll evaluate your solution based on code quality, functionality, and best practices
3. You'll receive feedback within 3-5 business days
4. If successful, we'll move forward with the next steps in the interview process

Are you ready to submit your Take Home Challenge? This action cannot be undone.`,
        agentId: technicalRecruiter?.id || activeAgent.id,
        hasActionButton: true,
        actionButtonText: "Yes, I would like to submit my work",
        actionButtonHandler: "confirmSubmitChallenge",
      }

      setLocalMessages((prev) => [...prev, confirmationMessage])
    }

    const handleConfirmSubmitChallenge = () => {
      // Trigger submission in workspace via custom event
      window.dispatchEvent(new CustomEvent("confirm-challenge-submission"))

      // Add confirmation message to chat
      const submittingMessage: Message = {
        id: `submitting-${Date.now()}`,
        type: "ai",
        content: `Great! I'm submitting your Take Home Challenge now. Please wait while we process your submission...`,
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, submittingMessage])
    }

    const handleSubmissionComplete = () => {
      // Switch to Technical Recruiter if not already
      const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")
      if (technicalRecruiter && activeAgent.id !== "technical-recruiter") {
        setActiveAgent(technicalRecruiter)
      }

      const followUpMessage: Message = {
        id: `submission-complete-${Date.now()}`,
        type: "ai",
        content: `Congratulations! Your Take Home Challenge has been successfully submitted! 🎉

Your code has been sent to our technical team for review. Here's what happens next:

**Next Steps in Your Application Process:**

1. **Take Home Challenge** ✅ (Completed!)
   - You've successfully submitted your code
   - Our technical team will review your submission

2. **AI interviews** (Your next step!)
   - Complete AI-powered interviews at your convenience
   - These interviews help us understand your experience and approach
   - Recordings will be shared with the hiring manager

3. **Meet the Hiring Manager!**
   - Your complete application package (challenge + interviews) will be sent to the hiring manager
   - They'll review everything and decide on next steps

4. **Job Offer**
   - If selected, you'll receive a job offer from the hiring team
   - This is your chance to join the team and start your new role!

**Ready to continue?** Let's move forward with the AI interviews to complete your application!`,
        agentId: technicalRecruiter?.id || activeAgent.id,
        promptSuggestions: [
          { text: "Take AI interview", icon: <MessageSquare className="w-4 h-4" /> },
          { text: "View Application", icon: <FileText className="w-4 h-4" /> },
        ],
      }

      setLocalMessages((prev) => [...prev, followUpMessage])
    }
    // </CHANGE>
    // </CHANGE>

    const handleShowCandidateChat = (candidate: CandidateProfile) => {
      // Updated type to CandidateProfile
      console.log("[v0] handleShowCandidateChat called with candidate:", candidate)
      setCurrentChatCandidate(candidate)
      setLocalMessages([])
      console.log("[v0] Messages cleared")

      const conversationHistory = getCandidateConversation(candidate.id, candidate.name)
      console.log("[v0] Conversation history retrieved:", conversationHistory)

      // Create conversation messages from the candidate's unique history
      const conversationMessages: Message[] = conversationHistory.map((msg, index) => ({
        id: `${Date.now()}-${index}`,
        type: msg.sender === "hiring_manager" ? "user" : "ai",
        content: msg.content,
        agentId: activeAgent.id,
        ...(msg.sender === "candidate" && {
          avatar: candidate.avatar,
          senderName: candidate.name,
        }),
        timestamp: msg.timestamp,
      }))
      console.log("[v0] Conversation messages created:", conversationMessages.length, "messages")

      setLocalMessages(conversationMessages)
      console.log("[v0] Messages set, scrolling to bottom")
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }
    // </CHANGE>

    const clearMessages = () => {
      console.log("[v0] Clearing all messages")
      setLocalMessages([])
    }
    // </CHANGE>
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
        const agent = AI_AGENTS.find((a) => a.id === agentId)
        if (agent) {
          handleAgentChange(agent)
        } else {
        }
      },
      showPricingGuidance: () => {
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
        const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")

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
            agentId: technicalRecruiter?.id || "technical-recruiter",
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
        window.dispatchEvent(new CustomEvent("interview-option-selected"))

        // Send "Apply to this job" command to chat
        handleCommandOrMessage("Apply to this job")
      },
      handleStartChallenge: handleStartChallenge, // Use the declared variable
      handleSubmitChallengeRequest: handleSubmitChallengeRequest,
      handleSubmissionComplete: handleSubmissionComplete,
      // </CHANGE>
      sendMessageFromWorkspace: (message: string) => {
        console.log("[v0] sendMessageFromWorkspace called with:", message)
        const isCommand = handleCommandOrMessage(message)
        if (!isCommand) {
          console.log("[v0] sendMessageFromWorkspace: Not a command, calling sendMessage")
          sendMessage({ text: message })
        }
      },
      sendAIMessageFromWorkspace: (message: string, agentId?: string) => {
        console.log("[v0] sendAIMessageFromWorkspace called")
        console.log("[v0] Message:", message.substring(0, 50) + "...")
        console.log("[v0] AgentId parameter:", agentId)
        console.log("[v0] Active agent:", activeAgent.id)
        // </CHANGE>
        const agent = agentId || activeAgent.id
        console.log("[v0] Final agent ID being used:", agent)
        // </CHANGE>
        const aiMessage: Message = {
          id: Date.now().toString(),
          type: "ai",
          content: message,
          agentId: agent,
        }
        console.log("[v0] AI message object created:", {
          id: aiMessage.id,
          type: aiMessage.type,
          agentId: aiMessage.agentId,
        })
        // </CHANGE>
        setLocalMessages((prev) => [...prev, aiMessage])
        console.log("[v0] AI message added to localMessages")
        // </CHANGE>
      },
      // </CHANGE>
      showJobBoardSummary: () => {
        const summaryMessage = `Welcome to your Job Board! I'm here to help you manage your job postings and find the best candidates. 💼

## Your Job Overview

I can see you have several job postings across different stages:
- **Draft Jobs:** Jobs you're still working on
- **Open Jobs:** Active positions accepting applications
- **Closed Jobs:** Completed or archived positions

## How I Can Help You

I'm your Account Manager AI, and I specialize in helping you:

**Create New Jobs** 📝
- Generate professional job descriptions
- Set up requirements and qualifications
- Define salary ranges and benefits

**Manage Existing Jobs** 🔄
- Update job details and requirements
- Review and edit job descriptions
- Close or reopen positions

**Track Your Postings** 📊
- Get updates on application counts
- Monitor job performance
- Review candidate matches

## What Would You Like to Do?

Whether you're creating a new position, updating an existing job, or need insights about your postings, I'm here to assist you every step of the way!`

        setLocalMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "ai",
            content: summaryMessage,
            agentId: activeAgent.id,
            promptSuggestions: [
              { text: "Create a new job posting", icon: <Plus className="w-4 h-4" /> },
              { text: "Update an existing job", icon: <FileText className="w-4 h-4" /> },
              { text: "Show me job performance stats", icon: <Calculator className="w-4 h-4" /> },
              { text: "Help me write a job description", icon: <Sparkles className="w-4 h-4" /> },
            ],
          },
        ])
      },
      showCandidateChat: handleShowCandidateChat,
      // </CHANGE>
      introduceMatchedCandidate: (
        candidate: CandidateProfile, // Updated type to CandidateProfile
        hiringManagerName: string,
        position: string,
        company: string,
      ) => {
        setCurrentChatCandidate(candidate)

        setLocalMessages([])

        // Switch to Technical Recruiter agent
        const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")
        if (technicalRecruiter) {
          setActiveAgent(technicalRecruiter)

          setTimeout(() => {
            setLocalMessages([
              {
                id: Date.now().toString(),
                type: "ai",
                content: `Hi ${candidate.name}! 🎉 I'm excited to introduce you to ${hiringManagerName}, who is the ${position} at ${company}.

${hiringManagerName} has been reviewing candidates for this role and was really impressed with your profile, particularly your experience with ${candidate.skills.slice(0, 2).join(" and ")}. They believe you could be a great fit for their team!

I've created this group chat so you two can connect directly. ${hiringManagerName}, feel free to share more about the role and what you're looking for. ${candidate.name}, this is a great opportunity to ask questions and learn more about the position and the team.

Looking forward to seeing this conversation develop! 🚀`,
                agentId: technicalRecruiter.id,
                isAgentSwitch: true,
              },
            ])
          }, 100)
        }
      },
      sendCandidateInsights: (candidate: CandidateProfile) => {
        // Switch to Technical Recruiter agent
        const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")
        if (technicalRecruiter && activeAgent.id !== "technical-recruiter") {
          setActiveAgent(technicalRecruiter)
        }

        // Generate insights message based on candidate data
        const skillMatch = candidate.skillMatch || 0
        const experience = candidate.experience || "N/A"
        const location = candidate.location || "Unknown"
        const topSkills = candidate.skills?.slice(0, 3).join(", ") || "various skills"

        let insightMessage = `I'm reviewing ${candidate.name}'s profile for you. `

        if (skillMatch >= 90) {
          insightMessage += `This is an exceptional match at ${skillMatch}%! `
        } else if (skillMatch >= 75) {
          insightMessage += `This is a strong match at ${skillMatch}%. `
        } else {
          insightMessage += `This candidate has a ${skillMatch}% skill match. `
        }

        insightMessage += `They have ${experience} of experience and are based in ${location}. `
        insightMessage += `Their key strengths include ${topSkills}. `

        if (candidate.takeHomeChallengeScore) {
          insightMessage += `They scored ${candidate.takeHomeChallengeScore}/100 on the take-home challenge. `
        }

        insightMessage += `Would you like to review their profile in detail?`

        // Add AI message with insights
        setTimeout(() => {
          setLocalMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "ai",
              content: insightMessage,
              agentId: technicalRecruiter?.id || "technical-recruiter",
            },
          ])
        }, 300) // Sync with fade-in animation
      },
      showJobInsights: (job: JobListing) => {
        // Switch to Account Manager agent
        const accountManager = AI_AGENTS.find((agent) => agent.id === "account-manager")
        if (accountManager && activeAgent.id !== "account-manager") {
          setActiveAgent(accountManager)
        }

        // Calculate insights
        const candidateCount = job.matchedCandidates?.length || 0
        const candidates = job.matchedCandidates || []

        // Find highest scoring candidate
        let highestScoringCandidate = null
        let highestScore = 0

        if (candidates.length > 0) {
          highestScoringCandidate = candidates.reduce((prev, current) => {
            const prevScore = prev.skillMatch || 0
            const currentScore = current.skillMatch || 0
            return currentScore > prevScore ? current : prev
          })
          highestScore = highestScoringCandidate.skillMatch || 0
        }

        // Generate insights message
        let insightMessage = `## ${job.title} - Job Overview\n\n`

        if (candidateCount === 0) {
          insightMessage += `Currently, there are **no candidates** matched to this position yet. `
          insightMessage += `I recommend browsing for candidates or adjusting your job requirements to attract more applicants.\n\n`
        } else if (candidateCount === 1) {
          insightMessage += `You have **1 candidate** matched to this position. `
        } else {
          insightMessage += `You have **${candidateCount} candidates** matched to this position. `
        }

        if (highestScoringCandidate) {
          insightMessage += `\n\n### Top Candidate\n\n`
          insightMessage += `**${highestScoringCandidate.name}** is your highest match at **${highestScore}% skill compatibility**. `

          if (highestScoringCandidate.experience) {
            insightMessage += `They bring ${highestScoringCandidate.experience} of experience `
          }

          if (highestScoringCandidate.location) {
            insightMessage += `and are based in ${highestScoringCandidate.location}. `
          }

          if (highestScoringCandidate.skills && highestScoringCandidate.skills.length > 0) {
            const topSkills = highestScoringCandidate.skills.slice(0, 3).join(", ")
            insightMessage += `\n\nKey skills: ${topSkills}`
          }

          if (highestScoringCandidate.takeHomeChallengeScore) {
            insightMessage += `\n\nThey scored **${highestScoringCandidate.takeHomeChallengeScore}/100** on the take-home challenge.`
          }
        }

        insightMessage += `\n\n### Next Steps\n\n`
        if (candidateCount > 0) {
          insightMessage += `- **"Review candidates"** - View detailed profiles and compare qualifications\n`
          insightMessage += `- **"Schedule interviews"** - Set up meetings with top candidates\n`
        } else {
          insightMessage += `- **"Browse for candidates"** - Search our talent pool for potential matches\n`
          insightMessage += `- **"Refine job requirements"** - Adjust criteria to attract more candidates\n`
        }
        insightMessage += `- **"Update job description"** - Make changes to the posting\n`
        insightMessage += `- **"View job analytics"** - See performance metrics for this position\n\n`
        insightMessage += `How would you like to proceed?`

        // Add AI message with insights
        setTimeout(() => {
          setLocalMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "ai",
              content: insightMessage,
              agentId: accountManager?.id || "account-manager",
            },
          ])
        }, 500) // Delay to allow workspace to open
      },
      // </CHANGE>
      // </CHANGE>
      clearMessages, // Added clearMessages to the exposed ref methods
    }))

    // Use useCallback for voice mode callbacks
    const handleVoiceTranscription = useCallback(
      (userText: string, aiText: string) => {
        const userMsg = {
          id: `voice-user-${Date.now()}`,
          type: "user" as const,
          content: userText,
          timestamp: new Date().toISOString(),
          agentId: activeAgent.id,
        }

        const aiMsg = {
          id: `voice-ai-${Date.now()}`,
          type: "ai" as const,
          content: aiText,
          timestamp: new Date().toISOString(),
          agentId: activeAgent.id,
        }

        setLocalMessages((prev) => [...prev, userMsg])
        setLocalMessages((prev) => [...prev, aiMsg])
      },
      [activeAgent.id],
    )

    const handleVoiceModeAgentChange = useCallback((agent: AIAgent) => {
      console.log("[v0] Voice mode agent change:", agent.id)
      setActiveAgent(agent)
    }, [])

    const handleAgentChange = useCallback(
      (agent: AIAgent) => {
        setActiveAgent(agent)
        setIsAgentDropdownOpen(false)

        if (currentChatCandidate) {
          setCurrentChatCandidate(null)
        }

        const introMessage = generateAgentIntroduction(agent)

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
      },
      [currentChatCandidate, setLocalMessages, generateAgentIntroduction, AI_AGENTS], // Added AI_AGENTS to dependencies
    )
    // </CHANGE>

    const detectAndHandleCommand = useCallback(
      async (text: string): Promise<boolean> => {
        console.log("[v0] detectAndHandleCommand called with:", text)

        const intentResult = await detectCommandIntent(text)

        console.log("[v0] Intent detection result:", intentResult)

        if (!intentResult.isCommand) {
          return false
        }

        const command = intentResult.command!

        if (command.startsWith("switch to ")) {
          const targetAgentName = command.replace("switch to ", "").toLowerCase()
          const targetAgent = AI_AGENTS.find((agent) => agent.firstName.toLowerCase() === targetAgentName)

          if (targetAgent && targetAgent.id !== activeAgent.id) {
            console.log("[v0] Agent switch command detected:", targetAgent.firstName)

            if (isVoiceMode && voiceModeRef.current) {
              voiceModeRef.current.handleVerbalAgentSwitch(targetAgent)
              return true
            }

            const userMsg = {
              id: `cmd-user-${Date.now()}`,
              type: "user" as const,
              content: text,
              timestamp: new Date().toISOString(),
              agentId: activeAgent.id,
            }

            const aiMsg = {
              id: `cmd-ai-${Date.now()}`,
              type: "ai" as const,
              content: `Switching you to ${targetAgent.firstName}, our ${targetAgent.name}. One moment please...`,
              timestamp: new Date().toISOString(),
              agentId: activeAgent.id,
            }

            setLocalMessages((prev) => [...prev, userMsg, aiMsg])

            handleAgentChange(targetAgent)

            return true
          }
        }

        const userMsg = {
          id: `voice-cmd-user-${Date.now()}`,
          type: "user" as const,
          content: text,
          timestamp: new Date().toISOString(),
          agentId: activeAgent.id,
        }

        if (command === "browse candidates") {
          const workspaceData: WorkspaceContent = {
            type: "browse-candidates",
            title: "Browse Candidates",
            timestamp: Date.now(),
            ...(currentWorkspaceContent?.job && { job: currentWorkspaceContent.job }),
          }
          onOpenWorkspace(workspaceData)
          setHasOpenedWorkspace(true)
          setLastWorkspaceContent(workspaceData)

          return true
        }

        if (command === "job board") {
          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content:
              "Opening the job board for you. You can explore available positions while we continue our conversation.",
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          const workspaceData: WorkspaceContent = { type: "job-board", title: "Available Positions" }
          onOpenWorkspace(workspaceData)
          setHasOpenedWorkspace(true)
          setLastWorkspaceContent(workspaceData)

          return true
        }

        if (command === "my jobs") {
          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content:
              "Opening your saved jobs. You can review the positions you've applied to or saved while we continue our conversation.",
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          const workspaceData: WorkspaceContent = { type: "job-board", title: "My Jobs" }
          onOpenWorkspace(workspaceData)
          setHasOpenedWorkspace(true)
          setLastWorkspaceContent(workspaceData)

          return true
        }

        if (command === "data") {
          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content: "Opening the data view for you. You can review the analytics while we continue our conversation.",
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          const workspaceData: WorkspaceContent = { type: "analytics", title: "Recruitment Analytics" }
          onOpenWorkspace(workspaceData)
          setHasOpenedWorkspace(true)
          setLastWorkspaceContent(workspaceData)

          return true
        }

        return false
      },
      [
        activeAgent,
        isVoiceMode,
        onOpenWorkspace,
        currentWorkspaceContent,
        setHasOpenedWorkspace,
        setLastWorkspaceContent,
        handleAgentChange,
      ],
    )

    const handleVoiceModeToggle = () => {
      setIsVoiceMode(!isVoiceMode)
    }

    const handlePreviewClick = (fileType: string) => {
      onOpenWorkspace({ type: "pdf", title: "candidate-resume.pdf" })
    }

    const handleReopenWorkspace = () => {
      if (lastWorkspaceContent) {
        onOpenWorkspace(lastWorkspaceContent)
        setHasOpenedWorkspace(true) // Ensure the flag is set when reopening
      }
    }

    const handleCommandOrMessage = async (text: string) => {
      // Check if it's a voice command first, if so, handle it and return true
      const isVoiceCommand = await detectAndHandleCommand(text)
      if (isVoiceCommand) {
        return true
      }

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

      // Browse Candidates (opens candidate swipe interface)
      if (lowerText === "browse candidates") {
        const userMsg: Message = {
          id: Date.now().toString(),
          type: "user",
          content: text,
          agentId: activeAgent.id,
        }

        const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")
        const aiMsg: Message = {
          id: `voice-cmd-ai-${Date.now()}`, // Changed ID to match voice command handling
          type: "ai" as const,
          content:
            "Perfect! I've opened the candidate browser for you. You can now swipe through our pool of talented candidates.",
          timestamp: new Date().toISOString(),
          agentId: activeAgent.id,
        }
        // </CHANGE>
        // </CHANGE>

        setLocalMessages((prev) => [...prev, userMsg, aiMsg])

        // Open browse candidates workspace with job context if available
        const workspaceData: WorkspaceContent = {
          type: "browse-candidates",
          title: "Browse Candidates",
          timestamp: Date.now(),
          ...(currentWorkspaceContent?.job && { job: currentWorkspaceContent.job }),
        }

        onOpenWorkspace(workspaceData)
        setHasOpenedWorkspace(true)
        setLastWorkspaceContent(workspaceData)

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
          content: `Great! I'm excited to help you apply for this position.

Here's how our application process works:

**Step 1: Take Home Challenge**

First, you'll complete a take-home challenge that's designed to showcase your skills in a real-world scenario. This challenge is tailored to the role you're applying for and typically takes 2-4 hours to complete.

**Step 2: AI interviews**

After submitting your take-home challenge, you'll participate in our AI interviews. These are:

- 🎯 Personalized based on your role and experience
- 📊 Recorded for review by the hiring manager
- 🚀 Completed at your convenience

**Step 3: Meet the Hiring Manager!**

After you complete both the take-home challenge and AI interviews, we'll compile your complete application package including:

- Your resume and portfolio
- Take-home challenge submission
- Recording of your AI interviews

This package will be sent directly to the hiring manager for review.

**Step 4: Job Offer**

If the hiring manager is impressed with your application package, they'll reach out to you with a job offer. This is your opportunity to join the team and start your new role!

Ready to get started? Let's begin with the take-home challenge!`,
          agentId: activeAgent.id,
          promptSuggestions: [
            { text: "take home challenge", icon: <Code className="w-4 h-4 text-[#A16AE8]" /> },
            {
              text: "Tell me more about the AI interviews",
              icon: <MessageSquare className="w-4 h-4 text-[#8096FD]" />,
            },
          ],
        }

        setLocalMessages((prev) => [...prev, userMsg, aiMsg])
        return true
      }

      // Take Home Challenge - shows confirmation with button to start challenge
      if (lowerText === "take home challenge") {
        const userMsg: Message = {
          id: Date.now().toString(),
          type: "user",
          content: text,
          agentId: activeAgent.id,
        }

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: `Great! You're about to start your **Take Home Challenge**. This is an important step in the application process where you'll demonstrate your technical skills.

**Important Information:**
- ⏱️ You'll have **4 hours** to complete the challenge once you begin
- 📝 The challenge can only be taken **once** - make sure you're ready before proceeding
- 💻 You'll work in an interactive code editor with all the tools you need
- ✅ Your submission will be automatically saved when you click "Submit Challenge"

Once you start, the timer will begin immediately. Make sure you have:
- A stable internet connection
- Enough uninterrupted time to focus
- Your development environment ready (if you want to test locally)

Are you ready to begin your Take Home Challenge?`,
          agentId: activeAgent.id,
          hasActionButton: true,
          actionButtonText: "Proceed to Take Home Challenge",
          actionButtonHandler: "startChallenge",
        }

        setLocalMessages((prev) => [...prev, userMsg, aiMsg])
        return true
      }

      // 16. Connect with Candidate - initiates a chat with a specific candidate
      if (lowerText.startsWith("connect with")) {
        const candidateName = text.substring("connect with".length).trim()
        // In a real app, you'd likely look up the candidate by name or ID here.
        // For this example, we'll simulate finding a candidate.
        const mockCandidate: CandidateProfile = {
          // Updated type to CandidateProfile
          id: `cand-${Date.now()}`,
          name: candidateName,
          avatar: "/candidate-avatar.jpg", // Placeholder avatar
          skillMatch: 85, // Example skill match
          experience: "5 years",
          location: "New York",
          skills: ["React", "Node.js", "TypeScript"],
        }

        const userMsg: Message = {
          id: Date.now().toString(),
          type: "user",
          content: text,
          agentId: activeAgent.id,
        }

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: `Sure, I'll open a chat with ${candidateName}.`,
          agentId: activeAgent.id,
        }

        setLocalMessages((prev) => [...prev, userMsg, aiMsg])

        setTimeout(() => {
          handleShowCandidateChat(mockCandidate)
        }, 500)
        // </CHANGE>

        return true
      }

      // 17. Compare Candidates - opens a comparison view
      if (lowerText === "compare candidates") {
        const userMsg: Message = {
          id: Date.now().toString(),
          type: "user",
          content: text,
          agentId: activeAgent.id,
        }

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: `Alright, opening the candidate comparison tool. You can select up to 3 candidates to compare side-by-side.`,
          agentId: activeAgent.id,
        }

        setLocalMessages((prev) => [...prev, userMsg, aiMsg])

        // Simulate opening candidate comparison workspace
        onOpenWorkspace({ type: "compare-candidates", title: "Compare Candidates" })
        setHasOpenedWorkspace(true)
        setLastWorkspaceContent({ type: "compare-candidates", title: "Compare Candidates" })

        return true
      }

      // Not a command, return false to send to OpenAI
      return false
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!inputMessage.trim()) return

      console.log("[v0] handleSubmit: Sending message:", inputMessage)

      if (currentChatCandidate) {
        console.log("[v0] In candidate chat, sending message to candidate:", currentChatCandidate.name)

        // Add hiring manager's message to local messages
        const hiringManagerMessage: Message = {
          id: `${Date.now()}-hm`,
          type: "user",
          content: inputMessage,
          agentId: activeAgent.id,
          timestamp: new Date().toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        }

        setLocalMessages((prev) => [...prev, hiringManagerMessage])
        setInputMessage("")

        // Save hiring manager's message to conversation
        saveCandidateMessage(currentChatCandidate.id, currentChatCandidate.name, "hiring_manager", inputMessage)

        // Get conversation history for context
        const conversationHistory = getCandidateConversation(currentChatCandidate.id, currentChatCandidate.name)

        try {
          const candidateMessageId = `${Date.now()}-candidate`

          // Call API to get candidate's response
          const response = await fetch("/api/candidate-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              candidateId: currentChatCandidate.id,
              candidateName: currentChatCandidate.name,
              conversationHistory,
              newMessage: inputMessage,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to get candidate response")
          }

          // Read the streaming response
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          let candidateResponse = ""

          if (reader) {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value)
              candidateResponse += chunk

              // Update the candidate's message in real-time
              setLocalMessages((prev) => {
                const lastMessage = prev[prev.length - 1]
                if (lastMessage && lastMessage.type === "ai" && lastMessage.id === candidateMessageId) {
                  // Update existing message
                  return [
                    ...prev.slice(0, -1),
                    {
                      ...lastMessage,
                      content: candidateResponse,
                    },
                  ]
                } else {
                  // Add new candidate message
                  return [
                    ...prev,
                    {
                      id: candidateMessageId,
                      type: "ai" as const,
                      content: candidateResponse,
                      agentId: activeAgent.id,
                      avatar: currentChatCandidate.avatar,
                      senderName: currentChatCandidate.name,
                      timestamp: new Date().toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }),
                    },
                  ]
                }
              })
            }

            // Save candidate's response to conversation
            saveCandidateMessage(currentChatCandidate.id, currentChatCandidate.name, "candidate", candidateResponse)
          }
        } catch (error) {
          console.error("[v0] Error getting candidate response:", error)
          // Add error message
          setLocalMessages((prev) => [
            ...prev,
            {
              id: `${Date.now()}-error`,
              type: "ai" as const,
              content: "Sorry, I'm having trouble responding right now. Please try again.",
              agentId: activeAgent.id,
              avatar: currentChatCandidate.avatar,
              senderName: currentChatCandidate.name,
              timestamp: new Date().toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
            },
          ])
        }

        return
      }

      const isCommand = await handleCommandOrMessage(inputMessage) // Use await here
      if (!isCommand) {
        console.log("[v0] handleSubmit: Not a command, calling sendMessage")
        sendMessage({ text: inputMessage })
        setInputMessage("")
      } else {
        setInputMessage("")
      }
    }

    const handleSuggestionClick = (text: string) => {
      setInputMessage(text)
      // Optionally, you can also submit the message immediately:
      // handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    }

    const handlePromptSuggestionClick = (text: string) => {
      setInputMessage(text)
      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    }

    // const handleAgentChange = (agent: AIAgent) => {
    //   setActiveAgent(agent)
    //   setIsAgentDropdownOpen(false)
    //
    //   if (currentChatCandidate) {
    //     setCurrentChatCandidate(null)
    //   }
    //
    //   const introMessage = generateAgentIntroduction(agent)
    //
    //   setLocalMessages((prev) => [
    //     ...prev,
    //     {
    //       id: `agent-switch-${Date.now()}`,
    //       type: "ai",
    //       content: introMessage,
    //       agentId: agent.id,
    //       isAgentSwitch: true,
    //     },
    //   ])
    // }
    // </CHANGE>

    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }

    // const isCentered = localMessages.length === 0 && aiMessages.length === 0
    // const isThinking = status === "in_progress"

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

    // Dummy handler for transcription update, to be replaced with actual implementation
    const handleTranscriptionUpdate = (userText: string, aiText: string) => {
      console.log("Transcription Update - User:", userText, "AI:", aiText)
      // This function should handle adding transcribed messages to the chat.
      // For now, we'll just log it.
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full bg-background">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/95 supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-[#A16AE8] to-[#8096FD] bg-clip-text text-transparent">
              Teamified AI
            </h2>
          </div>
          <div className="flex-shrink-0">
            {hasOpenedWorkspace && (!currentWorkspaceContent || !currentWorkspaceContent.type) && (
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

        {isVoiceMode ? (
          <VoiceMode
            ref={voiceModeRef}
            onClose={handleVoiceModeToggle}
            onTranscriptionUpdate={handleTranscriptionUpdate}
            onCommandDetected={detectAndHandleCommand}
            agentName={`${activeAgent.firstName} - ${activeAgent.name}`}
            agentId={activeAgent.id}
            currentWorkspaceContent={currentWorkspaceContent}
            allAgents={AI_AGENTS}
            currentAgent={activeAgent}
            onAgentChange={handleVoiceModeAgentChange}
            // </CHANGE>
          />
        ) : (
          <>
            <main
              ref={messagesContainerRef}
              className={`flex-1 min-h-0 px-6 relative bg-background ${isCentered ? "flex items-center justify-center" : "flex flex-col overflow-y-auto"}`}
            >
              {isCentered ? (
                <div className="w-full max-w-[820px] mx-auto px-6">
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
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                          {agent.description}
                                        </p>
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
                            onClick={handleVoiceModeToggle}
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
                      <p className="text-xs text-muted-foreground">
                        Teamified AI can make mistakes. Check important info.
                      </p>
                    </footer>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-[820px] mx-auto py-6 space-y-4">
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
                            <div className="max-w-[70%] px-5 py-3 rounded-3xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white shadow-lg">
                              <p className="text-sm leading-relaxed" title={msg.timestamp}>
                                {msg.content}
                              </p>
                              {/* </CHANGE> */}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-6 max-w-[85%]">
                            <div className="flex items-center gap-2 mb-3">
                              {msg.avatar ? (
                                <img
                                  src={msg.avatar || "/placeholder.svg"}
                                  alt={msg.senderName || "Candidate"}
                                  className="w-8 h-8 rounded-full object-cover shadow-sm"
                                />
                              ) : (
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                                  style={{ backgroundColor: messageAgent?.color }}
                                >
                                  <span className="text-lg">{messageAgent?.icon}</span>
                                </div>
                              )}
                              <span className="text-sm font-medium text-foreground">
                                {msg.senderName || messageAgent?.name}
                              </span>
                              {/* </CHANGE> */}
                            </div>
                            {msg.thinkingTime && (
                              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-medium">Thought for {msg.thinkingTime}s</span>
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            )}
                            <div className="space-y-4" title={msg.timestamp}>
                              {/* </CHANGE> */}
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
                                    <span className="text-xs font-mono text-muted-foreground">code.js</span>
                                    <button
                                      onClick={() => navigator.clipboard.writeText(msg.content)}
                                      className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg hover:bg-accent transition-colors"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                      Copy code
                                    </button>
                                  </div>
                                  <div className="p-4 overflow-x-auto">
                                    <pre className="text-xs font-mono leading-relaxed">
                                      <code className="text-foreground">{msg.content}</code>
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
                                            <th
                                              key={header}
                                              className="px-4 py-3 text-left font-medium text-foreground"
                                            >
                                              {header}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {tableData.rows.map((row, idx) => (
                                          <tr
                                            key={idx}
                                            className="border-b border-border last:border-0 hover:bg-accent/50"
                                          >
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

                              {msg.responseType === "challenge-button" && (
                                <div className="mt-4">
                                  <button
                                    onClick={() => handleStartChallenge()}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:shadow-lg hover:scale-105 transition-all"
                                  >
                                    Start Take Home Challenge
                                  </button>
                                </div>
                              )}

                              {msg.hasActionButton && msg.actionButtonText && msg.actionButtonHandler && (
                                <div className="mt-4 flex justify-center">
                                  <button
                                    onClick={() => {
                                      if (msg.actionButtonHandler === "startChallenge") {
                                        handleStartChallenge()
                                      } else if (msg.actionButtonHandler === "confirmSubmitChallenge") {
                                        handleConfirmSubmitChallenge()
                                      }
                                    }}
                                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                                  >
                                    {msg.actionButtonText}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {/* Add ref to the last message for auto-scroll */}
                  <div ref={messagesEndRef} />

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
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                        </div>
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>

            {!isCentered && (
              <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="w-full max-w-[900px] mx-auto px-6 py-4">
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
                                      <p className="text-xs text-muted-foreground leading-relaxed">
                                        {agent.description}
                                      </p>
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
                          onClick={handleVoiceModeToggle}
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
                    <p className="text-xs text-muted-foreground">
                      Teamified AI can make mistakes. Check important info.
                    </p>
                  </footer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  },
)

ChatMain.displayName = "ChatMain"
;("ChatMain")
