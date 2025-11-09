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
import type { JobListing, CandidateProfile, HiringManagerJob } from "@/types/job"
import { mockJobListings } from "@/lib/mock-data"

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
  const [currentJobBoardTab, setCurrentJobBoardTab] = useState<"applied" | "invited" | "saved" | "browse">("applied")
  const chatMainRef = useRef<ChatMainRef | null>(null)

  useEffect(() => {
    clearUserOnInitialLoad()
  }, [])

  useEffect(() => {
    const user = getCurrentUser()

    if (user?.isNewSignup) {
      const accountManager = AI_AGENTS.find((agent) => agent.id === "account-manager")
      if (accountManager) {
        setInitialAgent(accountManager.id)
        setShouldShowWelcome(true)

        if (user.role === "candidate") {
          setTimeout(() => {
            setWorkspaceContent({ type: "candidate-profile", title: "Candidate Profile" })
          }, 1000)
        } else if (user.role === "hiring_manager") {
          setTimeout(() => {
            setWorkspaceContent({ type: "hiring-manager-profile", title: "Enterprise Setup" })
          }, 1000)
        }

        clearNewSignupFlag()
      }
    }
  }, [])

  useEffect(() => {
    if (workspaceContent.type === "job-board") {
      const user = getCurrentUser()

      // Skip this effect for hiring managers - they use draft/open/closed status system
      if (user?.role === "hiring_manager") {
        return
      }

      // Filter jobs based on current tab (for candidates only)
      let filteredJobs: JobListing[] = []
      switch (currentJobBoardTab) {
        case "applied":
          filteredJobs = mockJobListings.filter((j) => j.applied)
          break
        case "invited":
          filteredJobs = mockJobListings.filter((j) => j.invited && !j.applied)
          break
        case "saved":
          filteredJobs = mockJobListings.filter((j) => j.saved && !j.applied)
          break
        case "browse":
          filteredJobs = mockJobListings.filter((j) => !j.applied && !j.invited)
          break
      }

      // Use the same structure that ChatMain expects (jobs directly, not in data)
      setWorkspaceContent({
        type: "job-board",
        title: user?.role === "candidate" ? "My Jobs" : "Job Board",
        jobs: filteredJobs,
        jobBoardTab: currentJobBoardTab,
      })
    }
  }, [currentJobBoardTab, workspaceContent.type])

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

    if (user?.role === "hiring_manager") {
      const accountManager = AI_AGENTS.find((agent) => agent.id === "account-manager")
      if (accountManager && chatMainRef.current) {
        chatMainRef.current.switchAgent(accountManager.id)
      }
      setWorkspaceContent({ type: "hiring-manager-profile", title: "Enterprise Setup" })
    } else {
      setWorkspaceContent({ type: "candidate-profile", title: "Edit Profile" })
    }
  }

  const handleUpgradePlan = () => {
    const accountManager = AI_AGENTS.find((agent) => agent.id === "account-manager")
    if (accountManager && chatMainRef.current) {
      chatMainRef.current.switchAgent(accountManager.id)
    }
    setWorkspaceContent({ type: "candidate-pricing", title: "Upgrade to Premium" })
  }

  const handleHiringManagerStepChange = (step: number) => {
    if (step === 2 && chatMainRef.current) {
      chatMainRef.current.showPricingGuidance()
    }
  }

  const handleViewJob = (job: JobListing | HiringManagerJob) => {
    const user = getCurrentUser()

    setWorkspaceContent({
      type: "job-view",
      job,
      title: job.title,
    })

    // The job view will open without an automatic AI message
  }

  const handleMyJobs = () => {
    const user = getCurrentUser()

    if (user?.role === "hiring_manager") {
      const accountManager = AI_AGENTS.find((agent) => agent.id === "account-manager")
      if (accountManager && chatMainRef.current) {
        chatMainRef.current.switchAgent(accountManager.id)
      }
    } else {
      const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")
      if (technicalRecruiter && chatMainRef.current) {
        chatMainRef.current.switchAgent(technicalRecruiter.id)
      }
    }

    setWorkspaceContent({
      type: "job-board",
      title: user?.role === "candidate" ? "My Jobs" : "Job Board",
    })

    if (user?.role === "candidate" && chatMainRef.current) {
      const appliedCount = 4
      const savedCount = 2

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
    const user = getCurrentUser()

    setWorkspaceContent({
      type: "job-board",
      title: user?.role === "candidate" ? "My Jobs" : "Job Board",
    })
  }

  const handleApplyForJob = (job: JobListing) => {
    if (chatMainRef.current) {
      chatMainRef.current.handleJobApplication(job)
    }
  }

  const handleRequestSubmit = () => {
    if (chatMainRef.current) {
      chatMainRef.current.handleSubmitChallengeRequest()
    }
  }

  const handleSubmissionComplete = () => {
    if (chatMainRef.current) {
      chatMainRef.current.handleSubmissionComplete()
    }
  }

  const handleSendMessage = (message: string) => {
    if (chatMainRef.current) {
      chatMainRef.current.sendMessageFromWorkspace(message)
    }
  }

  const handleOpenCandidateChat = (candidate: CandidateProfile, job?: JobListing) => {
    setWorkspaceContent({
      type: "candidate-profile-view",
      title: candidate.name,
      candidate: candidate,
      job: job,
    })

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
    if (chatMainRef.current) {
      chatMainRef.current.introduceMatchedCandidate(candidate, hiringManagerName, position, company)
    }
  }

  const handleSendAIMessage = (message: string, agentId?: string) => {
    if (chatMainRef.current) {
      chatMainRef.current.sendAIMessageFromWorkspace(message, agentId)
    }
  }

  const handleClearMessages = () => {
    if (chatMainRef.current) {
      chatMainRef.current.clearMessages()
    }
  }

  const handleWorkspaceUpdate = (updatedContent: WorkspaceContent) => {
    setWorkspaceContent(updatedContent)
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
              currentJobBoardTab={currentJobBoardTab}
              onSetJobBoardTab={setCurrentJobBoardTab}
              onWorkspaceUpdate={handleWorkspaceUpdate}
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
                chatMainRef={chatMainRef}
                onIntroduceMatchedCandidate={handleIntroduceMatchedCandidate}
                onSendAIMessage={handleSendAIMessage}
                onClearMessages={handleClearMessages}
                onOpenWorkspace={setWorkspaceContent}
                jobBoardTab={currentJobBoardTab}
                onJobBoardTabChange={setCurrentJobBoardTab}
              />
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}
