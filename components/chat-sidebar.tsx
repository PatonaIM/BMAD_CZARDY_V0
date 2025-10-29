"use client"

import type React from "react"

import { useState } from "react"
import { useTheme } from "./theme-provider"
import { useRouter, usePathname } from "next/navigation"
import {
  MessageSquarePlus,
  Search,
  Library,
  Code2,
  Sparkles,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Settings,
  LogOut,
  UserPlus,
} from "lucide-react"
import { signOut, getCurrentUser } from "@/lib/auth"

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const { theme, toggleTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const user = getCurrentUser()

  const chats = [
    "Job Search for Senior Fullstack Developers",
    "Search Jobs: AI Engineers",
    "Refine resume for skills",
    "Mock interviews for C# .NET",
    "Coding challenge for C# .NET",
    "Browse open tech roles",
    "Track all my applications",
    "Why are you reading this?",
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleLogout = () => {
    signOut()
    router.push("/auth")
  }

  const handleSignUp = () => {
    router.push("/auth")
  }

  const getRoleDisplay = (user: ReturnType<typeof getCurrentUser>) => {
    if (!user) return ""
    if (user.role === "candidate") {
      return "Candidate"
    }
    if (user.role === "hiring_manager") {
      return `Hiring Manager for ${user.company || "Company"}`
    }
    return "User"
  }

  return (
    <div
      className={`relative flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        isOpen ? "w-[280px]" : "w-[72px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {isOpen && (
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#A16AE8]" />
            <span className="font-semibold text-sidebar-foreground">Teamified AI</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5 text-sidebar-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-3">
        <nav className="space-y-1">
          <SidebarButton
            icon={MessageSquarePlus}
            label="New chat"
            isOpen={isOpen}
            onClick={() => handleNavigation("/")}
            isActive={pathname === "/"}
          />
          <SidebarButton icon={Search} label="Search chats" isOpen={isOpen} onClick={() => {}} />
          {user && (
            <SidebarButton
              icon={Library}
              label="Library"
              isOpen={isOpen}
              onClick={() => handleNavigation("/library")}
              isActive={pathname === "/library"}
            />
          )}
          <SidebarButton icon={Code2} label="Codex" isOpen={isOpen} onClick={() => {}} />
        </nav>

        {/* Chats Section */}
        {isOpen && (
          <div className="mt-6">
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chats</span>
            </div>
            <nav className="space-y-1">
              {chats.map((chat) => (
                <SidebarButton key={chat} icon={MessageSquare} label={chat} isOpen={isOpen} onClick={() => {}} />
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors mb-2"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-sidebar-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-sidebar-foreground" />
          )}
          {isOpen && (
            <span className="text-sm text-sidebar-foreground">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>

        {/* User Profile or Sign Up Button */}
        {user ? (
          // Authenticated User Profile
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#A16AE8] flex items-center justify-center">
                <span className="text-sm font-semibold text-white">{user.avatar || "CD"}</span>
              </div>
              {isOpen && (
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-sidebar-foreground">{user.name || "User"}</div>
                  <div className="text-xs text-muted-foreground">{getRoleDisplay(user)}</div>
                </div>
              )}
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && isOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          // Anonymous User - Sign Up Button
          <button
            onClick={handleSignUp}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-[#A16AE8] hover:bg-[#8F4FD1] transition-colors"
            aria-label="Sign up"
          >
            <UserPlus className="w-5 h-5 text-white flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium text-white">Sign Up</span>}
          </button>
        )}
      </div>
    </div>
  )
}

interface SidebarButtonProps {
  icon: React.ElementType
  label: string
  isOpen: boolean
  onClick?: () => void
  isActive?: boolean
}

function SidebarButton({ icon: Icon, label, isOpen, onClick, isActive }: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
        isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent"
      }`}
      aria-label={label}
    >
      <Icon className="w-5 h-5 text-sidebar-foreground flex-shrink-0" />
      {isOpen && <span className="text-sm text-sidebar-foreground truncate text-left flex-1">{label}</span>}
    </button>
  )
}
