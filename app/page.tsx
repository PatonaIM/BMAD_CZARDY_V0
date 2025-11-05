"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation" // Added useRouter import to enable navigation to home page
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatMain } from "@/components/chat-main"
import { WorkspacePane } from "@/components/workspace-pane"
import { ThemeProvider } from "@/components/theme-provider"
import type { WorkspaceContent } from "@/types/workspace"
import { getCurrentUser, clearNewSignupFlag, clearUserOnInitialLoad } from "@/lib/auth"
import { AI_AGENTS } from "@/types/agents"
import type { JobListing, CandidateProfile } from "@/types/job"

export interface ChatMainRef {
  handleProfileSaved: () => void
  switchAgent: (agentId: string) => void
  showPricingGuidance: () => void
  showPaymentSuccess: () => void
  showMyJobsSummary: (appliedCount: number, savedCount: number) => void
  showJobBoardSummary: () => void
  showJobViewSummary: (job: JobListing) => void
  handleJobApplication: (job: JobListing) => void
  handleSubmitChallengeRequest: () => void
  handleSubmissionComplete: () => void
  sendMessageFromWorkspace: (message: string) => void
  showCandidateChat: (candidate: CandidateProfile) => void
  introduceMatchedCandidate: (
    candidate: CandidateProfile,
    hiringManagerName: string,
    position: string,
    company: string,
  ) => void
  showJobInsights: (job: JobListing) => void
  sendAIMessageFromWorkspace: (message: string, agentId?: string) => void
  clearMessages: () => void // Added clearMessages method to reset chat
}

export default function ChatPage() {
  const router = useRouter() // Added router to enable navigation
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [workspaceContent, setWorkspaceContent] = useState<WorkspaceContent>({ type: null })
  const [initialAgent, setInitialAgent] = useState<string | null>(null)
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false)
  const chatMainRef = useRef<ChatMainRef | null>(null)

  useEffect(() => {
    clearUserOnInitialLoad()
  }, [])

  useEffect(() => {
    const user = getCurrentUser()

    if (user?.isNewSignup) {
      if (user.role === "candidate") {
        const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")
        if (technicalRecruiter) {
          setInitialAgent(technicalRecruiter.id)
          setShouldShowWelcome(true)
          setTimeout(() => {
            setWorkspaceContent({ type: "candidate-profile", title: "Candidate Profile" })
          }, 1000)
          clearNewSignupFlag()
        }
      } else if (user.role === "hiring_manager") {
        const salesAgent = AI_AGENTS.find((agent) => agent.id === "sales-marketing")
        if (salesAgent) {
          setInitialAgent(salesAgent.id)
          setShouldShowWelcome(true)
          setTimeout(() => {
            setWorkspaceContent({ type: "hiring-manager-profile", title: "Enterprise Setup" })
          }, 1000)
          clearNewSignupFlag()
        }
      }
    }
  }, [])

  const handleProfileSave = () => {
    const user = getCurrentUser()

    if (user?.role === "hiring_manager") {
      setWorkspaceContent({
        type: "payment-success",
        title: "Payment Successful",
        planName: "Enterprise Plan",
        amount: "$500/mo",
      })

      setTimeout(() => {
        if (chatMainRef.current) {
          chatMainRef.current.showPaymentSuccess()
        }
      }, 1500)
    } else {
      if (chatMainRef.current) {
        chatMainRef.current.handleProfileSaved()
      }
    }
  }

  const handleEditProfile = () => {
    const user = getCurrentUser()
    console.log("[v0] handleEditProfile called, user role:", user?.role)

    if (user?.role === "hiring_manager") {
      const salesAgent = AI_AGENTS.find((agent) => agent.id === "sales-marketing")
      console.log("[v0] Found sales agent:", salesAgent?.name)
      if (salesAgent && chatMainRef.current) {
        console.log("[v0] Calling switchAgent with:", salesAgent.id)
        chatMainRef.current.switchAgent(salesAgent.id)
      } else {
        console.log("[v0] ERROR: chatMainRef.current is null or salesAgent not found")
      }
      setWorkspaceContent({ type: "hiring-manager-profile", title: "Enterprise Setup" })
    } else {
      setWorkspaceContent({ type: "candidate-profile", title: "Edit Profile" })
    }
  }

  const handleUpgradePlan = () => {
    console.log("[v0] Upgrade plan clicked")
    const salesAgent = AI_AGENTS.find((agent) => agent.id === "sales-marketing")
    if (salesAgent && chatMainRef.current) {
      console.log("[v0] Switching to Sales & Marketing agent")
      chatMainRef.current.switchAgent(salesAgent.id)
    }
    console.log("[v0] Opening candidate pricing workspace")
    setWorkspaceContent({ type: "candidate-pricing", title: "Upgrade to Premium" })
  }

  const handleHiringManagerStepChange = (step: number) => {
    console.log("[v0] Hiring manager step changed to:", step)

    if (step === 2 && chatMainRef.current) {
      console.log("[v0] Triggering pricing guidance from Sales Agent")
      chatMainRef.current.showPricingGuidance()
    }
  }

  const handleViewJob = (job: JobListing) => {
    console.log("[v0] Opening job view for:", job.title)

    const user = getCurrentUser()
    if (user?.role === "hiring_manager" && job.type === "candidate-swipe") {
      setWorkspaceContent({
        type: "candidate-swipe",
        title: `Candidates for ${job.title}`,
        job: job,
      })
    } else {
      setWorkspaceContent({
        type: "job-view",
        title: job.title,
        job: job,
      })
    }

    if (chatMainRef.current && user?.role === "hiring_manager" && job.type !== "candidate-swipe") {
      setTimeout(() => {
        if (chatMainRef.current) {
          chatMainRef.current.showJobInsights(job)
        }
      }, 500)
    } else if (chatMainRef.current && user?.role !== "hiring_manager") {
      setTimeout(() => {
        if (chatMainRef.current) {
          chatMainRef.current.showJobViewSummary(job)
        }
      }, 1000)
    }
  }

  const handleMyJobs = () => {
    console.log("[v0] My Jobs clicked")
    const user = getCurrentUser()

    router.push("/")

    if (user?.role === "hiring_manager") {
      // Switch to Account Manager AI Agent for hiring managers
      const accountManager = AI_AGENTS.find((agent) => agent.id === "account-manager")
      if (accountManager && chatMainRef.current) {
        console.log("[v0] Switching to Account Manager agent")
        chatMainRef.current.switchAgent(accountManager.id)
      }
    } else {
      // Switch to Technical Recruiter AI Agent for candidates
      const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")
      if (technicalRecruiter && chatMainRef.current) {
        console.log("[v0] Switching to Technical Recruiter agent")
        chatMainRef.current.switchAgent(technicalRecruiter.id)
      }
    }

    // Open job board in workspace
    console.log("[v0] Opening job board workspace")
    setWorkspaceContent({
      type: "job-board",
      title: user?.role === "candidate" ? "My Jobs" : "Job Board",
    })

    if (user?.role === "candidate" && chatMainRef.current) {
      // Mock data - in a real app, this would come from the database
      const appliedCount = 4 // Number of jobs the user has applied to
      const savedCount = 2 // Number of jobs the user has saved

      setTimeout(() => {
        if (chatMainRef.current) {
          chatMainRef.current.showMyJobsSummary(appliedCount, savedCount)
        }
      }, 500)
    } else if (user?.role === "hiring_manager" && chatMainRef.current) {
      setTimeout(() => {
        if (chatMainRef.current) {
          chatMainRef.current.showJobBoardSummary()
        }
      }, 500)
    }
  }

  const handleBackToJobBoard = () => {
    console.log("[v0] Back to job board clicked")
    const user = getCurrentUser()

    setWorkspaceContent({
      type: "job-board",
      title: user?.role === "candidate" ? "My Jobs" : "Job Board",
    })
  }

  const handleApplyForJob = (job: JobListing) => {
    console.log("[v0] handleApplyForJob called for:", job.title)
    if (chatMainRef.current) {
      chatMainRef.current.handleJobApplication(job)
    }
  }

  const handleRequestSubmit = () => {
    console.log("[v0] handleRequestSubmit called")
    if (chatMainRef.current) {
      chatMainRef.current.handleSubmitChallengeRequest()
    }
  }

  const handleSubmissionComplete = () => {
    console.log("[v0] handleSubmissionComplete called")
    if (chatMainRef.current) {
      chatMainRef.current.handleSubmissionComplete()
    }
  }

  const handleSendMessage = (message: string) => {
    console.log("[v0] handleSendMessage called with:", message)
    if (chatMainRef.current) {
      chatMainRef.current.sendMessageFromWorkspace(message)
    }
  }

  const handleOpenCandidateChat = (candidate: CandidateProfile, job?: JobListing) => {
    console.log("[v0] handleOpenCandidateChat called for:", candidate.name)
    console.log("[v0] handleOpenCandidateChat - candidate:", candidate)
    console.log("[v0] handleOpenCandidateChat - job:", job)
    console.log("[v0] handleOpenCandidateChat - job exists:", !!job)
    console.log("[v0] chatMainRef.current exists:", !!chatMainRef.current)
    console.log("[v0] chatMainRef.current.showCandidateChat exists:", !!chatMainRef.current?.showCandidateChat)

    setWorkspaceContent({
      type: "candidate-profile-view",
      title: candidate.name,
      candidate: candidate,
      job: job, // Store job info for back navigation
    })

    console.log("[v0] Workspace content set with job:", job)

    if (chatMainRef.current) {
      chatMainRef.current.showCandidateChat(candidate)
    }
  }

  const handleIntroduceMatchedCandidate = (
    candidate: CandidateProfile,
    hiringManagerName: string,
    position: string,
    company: string,
  ) => {
    console.log(
      "[v0] handleIntroduceMatchedCandidate called with:",
      candidate.name,
      hiringManagerName,
      position,
      company,
    )
    if (chatMainRef.current) {
      chatMainRef.current.introduceMatchedCandidate(candidate, hiringManagerName, position, company)
    }
  }

  const handleSendAIMessage = (message: string, agentId?: string) => {
    console.log("[v0] handleSendAIMessage called with message:", message.substring(0, 50) + "...")
    console.log("[v0] handleSendAIMessage agentId:", agentId)
    console.log("[v0] chatMainRef.current exists:", !!chatMainRef.current)
    console.log(
      "[v0] chatMainRef.current.sendAIMessageFromWorkspace exists:",
      !!chatMainRef.current?.sendAIMessageFromWorkspace,
    )
    // </CHANGE>
    if (chatMainRef.current) {
      chatMainRef.current.sendAIMessageFromWorkspace(message, agentId)
      console.log("[v0] sendAIMessageFromWorkspace called successfully")
      // </CHANGE>
    }
  }

  const handleClearMessages = () => {
    console.log("[v0] Clear messages clicked")
    if (chatMainRef.current) {
      chatMainRef.current.clearMessages()
    }
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <ChatSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onEditProfile={handleEditProfile}
          onUpgradePlan={handleUpgradePlan}
          onMyJobs={handleMyJobs}
          workspaceType={workspaceContent.type}
        />
        <div className="flex-1 flex overflow-hidden">
          <div className={`${workspaceContent.type ? "w-2/5" : "w-full"} transition-all duration-300`}>
            <ChatMain
              ref={chatMainRef}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onOpenWorkspace={setWorkspaceContent}
              initialAgentId={initialAgent}
              shouldShowWelcome={shouldShowWelcome}
              currentWorkspaceContent={workspaceContent}
            />
          </div>
          {workspaceContent.type && (
            <div className="w-3/5 animate-in slide-in-from-right duration-300">
              <WorkspacePane
                isOpen={!!workspaceContent.type}
                onClose={() => setWorkspaceContent({ type: null })}
                content={workspaceContent}
                onProfileSave={handleProfileSave}
                onUpgradePlan={handleUpgradePlan}
                onHiringManagerStepChange={handleHiringManagerStepChange}
                onViewJob={handleViewJob}
                onBackToJobBoard={handleBackToJobBoard}
                onApplyForJob={handleApplyForJob}
                onRequestSubmit={handleRequestSubmit}
                onSubmissionComplete={handleSubmissionComplete}
                onSendMessage={handleSendMessage}
                onOpenCandidateChat={handleOpenCandidateChat}
                chatMainRef={chatMainRef} // Pass chatMainRef to WorkspacePane
                onIntroduceMatchedCandidate={handleIntroduceMatchedCandidate} // Added onIntroduceMatchedCandidate prop
                onSendAIMessage={handleSendAIMessage} // Added onSendAIMessage prop
                onClearMessages={handleClearMessages} // Added onClearMessages prop
                onOpenWorkspace={setWorkspaceContent}
              />
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}
