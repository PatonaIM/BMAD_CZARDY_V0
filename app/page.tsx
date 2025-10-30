"use client"

import { useState, useEffect, useRef } from "react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatMain } from "@/components/chat-main"
import { WorkspacePane } from "@/components/workspace-pane"
import { ThemeProvider } from "@/components/theme-provider"
import type { WorkspaceContent } from "@/types/workspace"
import { getCurrentUser, clearNewSignupFlag, clearUserOnInitialLoad } from "@/lib/auth"
import { AI_AGENTS } from "@/types/agents"

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [workspaceContent, setWorkspaceContent] = useState<WorkspaceContent>({ type: null })
  const [initialAgent, setInitialAgent] = useState<string | null>(null)
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false)
  const chatMainRef = useRef<{
    handleProfileSaved: () => void
    switchAgent: (agentId: string) => void
    showPricingGuidance: () => void
    showPaymentSuccess: () => void
  } | null>(null)

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

  const handleViewJob = (job: any) => {
    console.log("[v0] Opening job view for:", job.title)
    setWorkspaceContent({
      type: "job-view",
      title: job.title,
      job: job,
    })
  }

  const handleMyJobs = () => {
    console.log("[v0] My Jobs clicked")
    const user = getCurrentUser()

    // Switch to Technical Recruiter AI Agent
    const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")
    if (technicalRecruiter && chatMainRef.current) {
      console.log("[v0] Switching to Technical Recruiter agent")
      chatMainRef.current.switchAgent(technicalRecruiter.id)
    }

    // Open job board in workspace
    console.log("[v0] Opening job board workspace")
    setWorkspaceContent({
      type: "job-board",
      title: user?.role === "candidate" ? "My Jobs" : "Job Board",
    })
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <ChatSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onEditProfile={handleEditProfile}
          onUpgradePlan={handleUpgradePlan}
          onMyJobs={handleMyJobs} // Added onMyJobs callback
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
              />
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}
