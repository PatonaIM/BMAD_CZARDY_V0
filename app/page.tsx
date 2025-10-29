"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatMain } from "@/components/chat-main"
import { WorkspacePane } from "@/components/workspace-pane"
import { ThemeProvider } from "@/components/theme-provider"
import type { WorkspaceContent } from "@/types/workspace"
import { getCurrentUser } from "@/lib/auth"

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [workspaceContent, setWorkspaceContent] = useState<WorkspaceContent>({ type: null })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/auth")
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [router])

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <ChatSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 flex overflow-hidden">
          <div className={`${workspaceContent.type ? "w-1/2" : "w-full"} transition-all duration-300`}>
            <ChatMain
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onOpenWorkspace={setWorkspaceContent}
            />
          </div>
          {workspaceContent.type && (
            <div className="w-1/2 animate-in slide-in-from-right duration-300">
              <WorkspacePane
                isOpen={!!workspaceContent.type}
                onClose={() => setWorkspaceContent({ type: null })}
                content={workspaceContent}
              />
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}
