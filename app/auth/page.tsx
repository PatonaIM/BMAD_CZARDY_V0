"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2, Mail, Lock, User, Briefcase, UserCircle } from "lucide-react"
import { mockSignIn, mockSignUp, mockLogin } from "@/lib/auth"
import { ThemeProvider } from "@/components/theme-provider"

export default function AuthPage() {
  const [loginLoading, setLoginLoading] = useState<"google" | "github" | "email" | null>(null)
  const [signupLoading, setSignupLoading] = useState<"google" | "github" | "email" | null>(null)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"candidate" | "hiring_manager">("candidate")
  const [loginError, setLoginError] = useState("")
  const [signupError, setSignupError] = useState("")
  const router = useRouter()

  const handleOAuthSignIn = async (provider: "google" | "github", isSignup: boolean) => {
    if (isSignup) {
      setSignupLoading(provider)
    } else {
      setLoginLoading(provider)
    }
    setLoginError("")
    setSignupError("")
    try {
      await mockSignIn(provider)
      router.push("/")
    } catch (error) {
      console.error("Sign in failed:", error)
      if (isSignup) {
        setSignupError("Sign in failed. Please try again.")
      } else {
        setLoginError("Sign in failed. Please try again.")
      }
    } finally {
      if (isSignup) {
        setSignupLoading(null)
      } else {
        setLoginLoading(null)
      }
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading("email")
    setLoginError("")

    try {
      await mockLogin(loginEmail, loginPassword)
      router.push("/")
    } catch (error) {
      console.error("Login failed:", error)
      setLoginError(error instanceof Error ? error.message : "Login failed. Please try again.")
    } finally {
      setLoginLoading(null)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupLoading("email")
    setSignupError("")

    try {
      if (!name.trim()) {
        setSignupError("Please enter your name")
        setSignupLoading(null)
        return
      }
      await mockSignUp(signupEmail, signupPassword, name, role)
      router.push("/")
    } catch (error) {
      console.error("Signup failed:", error)
      setSignupError(error instanceof Error ? error.message : "Signup failed. Please try again.")
    } finally {
      setSignupLoading(null)
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-6xl">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A16AE8] to-[#8096FD] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Welcome to Teamified AI</h1>
            <p className="text-muted-foreground text-balance">Sign in or create an account to get started</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="grid md:grid-cols-2 gap-8 md:divide-x divide-border">
              {/* Login Section */}
              <div className="md:pr-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Login</h2>

                <form onSubmit={handleLogin} className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading !== null}
                    className="w-full py-3 bg-gradient-to-r from-[#A16AE8] to-[#8096FD] hover:opacity-90 text-white font-medium rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loginLoading === "email" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Google Sign In */}
                  <button
                    onClick={() => handleOAuthSignIn("google", false)}
                    disabled={loginLoading !== null}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-background hover:bg-accent border border-border rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loginLoading === "google" ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {loginLoading === "google" ? "Signing in..." : "Continue with Google"}
                    </span>
                  </button>

                  {/* GitHub Sign In */}
                  <button
                    onClick={() => handleOAuthSignIn("github", false)}
                    disabled={loginLoading !== null}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-background hover:bg-accent border border-border rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loginLoading === "github" ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <svg className="w-5 h-5 fill-current text-foreground" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {loginLoading === "github" ? "Signing in..." : "Continue with GitHub"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Sign Up Section */}
              <div className="md:pl-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Sign Up</h2>

                <form onSubmit={handleSignup} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">I am signing up as a</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("candidate")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          role === "candidate"
                            ? "border-[#A16AE8] bg-[#A16AE8]/5"
                            : "border-border hover:border-[#A16AE8]/50"
                        }`}
                      >
                        <UserCircle
                          className={`w-8 h-8 ${role === "candidate" ? "text-[#A16AE8]" : "text-muted-foreground"}`}
                        />
                        <span
                          className={`text-sm font-medium ${role === "candidate" ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          Candidate
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("hiring_manager")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          role === "hiring_manager"
                            ? "border-[#A16AE8] bg-[#A16AE8]/5"
                            : "border-border hover:border-[#A16AE8]/50"
                        }`}
                      >
                        <Briefcase
                          className={`w-8 h-8 ${role === "hiring_manager" ? "text-[#A16AE8]" : "text-muted-foreground"}`}
                        />
                        <span
                          className={`text-sm font-medium ${role === "hiring_manager" ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          Hiring Manager
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="signup-email"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-foreground mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="signup-password"
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {signupError && (
                    <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
                      {signupError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={signupLoading !== null}
                    className="w-full py-3 bg-gradient-to-r from-[#A16AE8] to-[#8096FD] hover:opacity-90 text-white font-medium rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {signupLoading === "email" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Google Sign Up */}
                  <button
                    onClick={() => handleOAuthSignIn("google", true)}
                    disabled={signupLoading !== null}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-background hover:bg-accent border border-border rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {signupLoading === "google" ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {signupLoading === "google" ? "Signing up..." : "Continue with Google"}
                    </span>
                  </button>

                  {/* GitHub Sign Up */}
                  <button
                    onClick={() => handleOAuthSignIn("github", true)}
                    disabled={signupLoading !== null}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-background hover:bg-accent border border-border rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {signupLoading === "github" ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <svg className="w-5 h-5 fill-current text-foreground" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {signupLoading === "github" ? "Signing up..." : "Continue with GitHub"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p className="text-balance">
              Free tier includes limited actions. By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
