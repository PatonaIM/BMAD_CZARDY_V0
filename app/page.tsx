"use client"

import { useState, useEffect, useRef } from "react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatMain } from "@/components/chat-main"
import { WorkspacePane } from "@/components/workspace-pane"
import { ThemeProvider } from "@/components/theme-provider"
import type { WorkspaceContent } from "@/types/workspace"
import { getCurrentUser, clearNewSignupFlag } from "@/lib/auth"
import { AI_AGENTS } from "@/types/agents"

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [workspaceContent, setWorkspaceContent] = useState<WorkspaceContent>({ type: null })
  const [initialAgent, setInitialAgent] = useState<string | null>(null)
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false)
  const chatMainRef = useRef<{ handleProfileSaved: () => void } | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (user?.isNewSignup && user.role === "candidate") {
      // Set the Technical Recruiter as the initial agent
      const technicalRecruiter = AI_AGENTS.find((agent) => agent.id === "technical-recruiter")
      if (technicalRecruiter) {
        setInitialAgent(technicalRecruiter.id)
        setShouldShowWelcome(true)
        // Open the candidate profile form in workspace
        setTimeout(() => {
          setWorkspaceContent({ type: "candidate-profile", title: "Candidate Profile" })
        }, 1000)
        // Clear the new signup flag
        clearNewSignupFlag()
      }
    }
  }, [])

  const handleProfileSave = () => {
    if (chatMainRef.current) {
      chatMainRef.current.handleProfileSaved()
    }
  }

  const handleEditProfile = () => {
    setWorkspaceContent({ type: "candidate-profile", title: "Edit Profile" })
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <ChatSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onEditProfile={handleEditProfile}
        />
        <div className="flex-1 flex overflow-hidden">
          <div className={`${workspaceContent.type ? "w-1/2" : "w-full"} transition-all duration-300`}>
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
            <div className="w-1/2 animate-in slide-in-from-right duration-300">
              <WorkspacePane
                isOpen={!!workspaceContent.type}
                onClose={() => setWorkspaceContent({ type: null })}
                content={workspaceContent}
                onProfileSave={handleProfileSave}
              />
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}
