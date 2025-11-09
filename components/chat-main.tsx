"use client"

import type React from "react"
import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useMemo } from "react"
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

// Import mock data
import { mockJobListings, mockHiringManagerJobs } from "@/lib/mock-data"

// Placeholder for getCurrentUser function
const getCurrentUser = () => {
  // In a real application, this would fetch the current user's session or context
  // For now, we'll assume a default user role for demonstration
  return { role: "candidate" as const, name: "Candidate" } // Default to candidate role and name
}

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
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  jobSummary?: string
  description: string
  skillMatch: number
  applied?: boolean // Added for job board filtering
  invited?: boolean // Added for job board filtering
  saved?: boolean // Added for job board filtering
  status?: string // Added for job board filtering
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
  // </CHANGE>
  requirements?: string[] // Added for job view context
  benefits?: string[] // Added for job view context
  posted?: string // Added for job view context
  applicationStage?: string // Added for job view context
  // </CHANGE>
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
  // </CHANGE>
  introduceHiringManager: (
    hiringManagerName: string,
    position: string,
    company: string,
    hiringManagerAgentId: string,
  ) => void // Added introduceHiringManager
}

export interface ChatMainProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  onOpenWorkspace: (content: WorkspaceContent) => void
  initialAgentId?: string | null
  shouldShowWelcome?: boolean
  currentWorkspaceContent?: WorkspaceContent
  // </CHANGE>
  currentJobBoardTab?: "applied" | "invited" | "saved" | "browse"
  onSetJobBoardTab?: (tab: "applied" | "invited" | "saved" | "browse") => void
  userType?: "candidate" | "hiring_manager" // Added userType
  onWorkspaceUpdate?: (content: WorkspaceContent) => void // Added for voice mode integration
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

// Helper function to generate short response
const generateShortResponse = () => {
  return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
}

// Helper function to generate large text response
const generateLargeResponse = () => {
  return `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

At vero eos et accusamus et iusto odio dignissim ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.

## Conclusion

In summary, these fundamental principles provide a comprehensive framework for understanding the essential concepts discussed above. The interconnected nature of these ideas demonstrates their significance in practical applications.`
}

// Helper function to generate bullet text response
const generateBulletResponse = () => {
  return `• Lorem ipsum dolor sit amet, consectetur adipiscing elit
• Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
• Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
• Duis aute irure dolor in reprehenderit in voluptate velit
• Excepteur sint occaecat cupidatat non proident sunt in culpa`
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
  return `Hello! I'm **${agent.firstName}**, your **${agent.name}** AI Agent. ${agent.icon}

${agent.fullDescription}

${agent.callToAction}`
}

// Helper function to generate help message
const generateHelpMessage = (agent: AIAgent): string => {
  const commandsList = agent.actions.map((action) => `- *${action} - ${formatCommandName(action)}`).join("\n")

  return `## Available Commands for ${agent.name} ${agent.icon}

- *help - Show this command list
${commandsList}

Simply type any command or ask your questions naturally!`
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
    return ""
  }

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
      }
      break

    case "job-board":
      if (content.jobs) {
        const jobs = Array.isArray(content.jobs) ? content.jobs : []

        // Check if these are hiring manager jobs (have matchedCandidates property)
        const isHiringManagerView = jobs.length > 0 && "matchedCandidates" in jobs[0]

        if (isHiringManagerView) {
          // Hiring manager view - show detailed job information
          const statusFilter = content.jobStatusFilter
          const statusLabel = statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : "All"

          context += `The hiring manager is viewing their job board${statusFilter ? ` (${statusLabel} Jobs)` : ""}.\n`
          context += `- Total jobs displayed: ${jobs.length}\n\n`

          if (jobs.length > 0) {
            context += `**Job Details:**\n`
            jobs.forEach((job: any, index: number) => {
              const matchedCount = job.matchedCandidates?.length || 0
              context += `${index + 1}. ${job.title}\n`
              context += `   - Company: ${job.company}\n`
              context += `   - Location: ${job.location}\n`
              context += `   - Salary: ${job.salary}\n`
              context += `   - Status: ${job.status || "unknown"}\n`
              context += `   - Matched Candidates: ${matchedCount}\n`
              if (index < jobs.length - 1) context += `\n`
            })
          }
        } else {
          const tabName = content.jobBoardTab || "all"
          const tabLabel =
            tabName === "applied"
              ? "Applied Jobs"
              : tabName === "invited"
                ? "Invited Jobs"
                : tabName === "saved"
                  ? "Saved Jobs"
                  : tabName === "browse"
                    ? "Browse Jobs"
                    : "Job Board"

          context += `The candidate is viewing the ${tabLabel}.\n`
          context += `- Total jobs displayed: ${jobs.length}\n\n`

          if (jobs.length > 0) {
            context += `**Job Listings:**\n`
            jobs.forEach((job: JobListing, index: number) => {
              context += `${index + 1}. ${job.title} at ${job.company}\n`
              context += `   - Location: ${job.location}\n`
              context += `   - Salary: ${job.salary}\n`
              context += `   - Type: ${job.type}\n`
              if (job.skillMatch) context += `   - Skill Match: ${job.skillMatch}%\n`
              if (job.applied) context += `   - Status: Applied\n`
              if (job.invited) context += `   - Status: Invited\n`
              if (job.saved) context += `   - Status: Saved\n`
              if (job.requirements && job.requirements.length > 0) {
                context += `   - Key Requirements: ${job.requirements.slice(0, 3).join(", ")}\n`
              }
              if (index < jobs.length - 1) context += `\n`
            })
            context += `\nYou can answer questions about any of these specific jobs, compare them, or provide recommendations.\n`
          }
        }
      }
      break

    // </CHANGE>
    case "billing":
      context += `The user is viewing their billing information and invoice history.\n\n`
      context += `**BILLING & PAYMENT STATUS:**\n`
      if (content.billingData) {
        const billing = content.billingData
        const totalOverdue = billing.totalOverdue ?? 0
        const totalPaidThisYear = billing.totalPaidThisYear ?? 0

        context += `- Total Overdue Amount: $${totalOverdue.toFixed(2)}\n`
        context += `- Total Paid This Year: $${totalPaidThisYear.toFixed(2)}\n`
        if (billing.nextPaymentDue) {
          const nextAmount = billing.nextPaymentDue.amount ?? 0
          context += `- Next Payment Due: ${billing.nextPaymentDue.invoiceNumber} - $${nextAmount.toFixed(2)} due on ${billing.nextPaymentDue.dueDate}\n`
        }
        context += `- Total Invoices: ${billing.invoices.length}\n\n`

        const paidCount = billing.invoices.filter((i) => i.status === "paid").length
        const pendingCount = billing.invoices.filter((i) => i.status === "pending").length
        const overdueCount = billing.invoices.filter((i) => i.status === "overdue").length

        context += `**Invoice Breakdown:**\n`
        context += `- Paid: ${paidCount} invoices\n`
        context += `- Pending: ${pendingCount} invoices\n`
        context += `- Overdue: ${overdueCount} invoices\n\n`

        context += `**All Invoices (Latest First):**\n`
        billing.invoices.forEach((invoice) => {
          const invoiceAmount = invoice.amount ?? 0
          context += `- ${invoice.invoiceNumber} (${invoice.period}):\n`
          context += `  Amount: $${invoiceAmount.toFixed(2)}\n`
          context += `  Status: ${invoice.status.toUpperCase()}\n`
          context += `  Issue Date: ${invoice.date}\n`
          context += `  Due Date: ${invoice.dueDate}\n`
          if (invoice.paidDate) {
            context += `  Paid Date: ${invoice.paidDate}\n`
          }
          context += `\n`
        })
        context += `You can answer detailed questions about any invoice, payment history, outstanding balances, due dates, and billing trends.\n`
      }
      break
    // </CHANGE>
    // </CHANGE>

    case "invoice-detail":
      context += `The user is viewing a detailed invoice in the invoice detail workspace.\n\n`
      if (content.data?.invoice) {
        const inv = content.data.invoice
        context += `**INVOICE DETAILS:**\n`
        context += `- Invoice Number: ${inv.invoiceNumber}\n`
        context += `- Billing Period: ${inv.period}\n`
        context += `- Issue Date: ${inv.date}\n`
        context += `- Due Date: ${inv.dueDate}\n`
        context += `- Status: ${inv.status.toUpperCase()}\n`
        context += `- Reference: ${inv.reference || "N/A"}\n`
        context += `- Description: ${inv.description}\n\n`

        if (inv.contact) {
          context += `**BILLING TO:**\n`
          context += `- Contact Name: ${inv.contact.name}\n`
          context += `- Account Number: ${inv.contact.accountNumber}\n`
          if (inv.contact.address) {
            context += `- Address: ${inv.contact.address}\n`
          }
          context += `\n`
        }

        if (inv.lineItems && inv.lineItems.length > 0) {
          context += `**DETAILED LINE ITEMS TABLE (${inv.lineItems.length} items):**\n`
          context += `The invoice contains the following charges:\n\n`
          inv.lineItems.forEach((item, idx) => {
            context += `Item ${idx + 1}: ${item.description}\n`
            context += `   • Quantity: ${item.quantity.toFixed(4)} units\n`
            context += `   • Unit Price: $${item.price.toFixed(2)}\n`
            context += `   • Discount Applied: ${item.discount}%\n`
            context += `   • Account Code: ${item.account}\n`
            context += `   • Tax Rate: ${item.taxRate}\n`
            context += `   • Tax Amount: $${item.taxAmount.toFixed(2)}\n`
            context += `   • **Line Item Total: $${item.amount.toFixed(2)}**\n\n`
          })
        } else {
          context += `**LINE ITEMS:**\n`
          context += `No detailed line items are available for this invoice.\n\n`
        }

        context += `**FINANCIAL SUMMARY:**\n`
        context += `- Subtotal (before tax): $${(inv.subtotal || 0).toFixed(2)}\n`
        context += `- ${inv.taxRate || "Tax"}: $${(inv.tax || 0).toFixed(2)}\n`
        context += `**Total Amount Due: $${inv.amount.toFixed(2)}**\n\n`

        if (inv.notes) {
          context += `**ADDITIONAL NOTES:**\n${inv.notes}\n\n`
        }

        context += `**HOW TO HELP THE USER:**\n`
        context += `You can answer detailed questions about this specific invoice, including:\n`
        context += `- Explaining what each line item is for and why it was charged\n`
        context += `- Breaking down the pricing calculations (quantity × unit price - discount + tax)\n`
        context += `- Clarifying tax calculations and rates (e.g., GST, VAT)\n`
        context += `- Discussing the account codes and what they represent\n`
        context += `- Explaining payment status, due dates, and any overdue amounts\n`
        context += `- Comparing charges with previous invoices if asked\n`
        context += `- Helping understand why certain charges may vary month to month\n`
        context += `- Providing context about the billing period and services rendered\n\n`

        context += `When answering questions, refer to specific line items by their descriptions or item numbers. `
        context += `Be conversational and helpful, as if you're a billing specialist explaining the invoice.\n`
      }
      break

    // </CHANGE>
    // </CHANGE>

    case "pricing-plans":
      context += `The user is viewing the Pricing Plans workspace with detailed pricing information.\n\n`

      context += `**IMPORTANT INSTRUCTIONS FOR ANSWERING PRICING QUESTIONS:**\n`
      context += `When a user asks about any specific plan (e.g., "What's included in the Enterprise plan?" or "Tell me about the Premium plan for hiring managers"), you MUST:\n`
      context += `1. **State the EXACT PRICE first** - Always lead with the pricing\n`
      context += `2. **List ALL included features/services** - Be comprehensive and specific\n`
      context += `3. **Highlight the VALUE PROPOSITION** - Explain what makes this plan special\n`
      context += `4. **Mention SAVINGS or BENEFITS** - Include discounts, "most popular", ROI, or competitive advantages\n`
      context += `5. **Be PERSUASIVE and SALES-ORIENTED** - Market the plan enthusiastically\n`
      context += `6. **Compare when relevant** - Help users understand which plan fits their needs\n\n`
      context += `Example format: "The Enterprise Plan is $500/month and is our MOST POPULAR option! Here's what you get: [list all features]. This plan is perfect for growing companies because [value prop]. Plus, you get full access to all Teamified AI Agents."\n\n`
      // </CHANGE>

      context += `**CANDIDATE PRICING PLANS:**\n\n`

      context += `1. Free Plan - $0/month\n`
      context += `   Features:\n`
      context += `   - Basic job search and matching\n`
      context += `   - Limited AI agent interactions (10/month)\n`
      context += `   - Resume upload and basic parsing\n`
      context += `   - Email notifications for new matches\n`
      context += `   - Access to public job board\n\n`

      context += `2. Premium Monthly - $19.99/month (ON SALE from $29.99 - SAVE $10/month)\n`
      context += `   Features:\n`
      context += `   - Everything in Free Plan\n`
      context += `   - Unlimited AI agent interactions\n`
      context += `   - Advanced resume optimization\n`
      context += `   - Priority job matching\n`
      context += `   - Interview preparation tools\n`
      context += `   - AI Mock Interviews\n`
      context += `   - Access to Teamified Learning\n`
      context += `   - Salary insights and negotiation tips\n`
      context += `   - Direct messaging with recruiters\n`
      context += `   - Application tracking dashboard\n`
      context += `   - Career coaching sessions (2/month)\n`
      context += `   - Early access to new features\n\n`

      context += `3. Premium Annual - $149/year (BEST VALUE - was $239.88, SAVE $90.88/year - 38% OFF)\n`
      context += `   - Save $90.88 per year (38% discount)\n`
      context += `   - Everything in Premium Monthly\n`
      context += `   - Billed annually at $149/year\n`
      context += `   - Less than $1/day investment in your career!\n\n`

      context += `**HIRING MANAGER PRICING PLANS:**\n\n`

      context += `1. Basic Plan - $300/month\n`
      context += `   Best for: Small teams needing payroll and HR essentials\n`
      context += `   Features:\n`
      context += `   💰 PAYROLL:\n`
      context += `   - Global payroll & payslips\n`
      context += `   - Taxes, insurance, and local benefits\n`
      context += `   👥 HR:\n`
      context += `   - HR record keeping & reporting\n`
      context += `   ✨ TEAMIFIED AI:\n`
      context += `   - Limited Access to Teamified AI Agents\n`
      context += `   Ideal for: Companies that need basic payroll and HR management without recruitment services\n\n`

      context += `2. Recruiter Plan - 9% of base salary per hire\n`
      context += `   Best for: Companies focused on hiring (pay only for successful placements - NO UPFRONT COSTS!)\n`
      context += `   Features:\n`
      context += `   🎯 HIRING:\n`
      context += `   - Full recruitment lifecycle\n`
      context += `   - Local compliance & onboarding\n`
      context += `   🤝 MANAGEMENT:\n`
      context += `   - HR and performance management\n`
      context += `   - Employment contracts & benefits setup\n`
      context += `   ✨ TEAMIFIED AI:\n`
      context += `   - Limited Access to Teamified AI Agents\n`
      context += `   Ideal for: Organizations that want to pay only when they successfully hire, with no upfront monthly costs. Perfect for companies with sporadic hiring needs\n\n`

      context += `3. Enterprise Plan - $500/month ⭐ MOST POPULAR ⭐\n`
      context += `   Best for: Growing companies needing equipment and workspace solutions\n`
      context += `   Features:\n`
      context += `   💻 EQUIPMENT:\n`
      context += `   - Managed laptops and accessories\n`
      context += `   🏢 WORKSPACE:\n`
      context += `   - Smart office locations\n`
      context += `   - Workspace and IT setup\n`
      context += `   ✨ TEAMIFIED AI:\n`
      context += `   - Full Access to Teamified AI Agents (UPGRADE from Basic/Recruiter!)\n`
      context += `   Ideal for: Companies that want to provide equipment and office space for their teams, with comprehensive AI support for all HR and recruitment needs\n\n`

      context += `4. Premium Plan - 30% of base salary + $300/month 🏆 ALL-IN SOLUTION 🏆\n`
      context += `   Best for: Organizations wanting a complete, hands-off solution with white-glove service\n`
      context += `   Features:\n`
      context += `   🤝 SERVICE:\n`
      context += `   - Dedicated account management (EXCLUSIVE!)\n`
      context += `   - Continuous HR & compliance support\n`
      context += `   🤝 MANAGEMENT:\n`
      context += `   - Payroll + performance oversight\n`
      context += `   - Centralized reporting tools\n`
      context += `   💻 EQUIPMENT:\n`
      context += `   - Laptop + Office Space (included!)\n`
      context += `   ✨ TEAMIFIED AI:\n`
      context += `   - Full Access to Teamified AI Agents + Dashboarding & Analytics (PREMIUM ONLY!)\n`
      context += `   Ideal for: Companies that want a comprehensive, managed solution with dedicated support, equipment, workspace, and premium AI features including advanced analytics. This is the most complete package with everything included\n\n`

      context += `**KEY VALUE PROPOSITIONS TO EMPHASIZE:**\n`
      context += `- Basic Plan: Most affordable entry point at only $300/month for essential payroll and HR\n`
      context += `- Recruiter Plan: Zero upfront costs, only 9% when you successfully hire - risk-free recruitment\n`
      context += `- Enterprise Plan: Our most popular choice! Full AI access + equipment + workspace for $500/month\n`
      context += `- Premium Plan: White-glove service with dedicated account manager and advanced analytics\n`
      context += `- Candidate Premium saves up to 38% annually - less than $1/day for career acceleration\n\n`

      context += `**COMPARISON NOTES:**\n`
      context += `- Candidate Premium Monthly is currently on sale (33% off - LIMITED TIME!)\n`
      context += `- Candidate Premium Annual offers 38% savings compared to monthly (BEST VALUE!)\n`
      context += `- Hiring Manager Enterprise Plan is the most popular option (chosen by majority of clients)\n`
      context += `- Hiring Manager Recruiter Plan uses performance-based pricing (only pay for successful hires - NO RISK!)\n`
      context += `- Hiring Manager Premium Plan includes everything for comprehensive support (ALL-IN-ONE SOLUTION)\n\n`

      context += `Remember: Always be enthusiastic, specific about features, and emphasize the value and ROI of each plan. Help users understand not just WHAT they get, but WHY it matters and HOW it will benefit them.\n`
      // </CHANGE>
      break

    case "contract":
      context += `The user is viewing the Service Agreement.\n\n`
      context += `**TEAMIFIED SERVICE AGREEMENT**\n\n`
      if (content.contractData) {
        const contract = content.contractData
        context += `**Contract Details:**\n`
        context += `- Title: ${contract.title}\n`
        context += `- Company: ${contract.parties.company}\n`
        context += `- Client: ${contract.parties.client}\n`
        context += `- Effective Date: ${contract.effectiveDate}\n`
        context += `- Term: ${contract.term}\n`
        context += `- Status: ${contract.status}\n\n`

        context += `**CONTRACT SECTIONS:**\n\n`

        contract.sections.forEach((section) => {
          context += `**${section.title}** (ID: ${section.id})\n`
          context += `${section.content}\n\n`

          if (section.subsections && section.subsections.length > 0) {
            section.subsections.forEach((subsection) => {
              context += `  **${subsection.title}** (ID: ${subsection.id})\n`
              context += `  ${subsection.content}\n\n`
            })
          }
        })

        if (contract.signatories && contract.signatories.length > 0) {
          context += `\n**SIGNATORIES:**\n`
          contract.signatories.forEach((signatory) => {
            context += `- ${signatory.name}, ${signatory.position} (Signed: ${signatory.date})\n`
          })
          context += `\n`
        }

        context += `\n**INSTRUCTIONS FOR ANSWERING CONTRACT QUESTIONS:**\n`
        context += `- When a user asks about specific contract terms (fees, termination, confidentiality, etc.), ALWAYS reference the relevant section by its ID in your response.\n`
        context += `- Format section references like this: "According to [Section IV.B]..." or "As stated in [Section I.C]..."\n`
        context += `- Put the section ID in square brackets so it can be detected and used for auto-scrolling.\n`
        context += `- Examples:\n`
        context += `  * For fees: Reference [Section IV.B] for pricing structure\n`
        context += `  * For termination: Reference [Section I.C] for client termination, [Section I.D] for breach termination\n`
        context += `  * For confidentiality: Reference [Section VI.A]\n`
        context += `  * For intellectual property: Reference [Section VI.B]\n`
        context += `  * For payment terms: Reference [Section IV.C]\n`
        context += `  * For personnel: Reference [Section III]\n`
        context += `- The contract workspace will automatically scroll to the section you reference when you use the [Section X] format.\n`
      } else {
        context += "Contract data is not available."
      }
      break

    // </CHANGE>
    // </CHANGE>

    case "analytics":
      if (content.jobs && content.jobs.length > 0) {
        context += `The user is viewing a job comparison with ${content.jobs.length} positions:\n\n`
        content.jobs.forEach((job: JobListing, index: number) => {
          context += `**Job ${index + 1}: ${job.title}**\n`
          context += `- Company: ${job.company}\n`
          context += `- Location: ${job.location}\n`
          context += `- Salary: ${job.salary}\n`
          context += `- Type: ${job.type}\n`
          if (job.skillMatch) context += `- Skill Match: ${job.skillMatch}%\n`
          if (job.requirements && job.requirements.length > 0) {
            context += `- Key Requirements: ${job.requirements.slice(0, 3).join(", ")}\n`
          }
          if (job.benefits && job.benefits.length > 0) {
            context += `- Benefits: ${job.benefits.slice(0, 3).join(", ")}\n`
          }
          if (index < content.jobs.length - 1) context += `\n`
        })
        context += `\nYou can answer questions comparing these specific jobs, their salaries, requirements, benefits, locations, or skill matches.\n`
      } else {
        context += `The user is viewing general analytics.\n`
      }
      break

    default:
      if (content.title) {
        context += `The user is viewing: ${content.title}\n`
      }
  }

  return context
}

// </CHANGE>

// Helper function to convert Arabic numerals to Roman numerals
const arabicToRoman = (num: number): string => {
  if (isNaN(num)) return ""
  const lookup: { [key: number]: string } = {
    1: "i",
    2: "ii",
    3: "iii",
    4: "iv",
    5: "v",
    6: "vi",
    7: "vii",
    8: "viii",
    9: "ix",
    10: "x",
  }
  return lookup[num] || ""
}

// Helper function to convert Roman numerals to Arabic
const romanToArabic = (roman: string): number => {
  if (!roman) return 0
  const romanMap: { [key: string]: number } = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  }
  let result = 0
  let prevValue = 0
  for (let i = roman.length - 1; i >= 0; i--) {
    const currentValue = romanMap[roman[i].toUpperCase()]
    if (currentValue < prevValue) {
      result -= currentValue
    } else {
      result += currentValue
    }
    prevValue = currentValue
  }
  return result
}

export const ChatMain = forwardRef<ChatMainRef, ChatMainProps>(
  (
    {
      isSidebarOpen,
      onToggleSidebar,
      onOpenWorkspace,
      initialAgentId,
      shouldShowWelcome = false,
      currentWorkspaceContent: externalWorkspaceContent,
      // </CHANGE>
      currentJobBoardTab,
      onSetJobBoardTab,
      userType, // Added userType
      onWorkspaceUpdate, // Added for voice mode integration
    },
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
    const [hiringManagerAgentId, setHiringManagerAgentId] = useState<string | null>(null)
    const [isHiringManagerIntroduction, setIsHiringManagerIntroduction] = useState(false)
    // </CHANGE>
    const [isThinking, setIsThinking] = useState(false) // Declare isThinking
    const [isCentered, setIsCentered] = useState(true) // Declare isCentered

    const currentRequestAgentRef = useRef<string>(activeAgent.id)
    // </CHANGE>

    const lastUserMessageRef = useRef<HTMLDivElement>(null)
    const lastMessageRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const agentDropdownRef = useRef<HTMLDivElement>(null)
    const voiceModeRef = useRef<VoiceModeRef>(null) // Ref for VoiceMode methods

    // State for workspace management, tied to voice mode commands
    const [isWorkspaceOpen, setWorkspaceOpen] = useState(false)
    const [workspaceType, setWorkspaceType] = useState<WorkspaceContent["type"] | null>(null)
    const [currentWorkspaceContent, setCurrentWorkspaceContent] = useState<WorkspaceContent | null>(null) // Added internal state for workspace content

    const handleCommandFromUI = useCallback(
      (workspaceData: WorkspaceContent, skipAIConfirmation?: boolean) => {
        onOpenWorkspace(workspaceData)
        setHasOpenedWorkspace(true)
        setLastWorkspaceContent(workspaceData)
        setCurrentWorkspaceContent(workspaceData)

        // Only send AI confirmation if explicitly not skipped
        if (!skipAIConfirmation) {
          // Send confirmation message logic here if needed
          // For example, adding a message to localMessages that indicates the workspace was opened.
          const confirmationMessage: Message = {
            id: `ui-command-${Date.now()}`,
            type: "ai",
            content: `Opening ${workspaceData.title || workspaceData.type} for you.`,
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }
          setLocalMessages((prev) => [...prev, confirmationMessage])
        }
      },
      [onOpenWorkspace, activeAgent.id, setLocalMessages], // Added activeAgent.id and setLocalMessages to dependencies
    )
    // </CHANGE>

    const getCommandsContext = useCallback((agent: AIAgent): string => {
      const commandsList = agent.actions.map((action) => `- *${action} - ${formatCommandName(action)}`).join("\n")

      return `\n\n## Available Commands for ${agent.name} ${agent.icon}

- *help - Show this command list
${commandsList}

Simply type any command or ask your questions naturally!`
    }, [])
    // </CHANGE>

    const workspaceContext = useMemo(() => {
      return formatWorkspaceContext(currentWorkspaceContent)
    }, [currentWorkspaceContent])
    // </CHANGE>

    useEffect(() => {
      if (externalWorkspaceContent) {
        // Sync external workspace content
        setCurrentWorkspaceContent(externalWorkspaceContent)
      } else {
        // Clear internal state if external content is null
        setCurrentWorkspaceContent(null)
      }
    }, [externalWorkspaceContent])
    // </CHANGE>

    // useEffect to update isCentered based on localMessages length
    useEffect(() => {
      setIsCentered(localMessages.length === 0)
    }, [localMessages])

    // useEffect for scrollIntoView needs to be aware of isThinking to avoid scrolling
    // when a thinking animation is playing and the user is not actively scrolling.
    useEffect(() => {
      if (messagesEndRef.current && !isThinking) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, [localMessages, isThinking])

    const chatBody = useMemo(
      () => ({
        agentId: activeAgent.id,
        workspaceContext,
        commandsContext: getCommandsContext(activeAgent),
        // </CHANGE>
      }),
      [activeAgent.id, workspaceContext, getCommandsContext, activeAgent],
    )
    // </CHANGE>

    const {
      messages: aiMessages,
      sendMessage,
      status,
      setMessages,
    } = useChat({
      transport: new DefaultChatTransport({ api: "/api/chat" }),
      body: chatBody, // Use memoized body object
      initialMessages: [], // Start with an empty array, welcome messages are handled separately
      onError: (error) => {
        // console.error("[v0] useChat error:", error) // Removed console.log
        setIsThinking(false) // Ensure thinking state is reset on error
      },
      onFinish: (message) => {
        // console.log("[v0] useChat finished:", message) // Removed console.log
        setIsThinking(false) // Ensure thinking state is reset when AI finishes
      },
      // Add onResponse to track when the AI starts responding
      onResponse: async (response) => {
        // console.log("[v0] useChat onResponse started") // Removed console.log
        setIsThinking(true) // Set thinking state to true when AI starts responding
        // If streaming, the actual message content will be processed later.
        // We just need to know that the AI has started generating a response.
      },
    })

    const handleCommandOrMessage = useCallback(
      (text: string): boolean => {
        const lowerText = text.toLowerCase().trim()

        // Helper function to generate short response
        const generateShortResponse = () => {
          return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        }

        // Helper function to generate large text response
        const generateLargeResponse = () => {
          return `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

At vero eos et accusamus et iusto odio dignissim ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.

## Conclusion

In summary, these fundamental principles provide a comprehensive framework for understanding the essential concepts discussed above. The interconnected nature of these ideas demonstrates their significance in practical applications.`
        }

        // Helper function to generate bullet text response
        const generateBulletResponse = () => {
          return `• Lorem ipsum dolor sit amet, consectetur adipiscing elit
• Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
• Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
• Duis aute irure dolor in reprehenderit in voluptate velit
• Excepteur sint occaecat cupidatat non proident sunt in culpa`
        }
        // </CHANGE>

        // 1. Text - simple text response
        if (lowerText === "text") {
          const userMsg: Message = {
            id: Date.now().toString(),
            type: "user",
            content: text,
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: generateShortResponse(),
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          setLocalMessages((prev) => [...prev, userMsg, aiMsg])
          return true
        }

        // 2. Large Text
        if (lowerText === "large text") {
          const userMsg: Message = {
            id: Date.now().toString(),
            type: "user",
            content: text,
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: generateLargeResponse(),
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
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
            timestamp: new Date().toISOString(),
          }

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: generateBulletResponse(),
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
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
            timestamp: new Date().toISOString(),
          }

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: generateShortResponse(),
            responseType: "file",
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
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
            timestamp: new Date().toISOString(),
          }

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: generateLargeResponse(),
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          // Open PDF viewer in workspace
          const workspaceData: WorkspaceContent = { type: "pdf", title: "candidate-resume.pdf" }
          onOpenWorkspace(workspaceData)
          setHasOpenedWorkspace(true)
          setLastWorkspaceContent(workspaceData)
          setCurrentWorkspaceContent(workspaceData)

          return true
        }

        // 6. Image (with image thumbnail, no preview change)
        if (lowerText === "image") {
          const userMsg: Message = {
            id: Date.now().toString(),
            type: "user",
            content: text,
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: generateShortResponse(),
            responseType: "image",
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          setLocalMessages((prev) => [...prev, userMsg, aiMsg])
          return true
        }

        // 7. Image Preview (opens large image preview)
        if (lowerText === "image preview") {
          const userMsg: Message = {
            id: Date.now().toString(),
            type: "user",
            content: text,
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: generateLargeResponse(),
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          // Open image preview workspace
          const workspaceData: WorkspaceContent = { type: "image", title: "Image Gallery" }
          onOpenWorkspace(workspaceData)
          setHasOpenedWorkspace(true)
          setLastWorkspaceContent(workspaceData)
          setCurrentWorkspaceContent(workspaceData)

          return true
        }

        // 8. Video Preview (opens video player)
        if (lowerText === "video preview") {
          const userMsg: Message = {
            id: Date.now().toString(),
            type: "user",
            content: text,
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: generateLargeResponse(),
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          // Open video player workspace
          const workspaceData: WorkspaceContent = { type: "video", title: "Video Player" }
          onOpenWorkspace(workspaceData)
          setHasOpenedWorkspace(true)
          setLastWorkspaceContent(workspaceData)
          setCurrentWorkspaceContent(workspaceData)

          return true
        }

        // 9. Code (with code snippet, no preview change)
        if (lowerText === "code") {
          const userMsg: Message = {
            id: Date.now().toString(),
            type: "user",
            content: text,
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          const codeSnippet = `// Sample code snippet
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

const cart = [
  { name: 'Product 1', price: 29.99 },
  { name: 'Product 2', price: 49.99 }
];

console.log('Total:', calculateTotal(cart));`

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: codeSnippet,
            responseType: "code",
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          setLocalMessages((prev) => [...prev, userMsg, aiMsg])
          return true
        }

        // 10. Code Preview (opens code preview with file structure)
        if (lowerText === "code preview") {
          const userMsg: Message = {
            id: Date.now().toString(),
            type: "user",
            content: text,
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content:
              "Opening the code editor with your take-home challenge. You can view files, edit code, and submit when ready.",
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          // Open code preview workspace
          const workspaceData: WorkspaceContent = { type: "code", title: "Take Home Challenge" }
          onOpenWorkspace(workspaceData)
          setHasOpenedWorkspace(true)
          setLastWorkspaceContent(workspaceData)
          setCurrentWorkspaceContent(workspaceData)

          return true
        }

        // 11. Apply for job
        if (lowerText === "apply for job") {
          const userMsg: Message = {
            id: Date.now().toString(),
            type: "user",
            content: text,
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: `Great! I'm excited to help you apply for this position.

Here's how our application process works:

**Step 1: Take Home Challenge**

First, you'll complete a take-home challenge that's designed to showcase your skills in a real-world scenario. This challenge is tailored to the role you're applying for and typically takes 2-4 hours to complete.

**Step 2: AI Interviews**

After submitting your take-home challenge, you'll participate in our AI interviews. These are:

- 🎯 Personalized based on your role and experience
- 📊 Recorded for review by the hiring manager
- 🚀 Completed at your convenience

**Step 3: Meet the Hiring Manager!**

After you complete both the take-home challenge and AI interviews, we'll compile your complete application package for the hiring manager's review.

Ready to get started? Let's begin with the take-home challenge!`,
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          setLocalMessages((prev) => [...prev, userMsg, aiMsg])
          return true
        }

        // 12. Take Home Challenge
        if (lowerText === "take home challenge") {
          const userMsg: Message = {
            id: Date.now().toString(),
            type: "user",
            content: text,
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: `Great! You're about to start your **Take Home Challenge**. This is an important step in the application process where you'll demonstrate your technical skills.

**Important Information:**
- ⏱️ You'll have **4 hours** to complete the challenge once you begin
- 💾 Your work will be auto-saved as you code
- 📤 Submit when you're ready or save as a draft

I'm opening the coding environment for you now. Good luck!`,
            agentId: activeAgent.id,
            timestamp: new Date().toISOString(),
          }

          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          // Show loading state
          const loadingData: WorkspaceContent = { type: "challenge-loading" }
          onOpenWorkspace(loadingData)
          setHasOpenedWorkspace(true)
          setCurrentWorkspaceContent(loadingData)

          // After a delay, open the actual code workspace
          setTimeout(() => {
            const workspaceData: WorkspaceContent = { type: "code", title: "Take Home Challenge" }
            onOpenWorkspace(workspaceData)
            setLastWorkspaceContent(workspaceData)
            setCurrentWorkspaceContent(workspaceData)
          }, 2000)

          return true
        }

        // If no reserved command matched, return false
        return false
      },
      [
        activeAgent,
        onOpenWorkspace,
        setLocalMessages,
        setHasOpenedWorkspace,
        setLastWorkspaceContent,
        setCurrentWorkspaceContent,
      ],
    )
    // </CHANGE>

    const handleTranscriptionUpdate = useCallback(
      (userText: string, aiText: string) => {
        // Check if we're viewing the contract workspace and if the AI response contains section references
        if (currentWorkspaceContent?.type === "contract" && aiText && currentWorkspaceContent.contractData) {
          // Match section references in the format [Section X] or [Section X.Y]
          const sectionRefMatch = aiText.match(/\[Section\s+([IVXLCDM]+)(?:\.([A-Z]))?\]/i)

          if (sectionRefMatch) {
            const romanNumeral = sectionRefMatch[1]
            const subsection = sectionRefMatch[2]

            // Convert Roman numeral to Arabic number
            const sectionNumber = romanToArabic(romanNumeral)

            // Build section ID
            let sectionId = `section-${sectionNumber}`
            if (subsection) {
              sectionId += `-${subsection.toLowerCase()}`
            }

            // Find the section in the contract data
            const section = currentWorkspaceContent.contractData.sections.find((s) => {
              if (s.id === sectionId) return true
              return s.subsections?.some((sub) => sub.id === sectionId)
            })

            if (section) {
              // Update workspace content with highlighted section
              if (onWorkspaceUpdate) {
                onWorkspaceUpdate({
                  ...currentWorkspaceContent,
                  highlightSection: sectionId,
                })
              }
            }
          }
        }

        // Add the transcriptions to chat messages
        if (userText) {
          const userMsg = {
            id: `voice-user-${Date.now()}`,
            type: "user" as const,
            content: userText,
            timestamp: new Date().toISOString(), // ISO string for consistency
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg])
        }

        if (aiText) {
          const aiMsg = {
            id: `voice-ai-${Date.now()}`,
            type: "ai" as const,
            content: aiText,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, aiMsg])
        }
      },
      [activeAgent.id, currentWorkspaceContent, onWorkspaceUpdate],
    )
    // </CHANGE>

    useEffect(() => {
      if (aiMessages.length === 0) {
        return
      }

      const latestAiMessage = aiMessages[aiMessages.length - 1]

      if (!latestAiMessage || latestAiMessage.role !== "assistant") {
        return
      }

      // Only process if contract workspace is open and has contract data
      if (!currentWorkspaceContent || currentWorkspaceContent.type !== "contract") {
        return
      }

      if (!currentWorkspaceContent.contractData) {
        return
      }

      // Parse for section references - more flexible patterns
      // Matches: [Section IV.B], [Section IV], Section IV.B, Section IV, etc.
      const sectionReferenceRegex = /\[?Section\s+([IVXLCDM]+)(?:\.([A-Z]))?\]?/gi
      const matches = [...(latestAiMessage.content?.matchAll(sectionReferenceRegex) || [])]

      if (matches.length > 0) {
        // Use the first reference found
        const firstMatch = matches[0]
        const romanNumeral = firstMatch[1] // e.g., "IV"
        const subsectionLetter = firstMatch[2] // e.g., "B" (optional)

        // Convert Roman numeral to Arabic
        const arabicNumber = romanToArabic(romanNumeral)

        if (arabicNumber > 0) {
          // Find the matching section in contract data
          const contract = currentWorkspaceContent.contractData
          const targetSection = contract.sections.find((section) => {
            const sectionIdParts = section.id.split("-")
            // Assumes section ID format is like "section-1", "section-4", etc.
            return sectionIdParts[1] === arabicNumber.toString()
          })

          if (targetSection) {
            let targetId = targetSection.id // Default to main section ID

            // If there's a subsection letter, try to find it
            if (subsectionLetter && targetSection.subsections) {
              // Find subsection by matching the letter (case-insensitive)
              const targetSubsection = targetSection.subsections.find((sub) => {
                const subIdParts = sub.id.split("-")
                // Assumes subsection ID format is like "section-4-a", "section-4-b", etc.
                return subIdParts[2]?.toLowerCase() === subsectionLetter.toLowerCase()
              })

              if (targetSubsection) {
                targetId = targetSubsection.id
              }
            }

            // Update workspace with highlight
            const updatedWorkspace: WorkspaceContent = {
              ...currentWorkspaceContent,
              highlightSection: targetId,
            }

            setCurrentWorkspaceContent(updatedWorkspace) // Update local state

            // Trigger update in parent component if necessary
            if (onWorkspaceUpdate) {
              onWorkspaceUpdate(updatedWorkspace)
            }
          }
        }
      }
    }, [aiMessages, currentWorkspaceContent, onWorkspaceUpdate])
    // </CHANGE>

    useEffect(() => {
      const convertedMessages: Message[] = aiMessages.map((msg) => {
        let messageAgentId: string | undefined

        // Try extra data first (AI SDK v5 format)
        if (msg.extra?.agentId) {
          messageAgentId = msg.extra.agentId as string
        }
        // Then, try providerMetadata from the API response (legacy)
        else if (msg.providerMetadata?.agentId) {
          messageAgentId = msg.providerMetadata.agentId as string
        }
        // Check all parts for providerMetadata (AI SDK v5 format, though unlikely for agentId)
        else if (msg.parts) {
          for (const part of msg.parts) {
            if (part.providerMetadata?.agentId) {
              messageAgentId = part.providerMetadata.agentId as string
              break
            }
          }
        }

        // For AI responses without explicit agentId metadata, use the current request's agent
        // This is crucial for continuity when switching agents or when an agent's ID isn't passed.
        const agentForMessage = messageAgentId
          ? AI_AGENTS.find((a) => a.id === messageAgentId) || AI_AGENTS[0] // Use found agent or default
          : msg.role === "assistant"
            ? AI_AGENTS.find((a) => a.id === currentRequestAgentRef.current) || AI_AGENTS[0] // Fallback to agent used for the request
            : AI_AGENTS[0] // Default if not assistant or agentId not found

        // </CHANGE>

        let content = ""
        // Handle AI SDK v5 parts array format
        if (msg.parts && msg.parts.length > 0) {
          content = msg.parts
            .map((part) => {
              // Only extract text from text parts, ignore tool parts or other types
              if (part.type === "text") {
                return part.text || ""
              }
              return ""
            })
            .join("")
        } else if (msg.content) {
          // Fallback for older message format or if content is just a string
          content = typeof msg.content === "string" ? msg.content : ""
        }

        // The contract section highlighting logic is now moved to the dedicated useEffect above.
        // This section should primarily focus on converting the AI SDK message format to our Message interface.

        // </CHANGE>

        const responseType = msg.extra?.responseType
        const thinkingTime = msg.extra?.thinkingTime
        const promptSuggestions = msg.extra?.promptSuggestions
        const hasActionButton = msg.extra?.hasActionButton
        const actionButtonText = msg.extra?.actionButtonText
        const actionButtonHandler = msg.extra?.actionButtonHandler
        const avatar = msg.extra?.avatar // For candidate messages
        const senderName = msg.extra?.senderName // For candidate messages

        return {
          id: msg.id,
          type: msg.role === "user" ? "user" : "ai",
          content,
          agentId: agentForMessage.id, // Use the determined agent ID
          responseType,
          thinkingTime,
          promptSuggestions,
          hasActionButton,
          actionButtonText,
          actionButtonHandler,
          avatar,
          senderName,
        }
      })

      if (isHiringManagerIntroduction) {
        // When introducing a hiring manager, we want to clear previous messages
        // and only display the new AI introduction message.
        const newAiMessages = convertedMessages.filter(
          (m) => m.type === "ai" && !localMessages.some((lm) => lm.id === m.id),
        )

        if (newAiMessages.length > 0) {
          setLocalMessages([...newAiMessages])
          // Clear the flag after the first AI response
          setIsHiringManagerIntroduction(false)
          setIsThinking(false) // Ensure thinking state is reset after intro
        }
        return
      }
      // </CHANGE>

      const aiMessageIds = new Set(convertedMessages.map((m) => m.id))

      // Preserve local messages that are not part of the new AI messages
      // This prevents losing user messages or older AI messages that weren't re-sent.
      const preservedLocalMessages = localMessages.filter((m) => !aiMessageIds.has(m.id))

      // Prevent clearing welcome messages if there are no other messages and no new AI messages
      const hasWelcomeMessages = localMessages.some((m) => m.isWelcome)
      const wouldClearWelcome =
        hasWelcomeMessages && preservedLocalMessages.length === 0 && convertedMessages.length === 0

      if (wouldClearWelcome) {
        return
      }

      // Combine preserved local messages with new AI messages
      const newMessages = [...preservedLocalMessages, ...convertedMessages]

      // Ensure messages are sorted chronologically if we're mixing local and AI messages.
      // The AI SDK usually returns messages in order, but this is a safeguard.
      if (preservedLocalMessages.length > 0 && convertedMessages.length > 0) {
        newMessages.sort((a, b) => {
          const getTimestamp = (msg: Message) => {
            // Attempt to extract a numeric timestamp from the message ID.
            // This handles common formats like "123456789", "voice-user-123456789", "cmd-ai-123456789".
            const timestampMatch = msg.id.match(/(\d{13,})/) // Look for a 13+ digit number (typical for JS timestamps)
            if (timestampMatch) {
              const timestamp = Number.parseInt(timestampMatch[1])
              // Ensure it's a plausible timestamp (e.g., greater than 10 years in milliseconds)
              if (!isNaN(timestamp) && timestamp > 1000000000000) {
                return timestamp
              }
            }

            // Try parsing the entire ID as a number if it looks like a timestamp.
            const idAsNumber = Number.parseInt(msg.id)
            if (!isNaN(idAsNumber) && idAsNumber > 1000000000000) {
              return idAsNumber
            }

            // Fallback to using the 'timestamp' property if available.
            if (msg.timestamp) {
              try {
                return new Date(msg.timestamp).getTime()
              } catch (e) {
                // console.warn("[v0] Could not parse timestamp:", msg.timestamp, e) // Removed console.log
              }
            }

            // Last resort: return 0. This will maintain the original insertion order for messages without valid timestamps.
            return 0
          }

          const timestampA = getTimestamp(a)
          const timestampB = getTimestamp(b)

          // If timestamps are the same, maintain the existing order (effectively insertion order).
          if (timestampA === timestampB) {
            return 0
          }

          return timestampA - timestampB
        })
      }

      // Only update the state if the messages have actually changed to prevent unnecessary re-renders.
      const messagesChanged =
        newMessages.length !== localMessages.length ||
        newMessages.some((msg, idx) => {
          // Check for changes in ID, content, and potentially other critical fields.
          return (
            idx >= localMessages.length || // New messages added
            msg.id !== localMessages[idx]?.id ||
            msg.content !== localMessages[idx]?.content
          )
        })

      if (messagesChanged) {
        setLocalMessages(newMessages)
      }
      // If the AI just finished and the last message is an AI message, stop thinking.
      if (aiMessages.length > 0) {
        const lastMsg = newMessages[newMessages.length - 1]
        if (lastMsg.type === "ai") {
          setIsThinking(false)
        }
      }
    }, [
      aiMessages,
      activeAgent,
      localMessages,
      isHiringManagerIntroduction,
      currentRequestAgentRef,
      setLocalMessages,
      setMessages,
    ])

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

    // useEffect for scrollIntoView needs to be aware of isThinking to avoid scrolling
    // when a thinking animation is playing and the user is not actively scrolling.
    useEffect(() => {
      if (messagesEndRef.current && !isThinking) {
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

        setMessages([]) // Clear existing AI messages

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
        setIsThinking(false) // Ensure thinking is false after this initial setup
      }
    }, [lastWorkspaceContent, hasChallengeWelcomeShown, setMessages, activeAgent.id])

    // Declare handleStartChallenge here
    const handleStartChallenge = () => {
      setHasChallengeWelcomeShown(false)

      // Show loading animation in workspace
      onOpenWorkspace({ type: "challenge-loading", title: "Take Home Challenge" })
      setHasOpenedWorkspace(true)
      setLastWorkspaceContent({ type: "challenge-loading", title: "Take Home Challenge" })
      setCurrentWorkspaceContent({ type: "challenge-loading", title: "Take Home Challenge" }) // Update internal state

      // After a delay, show the code preview workspace
      setTimeout(() => {
        onOpenWorkspace({
          type: "code",
          title: "Take Home Challenge",
          data: codeSnippet,
        })
        // Update lastWorkspaceContent to trigger the useEffect that might reset conversation or context
        setLastWorkspaceContent({ type: "code", title: "Take Home Challenge", data: codeSnippet })
        setCurrentWorkspaceContent({ type: "code", title: "Take Home Challenge", data: codeSnippet }) // Update internal state
      }, 3000)
    }

    const handleSubmitChallengeRequest = () => {
      // Ensure Technical Recruiter agent is active
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
        agentId: technicalRecruiter?.id || "technical-recruiter",
        hasActionButton: true,
        actionButtonText: "Yes, I would like to submit my work",
        actionButtonHandler: "confirmSubmitChallenge",
      }

      setLocalMessages((prev) => [...prev, confirmationMessage])
    }

    const handleConfirmSubmitChallenge = () => {
      // Trigger submission in the workspace via a custom event
      window.dispatchEvent(new CustomEvent("confirm-challenge-submission"))

      // Add a message to the chat indicating submission is in progress
      const submittingMessage: Message = {
        id: `submitting-${Date.now()}`,
        type: "ai",
        content: `Great! I'm submitting your Take Home Challenge now. Please wait while we process your submission...`,
        agentId: activeAgent.id,
      }

      setLocalMessages((prev) => [...prev, submittingMessage])
      setIsThinking(true) // Set thinking state to true
    }

    const handleSubmissionComplete = () => {
      // Ensure Technical Recruiter agent is active
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
        agentId: technicalRecruiter?.id || "technical-recruiter",
        promptSuggestions: [
          { text: "Take AI interview", icon: <MessageSquare className="w-4 h-4" /> },
          { text: "View Application", icon: <FileText className="w-4 h-4" /> },
        ],
      }

      setLocalMessages((prev) => [...prev, followUpMessage])
      setIsThinking(false) // Ensure thinking is false after this
    }
    // </CHANGE>
    // </CHANGE>

    const handleShowCandidateChat = (candidate: CandidateProfile) => {
      // Updated type to CandidateProfile
      setCurrentChatCandidate(candidate)
      setLocalMessages([]) // Clear previous messages
      const conversationHistory = getCandidateConversation(candidate.id, candidate.name)

      // Create conversation messages from the candidate's unique history
      const conversationMessages: Message[] = conversationHistory.map((msg, index) => ({
        id: `${Date.now()}-${index}`, // Simple ID generation for mock data
        type: msg.sender === "hiring_manager" ? "user" : "ai",
        content: msg.content,
        agentId: activeAgent.id, // Use current active agent for the AI context
        ...(msg.sender === "candidate" && {
          avatar: candidate.avatar,
          senderName: candidate.name,
        }),
        timestamp: msg.timestamp,
      }))

      setLocalMessages(conversationMessages)
      // Scroll to bottom after messages are set
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 100) // Small delay to ensure rendering
    }
    // </CHANGE>

    const clearMessages = () => {
      setLocalMessages([])
      setMessages([]) // Also clear AI SDK messages
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
          // console.warn(`[v0] Agent with ID "${agentId}" not found.`) // Removed console.log
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

## ⚡ **Enterprise Plan** - $500/month ⭐ MOST POPULAR ⭐
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

## What I Can Help You With

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
        // Simulate opening an interview option modal or performing an action
        window.dispatchEvent(new CustomEvent("interview-option-selected"))

        handleSendMessage("Apply to this job")
      },
      handleStartChallenge: handleStartChallenge, // Use the declared variable
      handleSubmitChallengeRequest: handleSubmitChallengeRequest,
      handleSubmissionComplete: handleSubmissionComplete,
      // </CHANGE>
      sendMessageFromWorkspace: (message: string) => {
        // Attempt to handle as a command first
        const isCommand = detectAndHandleCommand(message) // Use detectAndHandleCommand
        if (!isCommand) {
          // If not a command, send as a regular message
          // Use the active agent for sending messages from workspace
          sendMessage(
            { text: message },
            {
              body: {
                agentId: activeAgent.id, // Pass active agent ID here
                workspaceContext, // Include workspace context
                commandsContext: getCommandsContext(activeAgent), // Include commands context
              },
            },
          )
        }
      },
      // </CHANGE>
      sendAIMessageFromWorkspace: (message: string, agentId?: string) => {
        const agent = agentId || activeAgent.id // Use provided agentId or fallback to activeAgent
        const aiMessage: Message = {
          id: Date.now().toString(), // Unique ID for the message
          type: "ai",
          content: message,
          agentId: agent, // Assign the agent ID
        }
        // </CHANGE>
        setLocalMessages((prev) => [...prev, aiMessage]) // Add the AI message to local messages
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
              { text: "Create a new job opening", icon: <Plus className="w-4 h-4" /> },
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
        setLocalMessages([]) // Clear previous messages for a new conversation context

        // Switch to Technical Recruiter agent for managing the introduction
        const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")
        if (technicalRecruiter) {
          setActiveAgent(technicalRecruiter)

          // Use a setTimeout to ensure the state updates are processed before adding the message
          setTimeout(() => {
            setLocalMessages([
              {
                id: Date.now().toString(),
                type: "ai",
                content: `Hi ${candidate.name}! 🎉 I'm excited to introduce you to ${hiringManagerName}, who is the ${position} at ${company}.

${hiringManagerName} has been reviewing candidates for this role and was really impressed with your profile, particularly your experience with ${candidate.skills.slice(0, 2).join(" and ")}. They believe you could be a great fit for their team!

I've created this group chat so you two can connect directly. ${hiringManagerName}, feel free to share more about the role and what you're looking for. ${candidate.name}, this is a great opportunity to ask questions and learn more about the position and the team.

Looking forward to seeing this conversation develop! 🚀`,
                agentId: technicalRecruiter.id, // Mark as agent switch for UI
                isAgentSwitch: true,
              },
            ])
          }, 100) // Small delay
        }
      },
      sendCandidateInsights: (candidate: CandidateProfile) => {
        // The agent should stay as the current agent when browsing candidates
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
              agentId: activeAgent.id, // Use the current active agent
            },
          ])
        }, 300) // Sync with potential fade-in animation
      },
      showJobInsights: (job: JobListing) => {
        // Switch to Account Manager agent for job insights
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
        }, 500) // Delay to allow workspace to open or update
      },
      // </CHANGE>
      // </CHANGE>
      clearMessages, // Added clearMessages to the ref methods
      introduceHiringManager: (
        hiringManagerName: string,
        position: string,
        company: string,
        hiringManagerAgentId: string,
      ) => {
        // Clear messages and reset chat context for a new introduction
        setLocalMessages([])
        setCurrentChatCandidate(null)

        setIsHiringManagerIntroduction(true) // Set flag to indicate hiring manager intro mode
        // </CHANGE>

        // Switch to the Technical Recruiter agent to facilitate the introduction
        const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")
        if (technicalRecruiter) {
          setActiveAgent(technicalRecruiter)

          const currentUser = getCurrentUser()
          const candidateName = currentUser?.name || "there" // Get current user's name or default

          const introductionTimestamp = Date.now() // Use a timestamp for unique ID

          // Add the introduction message to local messages immediately for display
          setLocalMessages([
            {
              id: introductionTimestamp.toString(), // Unique ID based on timestamp
              type: "ai",
              content: `Hi ${candidateName}! 🎉 I'm excited to introduce you to ${hiringManagerName}, who is the ${position} at ${company}.

${hiringManagerName} has been reviewing candidates for this role and was really impressed with your profile, particularly your experience and skills. They believe you could be a great fit for their team!

I've created this group chat so you two can connect directly. ${hiringManagerName}, feel free to share more about the role and what you're looking for. ${candidateName}, this is a great opportunity to ask questions and learn more about the position and the team.

Looking forward to seeing this conversation develop! 🚀`,
              agentId: technicalRecruiter.id, // Assign the technical recruiter agent ID
              isAgentSwitch: true, // Mark as an agent switch for UI indication
              // Add timestamp for sorting and display
              timestamp: new Date(introductionTimestamp).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
              // Provide prompt suggestions for the candidate to respond
              promptSuggestions: [
                {
                  text: "Hi! I'm excited to learn more about this role",
                  icon: <MessageSquare className="w-4 h-4" />,
                },
                { text: "Can you tell me more about the team?", icon: <Users className="w-4 h-4" /> },
                { text: "What does a typical day look like in this role?", icon: <Briefcase className="w-4 h-4" /> },
              ],
            },
          ])

          // Store the hiring manager agent ID so that subsequent user messages are directed correctly.
          setHiringManagerAgentId(hiringManagerAgentId)
        }
      },
      // </CHANGE>
      // </CHANGE>
    }))

    // Use useCallback for voice mode callbacks to ensure stable references
    const handleVoiceTranscription = useCallback(
      (userText: string, aiText: string) => {
        // Create user message from transcription
        const userMsg: Message = {
          id: `voice-user-${Date.now()}`,
          type: "user",
          content: userText,
          timestamp: new Date().toISOString(), // ISO string for consistency
          agentId: activeAgent.id,
        }

        // Create AI message from transcribed AI response
        const aiMsg: Message = {
          id: `voice-ai-${Date.now()}`,
          type: "ai",
          content: aiText,
          timestamp: new Date().toISOString(),
          agentId: activeAgent.id,
        }

        // Add both messages to the local message list
        setLocalMessages((prev) => [...prev, userMsg])
        setLocalMessages((prev) => [...prev, aiMsg])
      },
      [activeAgent.id], // Dependency: active agent's ID
    )

    const handleVoiceModeAgentChange = useCallback((agent: AIAgent) => {
      setActiveAgent(agent) // Update the active agent state
    }, [])

    const handleAgentChange = useCallback(
      (agent: AIAgent) => {
        setActiveAgent(agent) // Update the active agent
        setIsAgentDropdownOpen(false) // Close the dropdown

        // If currently in a candidate chat, clear it to start fresh with the new agent
        if (currentChatCandidate) {
          setCurrentChatCandidate(null)
        }

        const introMessage = generateAgentIntroduction(agent) // Generate introduction for the new agent
        const timestamp = Date.now() // Get current timestamp for message ID and sorting

        // Add the agent switch message to local messages for immediate UI update
        setLocalMessages((prev) => [
          ...prev,
          {
            id: `agent-switch-${timestamp}`, // Unique ID for the switch message
            type: "ai",
            content: introMessage,
            agentId: agent.id, // Assign the new agent's ID
            isAgentSwitch: true, // Flag to indicate an agent switch for UI styling
            timestamp: timestamp, // Store timestamp for sorting
          },
        ])

        // Also add the switch message to the AI SDK's messages array to maintain conversation history continuity
        setMessages((prev) => [
          ...prev,
          {
            id: `agent-switch-${timestamp}`,
            role: "assistant", // This is an AI message
            content: introMessage,
            extra: {
              agentId: agent.id, // Include agent ID in extra data
              timestamp,
            },
          },
        ])
      },
      [currentChatCandidate, setLocalMessages, setMessages], // Dependencies: state variables that are used and modified
    )
    // </CHANGE>

    // Detect and handle commands that should open specific workspaces or trigger actions.
    const detectAndHandleCommand = useCallback(
      async (text: string): Promise<boolean> => {
        const currentWorkspaceType = currentWorkspaceContent?.type
        const intentResult = await detectCommandIntent(text, currentWorkspaceType)

        // If it's not recognized as a command, return false to let the AI handle it.
        if (!intentResult.isCommand) {
          return false
        }

        const command = intentResult.command! // Extract the command name

        // Handle specific commands:

        // Contract Command
        if (command === "contract") {
          // Add user's command message to chat
          const userMsg = {
            id: `voice-cmd-user-${Date.now()}`,
            type: "user" as const,
            content: text,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }

          // Add AI confirmation message
          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content:
              "Opening your service agreement for review. I'm here to answer any questions you have about the contract terms.",
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          // Dynamically import contract data
          const { TEAMIFIED_CONTRACT } = await import("@/lib/contract-data")

          // Prepare workspace content for contract viewing
          const workspaceData: WorkspaceContent = {
            type: "contract",
            title: "Service Agreement",
            contractData: TEAMIFIED_CONTRACT,
          }
          handleCommandFromUI(workspaceData) // Use the new helper function

          return true // Command was handled
        }

        // Billing Command
        if (command === "billing") {
          // Add user's command message to chat
          const userMsg = {
            id: `voice-cmd-user-${Date.now()}`,
            type: "user" as const,
            content: text,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }

          // Dynamically import billing data
          const { mockBillingData } = await import("@/lib/mock-billing-data")

          // Add AI confirmation message with billing details
          const overdueAmount = mockBillingData.totalOverdue
          const nextPayment = mockBillingData.nextPaymentDue
          const totalInvoices = mockBillingData.invoices.length

          let billingMessage = "Here are your latest billing details. "

          if (overdueAmount > 0) {
            billingMessage += `You have $${overdueAmount.toFixed(2)} in overdue payments. `
          }

          if (nextPayment) {
            billingMessage += `Your next payment of $${nextPayment.amount.toFixed(2)} is due on ${nextPayment.dueDate}. `
          }

          billingMessage += `You have ${totalInvoices} invoices in total. Do you have any questions about your billing or specific invoices?`

          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content: billingMessage,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          // Prepare workspace content for billing viewing
          const workspaceData: WorkspaceContent = {
            type: "billing",
            title: "Billing & Invoices",
            billingData: mockBillingData,
          }
          handleCommandFromUI(workspaceData) // Use the new helper function

          return true // Command was handled
        }
        // </CHANGE>

        // Pricing Command
        if (command === "pricing" || command === "pricing plans") {
          // Check if current agent has permission to access pricing plans
          if (activeAgent.id !== "sales-marketing") {
            // Add user's command message to chat
            const userMsg = {
              id: `voice-cmd-user-${Date.now()}`,
              type: "user" as const,
              content: text,
              timestamp: new Date().toISOString(),
              agentId: activeAgent.id,
            }

            // Add denial message
            const denialMsg = {
              id: `voice-cmd-ai-${Date.now()}`,
              type: "ai" as const,
              content:
                "I don't have access to pricing information. For detailed pricing plans and subscription options, please speak with Darlyn, our Sales & Marketing agent.",
              timestamp: new Date().toISOString(),
              agentId: activeAgent.id,
            }
            setLocalMessages((prev) => [...prev, userMsg, denialMsg])

            // Speak the denial message in voice mode if applicable
            if (voiceModeRef.current?.speakResponse) {
              voiceModeRef.current.speakResponse(denialMsg.content)
            }

            return true // Command was handled (but denied)
          }

          // Add user's command message to chat
          const userMsg = {
            id: `voice-cmd-user-${Date.now()}`,
            type: "user" as const,
            content: text,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }

          // Add AI confirmation message
          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content: "Here are our pricing plans. I can help you choose the right plan based on your needs.",
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          // Prepare workspace content for pricing plans viewing
          const workspaceData: WorkspaceContent = {
            type: "pricing-plans",
            title: "Pricing Plans",
            planType: activeAgent.id.includes("candidate") ? "candidate" : "hiring-manager",
          }
          handleCommandFromUI(workspaceData) // Use the new helper function

          return true // Command was handled
        }
        // </CHANGE>

        // Compare Jobs Command
        if (command === "compare jobs") {
          const user = getCurrentUser()
          // Use mock data, differentiate between hiring manager and candidate views
          const jobList = user?.role === "hiring_manager" ? mockHiringManagerJobs : mockJobListings

          let jobsToCompare: JobListing[] = []

          if (user?.role === "hiring_manager") {
            // For hiring managers, compare the first few open jobs
            jobsToCompare = jobList.filter((j) => j.status === "open").slice(0, 2) // Limit to 2 for comparison view
          } else {
            // For candidates, compare applied or saved jobs
            jobsToCompare = jobList.filter((j) => j.applied || j.invited || j.saved).slice(0, 2) // Limit to 2
          }

          // If not enough jobs found, default to the first few available
          if (jobsToCompare.length < 2) {
            jobsToCompare = jobList.slice(0, 2)
          }

          // Add user message
          const userMsg = {
            id: `voice-cmd-user-${Date.now()}`,
            type: "user" as const,
            content: text,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }

          // Add AI confirmation message
          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content: `I've opened a comparison view for ${jobsToCompare.length} positions. You can see key details side by side to help you make a decision.`,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          // Prepare workspace content for job comparison (using 'analytics' type for now)
          const workspaceData: WorkspaceContent = {
            type: "analytics", // Re-using analytics type for job comparison view
            title: "Job Comparison",
            jobs: jobsToCompare, // Pass the jobs to compare
          }
          handleCommandFromUI(workspaceData) // Use the new helper function

          return true // Command was handled
        }

        // </CHANGE>

        // View Job Command
        if (command === "view job" && intentResult.jobTitle) {
          const user = getCurrentUser()
          // Use mock data
          const jobList = user?.role === "hiring_manager" ? mockHiringManagerJobs : mockJobListings

          // Attempt to find a matching job using fuzzy matching based on the title provided by intent detection
          const normalizedSearchTitle = intentResult.jobTitle.toLowerCase().trim()
          const matchedJob = jobList.find((job) => {
            const normalizedJobTitle = job.title.toLowerCase()
            // Check for exact or partial matches
            return (
              normalizedJobTitle.includes(normalizedSearchTitle) ||
              normalizedSearchTitle.includes(normalizedJobTitle) ||
              // Also check for partial word matches for better accuracy
              normalizedJobTitle
                .split(" ")
                .some((word) => normalizedSearchTitle.includes(word) && word.length > 3) ||
              normalizedSearchTitle.split(" ").some((word) => normalizedJobTitle.includes(word) && word.length > 3)
            )
          })

          if (matchedJob) {
            // Prepare workspace content for job viewing
            const workspaceData: WorkspaceContent = {
              type: "job-view",
              job: matchedJob,
              title: matchedJob.title, // Set title for workspace header
            }
            handleCommandFromUI(workspaceData) // Use the new helper function

            // Add user message to chat history to show what they requested
            const userMsg = {
              id: `voice-cmd-user-${Date.now()}`,
              type: "user" as const,
              content: text,
              timestamp: new Date().toISOString(),
              agentId: activeAgent.id,
            }
            setLocalMessages((prev) => [...prev, userMsg])

            return true // Command was handled
          } else {
            // If no job is found, return false to let the AI generate a response.
            return false
          }
        }

        // </CHANGE>

        // Browse Jobs Command
        if (command === "browse jobs") {
          // Filter for open jobs that are not applied, invited, or saved
          const browseJobs = mockJobListings.filter((j) => !j.applied && !j.invited && !j.saved && j.status === "open")

          // If the job board workspace isn't already open, open it
          if (currentWorkspaceContent?.type !== "job-board") {
            const workspaceData: WorkspaceContent = {
              type: "job-board",
              title: "Browse Jobs",
              jobs: browseJobs, // Pass the filtered jobs
              jobBoardTab: "browse", // Set the active tab
            }
            handleCommandFromUI(workspaceData) // Use the new helper function
          }

          // Update the job board tab if the component supports it
          if (onSetJobBoardTab) {
            onSetJobBoardTab("browse")
          }

          const browseResponses = [
            `Perfect! I'm opening the job board with ${browseJobs.length} available positions. Let me know if you'd like help finding roles that match your skills.`,
            `There you go! Showing ${browseJobs.length} open positions for you to explore. I can help you filter or answer questions about any of these jobs.`,
            `Alright! Here are ${browseJobs.length} available positions. Browse through them and let me know which ones interest you.`,
            `Opening the job board now with ${browseJobs.length} opportunities. I'm here to help you find the perfect match!`,
          ]

          // Add user and AI messages to chat
          const userMsg = {
            id: `voice-cmd-user-${Date.now()}`,
            type: "user" as const,
            content: text,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content: browseResponses[Math.floor(Math.random() * browseResponses.length)],
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])
          // </CHANGE>
          return true // Command handled
        }

        // Navigation commands for job board tabs
        if (command === "applied jobs" || command === "invited jobs" || command === "saved jobs") {
          const tab = command.replace(" jobs", "") as "applied" | "invited" | "saved"
          const tabName = tab === "applied" ? "applied jobs" : tab === "invited" ? "invited jobs" : "saved jobs"

          // Filter jobs based on the requested tab
          const filteredJobs = mockJobListings.filter((j) => {
            if (tab === "applied") return j.applied === true
            if (tab === "invited") return j.invited === true
            if (tab === "saved") return j.saved === true
            return false
          })

          // If job board workspace is not open, open it
          if (currentWorkspaceContent?.type !== "job-board") {
            const workspaceData: WorkspaceContent = {
              type: "job-board",
              title: "My Jobs",
              jobs: filteredJobs,
              jobBoardTab: tab,
            }
            handleCommandFromUI(workspaceData) // Use the new helper function
          }

          // Update the active tab
          if (onSetJobBoardTab) {
            onSetJobBoardTab(tab)
          }

          if (text && text.trim()) {
            const jobCount = filteredJobs.length
            let aiResponse = ""

            if (tab === "applied") {
              const appliedResponses = [
                `Perfect! Here are the ${jobCount} ${jobCount === 1 ? "position" : "positions"} you've applied to. I can help you prepare for interviews or follow up on any of these applications.`,
                `Got it! Showing your ${jobCount} applied ${jobCount === 1 ? "job" : "jobs"}. Let me know if you'd like help tracking your applications or preparing for next steps.`,
                `There you go! You've applied to ${jobCount} ${jobCount === 1 ? "position" : "positions"}. Want me to help you with interview prep or application follow-ups?`,
                `Opening your applications now. You have ${jobCount} ${jobCount === 1 ? "position" : "positions"} in progress. How can I help you with these?`,
              ]
              aiResponse = appliedResponses[Math.floor(Math.random() * appliedResponses.length)]
            } else if (tab === "invited") {
              const invitedResponses = [
                `Excellent! Here are the ${jobCount} ${jobCount === 1 ? "position" : "positions"} you've been invited to interview for. These are great opportunities! Need help preparing?`,
                `Perfect! You have ${jobCount} interview ${jobCount === 1 ? "invitation" : "invitations"}. I can help you prepare and make a great impression!`,
                `There you go! Showing your ${jobCount} invited ${jobCount === 1 ? "position" : "positions"}. Would you like tips for any of these interviews?`,
                `Opening your invitations now. You've been invited to ${jobCount} ${jobCount === 1 ? "interview" : "interviews"}. Let's get you ready!`,
              ]
              aiResponse = invitedResponses[Math.floor(Math.random() * invitedResponses.length)]
            } else if (tab === "saved") {
              const savedResponses = [
                `Great! Here are your ${jobCount} saved ${jobCount === 1 ? "job" : "jobs"}. Would you like help deciding which ones to apply to?`,
                `Perfect! Showing your ${jobCount} bookmarked ${jobCount === 1 ? "position" : "positions"}. Ready to take the next step with any of these?`,
                `There you go! You've saved ${jobCount} ${jobCount === 1 ? "job" : "jobs"}. I can help you compare them or start an application.`,
                `Opening your saved jobs now. You have ${jobCount} ${jobCount === 1 ? "position" : "positions"} marked for later. Want to review them together?`,
              ]
              aiResponse = savedResponses[Math.floor(Math.random() * savedResponses.length)]
            }

            // Add user and AI messages
            const userMsg = {
              id: `voice-cmd-user-${Date.now()}`,
              type: "user" as const,
              content: text,
              timestamp: new Date().toISOString(),
              agentId: activeAgent.id,
            }
            const aiMsg = {
              id: `voice-cmd-ai-${Date.now()}`,
              type: "ai" as const,
              content: aiResponse,
              timestamp: new Date().toISOString(),
              agentId: activeAgent.id,
            }
            setLocalMessages((prev) => [...prev, userMsg, aiMsg])

            if (voiceModeRef.current) {
              voiceModeRef.current.speakResponse(aiResponse)
            }
          }

          return true // Command handled
        }

        // Resume command
        if (command === "resume") {
          // Add user's command message to chat
          const userMsg = {
            id: `voice-cmd-user-${Date.now()}`,
            type: "user" as const,
            content: text,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }

          // Add AI confirmation message
          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content: "Opening your resume for review. I can help you with any questions you might have about it.",
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          // Prepare workspace content for resume viewing
          const workspaceData: WorkspaceContent = {
            type: "pdf", // Assuming resume is a PDF
            title: "Candidate Resume",
            // Placeholder for actual resume file path or data
            filePath: "/path/to/candidate-resume.pdf",
          }
          handleCommandFromUI(workspaceData) // Use the new helper function

          return true // Command was handled
        }

        // Hiring Manager specific job status commands
        if (command === "draft jobs" || command === "open jobs" || command === "closed jobs") {
          const status = command.replace(" jobs", "") as "draft" | "open" | "closed"
          const statusLabel = status === "draft" ? "draft jobs" : status === "open" ? "open jobs" : "closed jobs"

          // Filter jobs based on status
          const filteredJobs = mockHiringManagerJobs.filter((j) => j.status === status)

          // Create updated workspace data
          const workspaceData: WorkspaceContent = {
            type: "job-board",
            title: "Job Board",
            jobs: filteredJobs,
            jobStatusFilter: status, // Apply the filter to the workspace state
          }

          handleCommandFromUI(workspaceData) // Use the new helper function

          // Notify parent if onWorkspaceUpdate callback exists
          if (onWorkspaceUpdate) {
            onWorkspaceUpdate(workspaceData)
          }

          // Add user and AI messages
          const userMsg = {
            id: `voice-cmd-user-${Date.now()}`,
            type: "user" as const,
            content: text,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content: `Showing your ${statusLabel}. You can continue browsing while we chat.`,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])
          return true // Command handled
        }
        // </CHANGE>

        // Agent Switch Command
        if (command.startsWith("switch to ")) {
          const targetAgentName = command.replace("switch to ", "").toLowerCase()
          // Find the agent by first name (case-insensitive)
          const targetAgent = AI_AGENTS.find((agent) => agent.firstName.toLowerCase() === targetAgentName)

          // If agent found and it's different from the current active agent
          if (targetAgent && targetAgent.id !== activeAgent.id) {
            // If in voice mode, use the voice mode's agent switching handler
            if (isVoiceMode && voiceModeRef.current) {
              voiceModeRef.current.handleVerbalAgentSwitch(targetAgent)
              return true // Handled by voice mode
            }

            // Add user message
            const userMsg = {
              id: `cmd-user-${Date.now()}`,
              type: "user" as const,
              content: text,
              timestamp: new Date().toISOString(),
              agentId: activeAgent.id,
            }

            // Add AI confirmation message
            const aiMsg = {
              id: `cmd-ai-${Date.now()}`,
              type: "ai" as const,
              content: `Switching you to ${targetAgent.firstName}, our ${targetAgent.name}. One moment please...`,
              timestamp: new Date().toISOString(),
              agentId: activeAgent.id,
            }
            setLocalMessages((prev) => [...prev, userMsg, aiMsg])

            handleAgentChange(targetAgent) // Perform the agent switch

            return true // Command handled
          }
        }

        // Browse Candidates Command
        if (command === "browse candidates") {
          // Prepare workspace content for candidate browsing
          const workspaceData: WorkspaceContent = {
            type: "browse-candidates",
            title: "Browse Candidates",
            timestamp: Date.now(), // Add a timestamp for uniqueness
            // Pass current job context if available
            ...(currentWorkspaceContent?.job && { job: currentWorkspaceContent.job }),
          }
          handleCommandFromUI(workspaceData) // Use the new helper function

          // Add user and AI messages
          const userMsg = {
            id: `voice-cmd-user-${Date.now()}`,
            type: "user" as const,
            content: text,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content: "Opening the candidate browser for you. You can continue browsing while we chat.",
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          return true // Command handled
        }

        // Job Board Command (general view)
        if (command === "job board") {
          const user = getCurrentUser()
          let jobs: any[] = []

          if (user?.role === "hiring_manager") {
            // For hiring managers, show open jobs by default
            jobs = mockHiringManagerJobs.filter((j) => j.status === "open")
          } else {
            // For candidates, show all available open jobs
            jobs = mockJobListings.filter((j) => j.status === "open")
          }

          // Add AI confirmation message
          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content:
              "Opening the job board for you. You can explore available positions while we continue our conversation.",
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          // Add user message
          const userMsg = {
            id: `voice-cmd-user-${Date.now()}`,
            type: "user" as const,
            content: text,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          // Prepare workspace content for job board
          const workspaceData: WorkspaceContent = { type: "job-board", title: "Available Positions", jobs: jobs }
          handleCommandFromUI(workspaceData) // Use the new helper function

          return true // Command handled
        }

        // My Jobs Command (for candidates: applied/saved; for hiring managers: all their jobs)
        if (command === "my jobs") {
          const user = getCurrentUser()
          let jobs: any[] = []

          if (user?.role === "hiring_manager") {
            // For hiring managers, show all their jobs
            jobs = mockHiringManagerJobs
          } else {
            // For candidates, show applied and saved jobs
            jobs = mockJobListings.filter((j) => j.applied || j.saved)
          }

          // Add AI confirmation message
          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content:
              "Opening your saved jobs. You can review the positions you've applied to or saved while we continue our conversation.",
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          // Add user message
          const userMsg = {
            id: `voice-cmd-user-${Date.now()}`,
            type: "user" as const,
            content: text,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          // Prepare workspace content for "My Jobs"
          const workspaceData: WorkspaceContent = { type: "job-board", title: "My Jobs", jobs: jobs }
          handleCommandFromUI(workspaceData) // Use the new helper function

          return true // Command handled
        }

        // Data Analytics Command
        if (command === "data") {
          // Add AI confirmation message
          const aiMsg = {
            id: `voice-cmd-ai-${Date.now()}`,
            type: "ai" as const,
            content: "Opening the data view for you. You can review the analytics while we continue our conversation.",
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          // Add user message
          const userMsg = {
            id: `voice-cmd-user-${Date.now()}`,
            type: "user" as const,
            content: text,
            timestamp: new Date().toISOString(),
            agentId: activeAgent.id,
          }
          setLocalMessages((prev) => [...prev, userMsg, aiMsg])

          // Prepare workspace content for data analytics
          const workspaceData: WorkspaceContent = { type: "analytics", title: "Recruitment Analytics" }
          handleCommandFromUI(workspaceData) // Use the new helper function

          return true // Command handled
        }

        // If the command is not recognized or handled, return false to let the AI process it.
        return false
      },
      [
        activeAgent,
        isVoiceMode,
        voiceModeRef,
        handleAgentChange,
        onOpenWorkspace,
        currentWorkspaceContent,
        onSetJobBoardTab,
        onWorkspaceUpdate,
        handleCommandFromUI, // Added handleCommandFromUI to dependencies
        // </CHANGE>
      ],
    )

    const handleVoiceModeToggle = () => {
      setIsVoiceMode(!isVoiceMode) // Toggle voice mode state
    }

    // Handler for clicking on file previews (e.g., resume)
    const handlePreviewClick = (fileType: string) => {
      // Open a specific workspace type based on file type
      onOpenWorkspace({ type: "pdf", title: "candidate-resume.pdf" })
      setCurrentWorkspaceContent({ type: "pdf", title: "candidate-resume.pdf" }) // Update internal state
    }

    // Handler to reopen the last active workspace
    const handleReopenWorkspace = () => {
      if (lastWorkspaceContent) {
        onOpenWorkspace(lastWorkspaceContent)
        setHasOpenedWorkspace(true) // Ensure flag is set
        setCurrentWorkspaceContent(lastWorkspaceContent) // Update internal state
      }
    }

    // Main handler for sending messages or executing commands
    const handleSendMessage = async (content: string) => {
      let targetAgentId = activeAgent.id // Default to the currently active agent

      // If a hiring manager introduction is in progress, use the specified hiring manager agent.
      if (hiringManagerAgentId) {
        const hiringManagerAgent = AI_AGENTS.find((agent) => agent.id === hiringManagerAgentId)
        if (hiringManagerAgent) {
          setActiveAgent(hiringManagerAgent) // Switch active agent
          targetAgentId = hiringManagerAgent.id // Set target agent for the message
          setHiringManagerAgentId(null) // Clear the flag after using it
        }
      }
      // </CHANGE>

      const userMessageTimestamp = Date.now() // Timestamp for the user message

      // Create the user message object
      const userMsg: Message = {
        id: userMessageTimestamp.toString(),
        type: "user",
        content,
        agentId: targetAgentId, // Use the determined target agent ID
        timestamp: new Date(userMessageTimestamp).toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      }
      setLocalMessages((prev) => [...prev, userMsg]) // Add user message to local messages
      // </CHANGE>

      // Send the message using the useChat hook
      sendMessage(
        {
          text: content,
          // Pass the current agent ID in experimental_extra for AI SDK v5+
          experimental_extra: {
            agentId: activeAgent.id, // Ensure current agent context is passed
          },
        },
        {
          // Provide additional body data to the API.
          body: {
            agentId: targetAgentId, // This agentId will be merged and used by the backend
            workspaceContext, // Include the current workspace context
            commandsContext: getCommandsContext(activeAgent), // Include available commands for the agent
          },
        },
      )
      // </CHANGE>
      setInputMessage("") // Clear the input field after sending
      setIsThinking(true) // Set thinking to true when sending a message
    }

    // Submit handler for the chat input form
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault() // Prevent default form submission
      if (!inputMessage.trim()) return // Do nothing if input is empty

      const userMessage = inputMessage
      setInputMessage("") // Clear input immediately

      // Handle candidate chat separately
      if (currentChatCandidate) {
        // Add the hiring manager's message (user's input) to local messages
        const hiringManagerMessage: Message = {
          id: `${Date.now()}-hm`, // Unique ID for hiring manager message
          type: "user",
          content: userMessage,
          agentId: activeAgent.id, // Use the currently active agent
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

        // Save the hiring manager's message to the conversation history
        saveCandidateMessage(currentChatCandidate.id, currentChatCandidate.name, "hiring_manager", userMessage)

        // Retrieve the conversation history for context
        const conversationHistory = getCandidateConversation(currentChatCandidate.id, currentChatCandidate.name)

        try {
          const candidateMessageId = `${Date.now()}-candidate` // ID for the candidate's response

          // Call the backend API to get the candidate's response
          const response = await fetch("/api/candidate-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              candidateId: currentChatCandidate.id,
              candidateName: currentChatCandidate.name,
              conversationHistory, // Pass history for context
              newMessage: userMessage, // Pass the user's new message
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to get candidate response")
          }

          // Read the streaming response from the API
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          let candidateResponse = ""

          if (reader) {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break // Exit loop when stream is done

              const chunk = decoder.decode(value) // Decode the chunk
              candidateResponse += chunk // Append to the candidate's full response

              // Update the candidate's message in the UI in real-time
              setLocalMessages((prev) => {
                const lastMessage = prev[prev.length - 1]
                // If the last message is the AI response being built, update it
                if (lastMessage && lastMessage.type === "ai" && lastMessage.id === candidateMessageId) {
                  return [
                    ...prev.slice(0, -1), // Remove the old version
                    {
                      ...lastMessage, // Keep existing properties
                      content: candidateResponse, // Update the content
                    },
                  ]
                } else {
                  // Otherwise, add a new AI message for the candidate's response
                  return [
                    ...prev,
                    {
                      id: candidateMessageId,
                      type: "ai" as const,
                      content: candidateResponse,
                      agentId: activeAgent.id, // Assign the active agent
                      avatar: currentChatCandidate.avatar, // Candidate's avatar
                      senderName: currentChatCandidate.name, // Candidate's name
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

            // After the stream ends, save the final candidate response to history
            saveCandidateMessage(currentChatCandidate.id, currentChatCandidate.name, "candidate", candidateResponse)
          }
        } catch (error) {
          // Add an error message to the chat if the API call fails
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

        return // Exit handler after processing candidate chat
      }

      const wasReservedCommand = handleCommandOrMessage(userMessage)
      if (wasReservedCommand) {
        return
      }
      // </CHANGE>

      // Check if the message is a command that should be handled locally.
      const wasCommand = await detectAndHandleCommand(userMessage)
      if (wasCommand) {
        return // Command was handled, stop processing.
      }

      // Store the current agent ID to be used in the AI SDK response processing.
      currentRequestAgentRef.current = activeAgent.id

      try {
        // Send the user's message to the AI model via the useChat hook.
        await sendMessage(
          {
            text: userMessage,
            // Pass experimental_extra for AI SDK v5+ compatibility
            experimental_extra: {
              agentId: activeAgent.id, // Ensure agent context is passed
            },
          },
          {
            // Provide additional body data to the API.
            body: {
              agentId: activeAgent.id, // Pass the active agent ID for backend processing
              workspaceContext, // Include the current workspace context
              commandsContext: getCommandsContext(activeAgent), // Include available commands for the agent
            },
          },
        )
      } catch (error) {
        // Add an error message to the chat for the user.
        setLocalMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-error`,
            type: "ai",
            content: "Sorry, I encountered an error. Please try again.",
            agentId: activeAgent.id,
          },
        ])
        setIsThinking(false) // Ensure thinking is reset on error
      }
    }

    // Handler for clicking on suggestion buttons in the welcome/agent intro screen.
    const handleSuggestionClick = (text: string) => {
      setInputMessage(text) // Set the input message to the suggestion text
      // Optionally, you could also automatically submit the message:
      // handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    }

    // Handler for clicking on prompt suggestions shown after an AI message.
    const handlePromptSuggestionClick = (text: string) => {
      setInputMessage(text) // Set the input message
      handleSubmit({ preventDefault: () => {} } as React.FormEvent) // Submit the message immediately
    }

    // Function to scroll the chat messages container to the bottom.
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }

    // Define tabs for suggestion categories.
    const categoryTabs = [
      { id: "suggested", label: "Suggested", icon: <Sparkles className="w-4 h-4" /> },
      { id: "apply-to-jobs", label: "Apply to Jobs", icon: <Briefcase className="w-4 h-4" /> },
      { id: "hiring", label: "Hiring", icon: <Building2 className="w-4 h-4" /> },
      { id: "quote-me", label: "Quote Me", icon: <Calculator className="w-4 h-4" /> },
      { id: "legal", label: "Legal", icon: <Scale className="w-4 h-4" /> },
      { id: "about-us", label: "About Us", icon: <Info className="w-4 h-4" /> },
    ]

    // Renders the suggestion buttons based on the active tab.
    const renderSuggestions = () => (
      <>
        <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-2">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSuggestionTab(tab.id as SuggestionCategory)} // Cast to type
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

    // Main render function for the ChatMain component
    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full bg-background">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/95 supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-[#A16AE8] to-[#8096FD] bg-clip-text text-transparent">
              Teamified AI
            </h2>
          </div>
          <div className="flex-shrink-0">
            {/* Button to reopen the workspace if it's closed */}
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

        {/* Render VoiceMode component if voice mode is enabled */}
        {isVoiceMode ? (
          <VoiceMode
            ref={voiceModeRef}
            onClose={handleVoiceModeToggle} // Callback to close voice mode
            onTranscriptionUpdate={handleTranscriptionUpdate} // Callback for transcription updates
            onCommandDetected={detectAndHandleCommand} // Callback for command detection
            agentName={`${activeAgent.firstName} - ${activeAgent.name}`} // Current agent's name
            agentId={activeAgent.id} // Current agent's ID
            currentWorkspaceContent={currentWorkspaceContent} // Current workspace content
            allAgents={AI_AGENTS} // List of all available agents
            currentAgent={activeAgent} // Currently active agent
            onAgentChange={handleVoiceModeAgentChange} // Callback for agent changes in voice mode
            userType={userType} // Pass user type
            // </CHANGE>
          />
        ) : (
          // Render standard chat interface if not in voice mode
          <>
            <main
              ref={messagesContainerRef} // Ref for the main chat messages container
              className={`flex-1 min-h-0 px-6 relative bg-background ${isCentered ? "flex items-center justify-center" : "flex flex-col overflow-y-auto"}`} // Conditional styling based on if chat is empty
            >
              {isCentered ? (
                // Centered view for empty chat state
                <div className="w-full max-w-[820px] mx-auto px-6">
                  <div className="text-center mb-12">
                    {/* Agent icon */}
                    <div
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${activeAgent.color}, ${activeAgent.color}dd)` }}
                    >
                      <span className="text-4xl">{activeAgent.icon}</span>
                    </div>
                    {/* App title and welcome message */}
                    <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-[#A16AE8] to-[#8096FD] bg-clip-text text-transparent">
                      Teamified AI
                    </h1>
                    <p className="text-2xl text-muted-foreground mb-8">{welcomeQuestion}</p>
                  </div>

                  {/* Input area and suggestions */}
                  <div className="animate-in fade-in duration-500">
                    <form onSubmit={handleSubmit} className="relative">
                      <div className="relative flex items-center bg-card border border-border rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                        {/* Left icons: attachment, agent selection */}
                        <div className="absolute left-4 flex items-center gap-1">
                          <button
                            type="button"
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                            aria-label="Add attachment"
                          >
                            <Plus className="w-5 h-5 text-muted-foreground" />
                          </button>
                          <div className="relative" ref={agentDropdownRef}>
                            {/* Agent selection dropdown trigger */}
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
                            {/* Agent selection dropdown menu */}
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
                        {/* Input field */}
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Ask anything or type *help to know what I can do!"
                          className="flex-1 pl-28 pr-24 py-4 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                        />
                        {/* Right icons: mic, send */}
                        <div className="flex items-center gap-2 pr-2">
                          <button
                            type="button"
                            onClick={handleVoiceModeToggle} // Toggle voice mode
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                            aria-label="Voice input"
                          >
                            <Mic className="w-5 h-5 text-muted-foreground" />
                          </button>
                          <button
                            type="submit"
                            disabled={!inputMessage.trim() || isThinking} // Disable if input is empty or AI is thinking
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
                    <div className="mt-6">{renderSuggestions()}</div> {/* Render suggestions */}
                    <footer className="mt-4 text-center">
                      <p className="text-xs text-muted-foreground">
                        Teamified AI can make mistakes. Check important info.
                      </p>
                    </footer>
                  </div>
                </div>
              ) : (
                // Main chat view when messages are present
                <div className="w-full max-w-[820px] mx-auto py-6 space-y-4">
                  {/* Map over local messages to render each chat bubble */}
                  {localMessages.map((msg, index) => {
                    const isLastUserMessage =
                      msg.type === "user" && index === localMessages.map((m) => m.type).lastIndexOf("user")
                    const isLastMessage = index === localMessages.length - 1
                    // Find the agent associated with the message for avatar/color
                    const messageAgent = msg.agentId
                      ? AI_AGENTS.find((a) => a.id === msg.agentId) || AI_AGENTS[0]
                      : AI_AGENTS[0]
                    return (
                      <div
                        key={msg.id}
                        ref={isLastUserMessage ? lastUserMessageRef : isLastMessage ? lastMessageRef : null}
                        className="message-enter" // Animation class
                      >
                        {/* Render agent switch indicator */}
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

                        {/* Render user message */}
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
                          // Render AI message
                          <div className="mb-6 max-w-[85%]">
                            <div className="flex items-center gap-2 mb-3">
                              {/* Avatar or agent icon */}
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
                            {/* Thinking time indicator */}
                            {msg.thinkingTime && (
                              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-medium">Thought for {msg.thinkingTime}s</span>
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            )}
                            <div className="space-y-4" title={msg.timestamp}>
                              {/* </CHANGE> */}
                              {/* Render message content using MarkdownRenderer */}
                              <MarkdownRenderer content={msg.content} />

                              {/* Render prompt suggestions */}
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

                              {/* Render response types */}
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
                                    src="/dashboard-analytics-interface.png" // Placeholder image
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

                              {/* Render action button if available */}
                              {msg.hasActionButton && msg.actionButtonText && msg.actionButtonHandler && (
                                <div className="mt-4 flex justify-center">
                                  <button
                                    onClick={() => {
                                      // Execute specific handler based on actionButtonHandler string
                                      if (msg.actionButtonHandler === "confirmSubmitChallenge") {
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
                  {/* Add ref to the last message element for auto-scroll */}
                  <div ref={messagesEndRef} />

                  {/* Thinking indicator */}
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

            {/* Input bar is only shown when chat is not centered */}
            {!isCentered && (
              <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="w-full max-w-[900px] mx-auto px-6 py-4">
                  <form onSubmit={handleSubmit} className="relative">
                    <div className="relative flex items-center bg-card border border-border rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                      {/* Left icons: attachment, agent selection */}
                      <div className="absolute left-4 flex items-center gap-1">
                        <button
                          type="button"
                          className="p-2 rounded-lg hover:bg-accent transition-colors"
                          aria-label="Add attachment"
                        >
                          <Plus className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <div className="relative" ref={agentDropdownRef}>
                          {/* Agent selection dropdown trigger */}
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
                          {/* Agent selection dropdown menu */}
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
                      {/* Input field */}
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask anything or type *help to know what I can do!"
                        className="flex-1 pl-28 pr-24 py-4 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                      />
                      {/* Right icons: mic, send */}
                      <div className="flex items-center gap-2 pr-2">
                        <button
                          type="button"
                          onClick={handleVoiceModeToggle} // Toggle voice mode
                          className="p-2 rounded-lg hover:bg-accent transition-colors"
                          aria-label="Voice input"
                        >
                          <Mic className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <button
                          type="submit"
                          disabled={!inputMessage.trim() || isThinking} // Disable if input is empty or AI is thinking
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
