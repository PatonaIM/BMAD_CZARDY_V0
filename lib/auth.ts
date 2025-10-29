"use client"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  provider: "google" | "github"
}

export const mockUsers = {
  google: {
    id: "google-user-1",
    name: "Czar Dy",
    email: "czar@example.com",
    avatar: "CD",
    provider: "google" as const,
  },
  github: {
    id: "github-user-1",
    name: "Czar Dy",
    email: "czar@github.com",
    avatar: "CD",
    provider: "github" as const,
  },
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const userJson = localStorage.getItem("teamified_user")
  if (!userJson) return null
  try {
    return JSON.parse(userJson)
  } catch {
    return null
  }
}

export function setCurrentUser(user: User): void {
  localStorage.setItem("teamified_user", JSON.stringify(user))
}

export function clearCurrentUser(): void {
  localStorage.removeItem("teamified_user")
}

export async function mockSignIn(provider: "google" | "github"): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const user = mockUsers[provider]
  setCurrentUser(user)
  return user
}

export function signOut(): void {
  clearCurrentUser()
}

export function ensureAnonymousStart(): void {
  if (typeof window !== "undefined") {
    // Clear any existing auth state for demo purposes
    clearCurrentUser()
  }
}
