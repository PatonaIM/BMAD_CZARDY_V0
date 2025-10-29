"use client"

import { useEffect } from "react"
import { ensureAnonymousStart } from "@/lib/auth"

export function AuthInitializer() {
  useEffect(() => {
    ensureAnonymousStart()
  }, [])

  return null
}
