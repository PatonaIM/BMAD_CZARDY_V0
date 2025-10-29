"use client"

import { useState } from "react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { LibraryContent } from "@/components/library-content"
import { ThemeProvider } from "@/components/theme-provider"

export default function LibraryPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <ChatSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <LibraryContent isSidebarOpen={isSidebarOpen} />
      </div>
    </ThemeProvider>
  )
}
