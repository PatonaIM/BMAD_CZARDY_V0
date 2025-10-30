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
    if (chatMainRef.current) {
      chatMainRef.current.handleProfileSaved()
    }
  }

  const handleEditProfile = () => {
    const user = getCurrentUser()
    console.log("[v0] handleEditProfile called, user role:", user?.role)

    if (user?.role === "hiring_manager") {
      // Switch to Sales & Marketing agent for hiring managers
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
      // Candidate profile
      setWorkspaceContent({ type: "candidate-profile", title: "Edit Profile" })
    }
  }

  const handleUpgradePlan = () => {
    console.log("[v0] Upgrade plan clicked")
    // Switch to Sales & Marketing agent
    const salesAgent = AI_AGENTS.find((agent) => agent.id === "sales-marketing")
    if (salesAgent && chatMainRef.current) {
      console.log("[v0] Switching to Sales & Marketing agent")
      chatMainRef.current.switchAgent(salesAgent.id)
    }
    // Show candidate pricing in workspace
    console.log("[v0] Opening candidate pricing workspace")
    setWorkspaceContent({ type: "candidate-pricing", title: "Upgrade to Premium" })
  }

  const handleHiringManagerStepChange = (step: number) => {
    console.log("[v0] Hiring manager step changed to:", step)

    if (step === 2 && chatMainRef.current) {
      // When reaching Step 2 (Select Pricing), trigger the Sales Agent to provide pricing guidance
      console.log("[v0] Triggering pricing guidance from Sales Agent")
      chatMainRef.current.showPricingGuidance()
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
              />
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}
