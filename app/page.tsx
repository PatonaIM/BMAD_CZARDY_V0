"use client"

import { useState } from "react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatMain } from "@/components/chat-main"
import { WorkspacePane } from "@/components/workspace-pane"
import { ThemeProvider } from "@/components/theme-provider"
import type { WorkspaceContent } from "@/types/workspace"

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [workspaceContent, setWorkspaceContent] = useState<WorkspaceContent>({ type: null })

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
