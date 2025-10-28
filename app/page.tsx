"use client"

import { useState } from "react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatMain } from "@/components/chat-main"
import { ThemeProvider } from "@/components/theme-provider"

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <ChatSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <ChatMain isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>
    </ThemeProvider>
  )
}
