"use client"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  provider: "google" | "github" | "email"
  role: "candidate" | "hiring_manager"
  company?: string
  isNewSignup?: boolean
}

export const mockUsers = {
  google: {
    id: "google-user-1",
    name: "Robert Downey Jr.",
    email: "robert@example.com",
    avatar: "RD",
    provider: "google" as const,
    role: "candidate" as const,
  },
  github: {
    id: "github-user-1",
    name: "Steve Rogers",
    email: "steve@github.com",
    avatar: "SR",
    provider: "github" as const,
    role: "hiring_manager" as const,
    company: "TechCorp",
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

  const user = { ...mockUsers[provider], isNewSignup: true }
  setCurrentUser(user)
  return user
}

export async function mockSignUp(
  email: string,
  password: string,
  name: string,
  role: "candidate" | "hiring_manager",
): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Create a mock user from the sign-up data
  const user: User = {
    id: `email-user-${Date.now()}`,
    name: name,
    email: email,
    avatar: name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    provider: "email",
    role: role,
    isNewSignup: true,
    ...(role === "hiring_manager" && { company: "Your Company" }),
  }

  // Store the credentials for mock login
  const credentials = JSON.parse(localStorage.getItem("teamified_credentials") || "{}")
  credentials[email] = { password, user }
  localStorage.setItem("teamified_credentials", JSON.stringify(credentials))

  setCurrentUser(user)
  return user
}

export async function mockLogin(email: string, password: string): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Check stored credentials
  const credentials = JSON.parse(localStorage.getItem("teamified_credentials") || "{}")
  const storedCredential = credentials[email]

  if (!storedCredential || storedCredential.password !== password) {
    throw new Error("Invalid email or password")
  }

  const user = storedCredential.user
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

export function clearNewSignupFlag(): void {
  const user = getCurrentUser()
  if (user && user.isNewSignup) {
    const updatedUser = { ...user, isNewSignup: false }
    setCurrentUser(updatedUser)
  }
}
