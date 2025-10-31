"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as Theme | null
    console.log("[v0] Initial theme from localStorage:", savedTheme)
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      const root = document.documentElement
      console.log("[v0] Applying theme:", theme)
      console.log("[v0] Current classes before:", root.className)
      root.classList.remove("light", "dark")
      root.classList.add(theme)
      console.log("[v0] Current classes after:", root.className)

      // Check computed styles
      const computedBg = getComputedStyle(root).getPropertyValue("--background")
      console.log("[v0] Computed --background value:", computedBg)

      localStorage.setItem("theme", theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    console.log("[v0] Toggling theme from:", theme)
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  // Only skip applying theme classes until mounted
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
