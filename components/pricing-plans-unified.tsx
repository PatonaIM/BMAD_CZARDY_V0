"use client"

import { useState } from "react"
import { Check, Sparkles, Building2, Users, ChevronRight, Briefcase, Zap, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PricingPlansUnifiedProps {
  userType?: "candidate" | "hiring-manager" | null // null = not logged in, show both
  onClose?: () => void
}

type PricingView = "candidate" | "hiring-manager"

export function PricingPlansUnified({ userType = null, onClose }: PricingPlansUnifiedProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const [activeView, setActiveView] = useState<PricingView>(
    userType === "hiring-manager" ? "hiring-manager" : "candidate",
  )

  const handleUpgrade = (plan: string, userType: "candidate" | "hiring-manager") => {
    setIsProcessing(true)

    setTimeout(() => {
      toast({
        title: "Upgrade successful!",
        description: `Welcome to Teamified ${plan}! You now have access to all premium features.`,
        duration: 3000,
      })

      setIsProcessing(false)

      if (onClose) {
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    }, 1500)
  }

  const showNavigation = userType === null

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3">Pricing Plans</h1>
          <p className="text-lg text-muted-foreground">
            {userType === "candidate" && "Choose the perfect plan to accelerate your job search"}
            {userType === "hiring-manager" && "Select the plan that fits your hiring needs"}
            {userType === null && "Find the right plan for candidates or hiring managers"}
          </p>
        </div>

        {showNavigation && (
          <div className="flex gap-2 mb-8 border-b border-border">
            <button
              onClick={() => setActiveView("candidate")}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                activeView === "candidate"
                  ? "border-[#A16AE8] text-[#A16AE8]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Candidate Plans
              </div>
            </button>
            <button
              onClick={() => setActiveView("hiring-manager")}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                activeView === "hiring-manager"
                  ? "border-[#8096FD] text-[#8096FD]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Hiring Manager Plans
              </div>
            </button>
          </div>
        )}

        {/* Candidate Plans */}
        {(activeView === "candidate" || userType === "candidate") && (
          <section>
            {showNavigation && (
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-[#A16AE8]" />
                <h2 className="text-3xl font-bold text-foreground">Candidate Plans</h2>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Free Plan */}
              <div className="rounded-2xl border-2 border-border bg-card p-6 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Free Plan</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <FeatureItem text="Basic job search and matching" />
                  <FeatureItem text="Limited AI agent interactions (10/month)" />
                  <FeatureItem text="Resume upload and basic parsing" />
                  <FeatureItem text="Email notifications for new matches" />
                  <FeatureItem text="Access to public job board" />
                </div>

                <button
                  disabled
                  className="w-full px-6 py-3 rounded-lg bg-muted text-muted-foreground font-medium cursor-not-allowed"
                >
                  Current Plan
                </button>
              </div>

              {/* Premium Monthly */}
              <div className="rounded-2xl border-2 border-[#A16AE8] bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5 p-6 relative flex flex-col">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white text-xs font-bold">
                  POPULAR
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-foreground">Premium Monthly</h3>
                    <Sparkles className="w-5 h-5 text-[#A16AE8]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-muted-foreground line-through">$29.99</span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-[#A16AE8] to-[#8096FD] bg-clip-text text-transparent">
                      $19.99
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-[#A16AE8] font-medium mt-1">ON SALE</p>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <FeatureItem text="Everything in Free Plan" color="text-[#A16AE8]" />
                  <FeatureItem text="Unlimited AI agent interactions" color="text-[#A16AE8]" />
                  <FeatureItem text="Advanced resume optimization" color="text-[#A16AE8]" />
                  <FeatureItem text="Priority job matching" color="text-[#A16AE8]" />
                  <FeatureItem text="Interview preparation tools" color="text-[#A16AE8]" />
                  <FeatureItem text="AI Mock Interviews" color="text-[#A16AE8]" />
                  <FeatureItem text="Access to Teamified Learning" color="text-[#A16AE8]" />
                  <FeatureItem text="Salary insights and negotiation tips" color="text-[#A16AE8]" />
                  <FeatureItem text="Direct messaging with recruiters" color="text-[#A16AE8]" />
                  <FeatureItem text="Application tracking dashboard" color="text-[#A16AE8]" />
                  <FeatureItem text="Career coaching sessions (2/month)" color="text-[#A16AE8]" />
                  <FeatureItem text="Early access to new features" color="text-[#A16AE8]" />
                </div>

                <button
                  onClick={() => handleUpgrade("Premium Monthly", "candidate")}
                  disabled={isProcessing}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "Upgrade Monthly"}
                </button>
              </div>

              {/* Premium Annual */}
              <div className="rounded-2xl border-2 border-[#60D394] bg-gradient-to-br from-[#60D394]/5 to-[#60D394]/10 p-6 relative flex flex-col">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#60D394] to-[#4CAF50] text-white text-xs font-bold">
                  BEST VALUE
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-foreground">Premium Annual</h3>
                    <Sparkles className="w-5 h-5 text-[#60D394]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-muted-foreground line-through">$239.88</span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-[#60D394] to-[#4CAF50] bg-clip-text text-transparent">
                      $149
                    </span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <p className="text-xs text-green-600 font-medium mt-1">Save $90.88 per year (38% off)!</p>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <FeatureItem text="Everything in Premium Monthly" color="text-[#60D394]" />
                  <FeatureItem text="38% discount vs monthly plan" color="text-[#60D394]" />
                  <FeatureItem text="Billed annually at $149/year" color="text-[#60D394]" />
                </div>

                <button
                  onClick={() => handleUpgrade("Premium Annual", "candidate")}
                  disabled={isProcessing}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#60D394] to-[#4CAF50] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "Upgrade Annually"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Hiring Manager Plans */}
        {(activeView === "hiring-manager" || userType === "hiring-manager") && (
          <section>
            {showNavigation && (
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-8 h-8 text-[#8096FD]" />
                <h2 className="text-3xl font-bold text-foreground">Hiring Manager Plans</h2>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Basic Plan */}
              <div className="p-6 rounded-2xl border-2 border-border hover:border-[#A16AE8]/50 cursor-pointer transition-all bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#A16AE8]" />
                    <div>
                      <h4 className="text-lg font-bold text-foreground">Basic Plan</h4>
                      <p className="text-xs text-muted-foreground">Payroll & HR essentials</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0" />
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">$300</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">💰 PAYROLL</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                    <span>Global payroll & payslips</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                    <span>Taxes, insurance, and local benefits</span>
                  </li>
                  <li className="flex items-start gap-2 mt-2">
                    <span className="font-semibold text-foreground">👥 HR</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                    <span>HR record keeping & reporting</span>
                  </li>
                  <li className="flex items-start gap-2 mt-2">
                    <span className="font-semibold text-foreground">✨ TEAMIFIED AI</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                    <span>Limited Access to Teamified AI Agents</span>
                  </li>
                </ul>

                <button
                  onClick={() => handleUpgrade("Basic Plan", "hiring-manager")}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background text-foreground font-medium hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "Get Started"}
                </button>
              </div>

              {/* Recruiter Plan */}
              <div className="p-6 rounded-2xl border-2 border-border hover:border-[#A16AE8]/50 cursor-pointer transition-all bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#8096FD]" />
                    <div>
                      <h4 className="text-lg font-bold text-foreground">Recruiter Plan</h4>
                      <p className="text-xs text-muted-foreground">Full recruitment lifecycle</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0" />
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">9% of base salary</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Per hire</p>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">🎯 HIRING</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-[#8096FD] flex-shrink-0 mt-0.5" />
                    <span>Full recruitment lifecycle</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-[#8096FD] flex-shrink-0 mt-0.5" />
                    <span>Local compliance & onboarding</span>
                  </li>
                  <li className="flex items-start gap-2 mt-2">
                    <span className="font-semibold text-foreground">🤝 MANAGEMENT</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-[#8096FD] flex-shrink-0 mt-0.5" />
                    <span>HR and performance management</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-[#8096FD] flex-shrink-0 mt-0.5" />
                    <span>Employment contracts & benefits setup</span>
                  </li>
                  <li className="flex items-start gap-2 mt-2">
                    <span className="font-semibold text-foreground">✨ TEAMIFIED AI</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-[#8096FD] flex-shrink-0 mt-0.5" />
                    <span>Limited Access to Teamified AI Agents</span>
                  </li>
                </ul>

                <button
                  onClick={() => handleUpgrade("Recruiter Plan", "hiring-manager")}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background text-foreground font-medium hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "Choose Plan"}
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className="p-6 rounded-2xl border-2 border-[#A16AE8] bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5 cursor-pointer transition-all relative">
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white text-xs font-semibold">
                  Popular
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#A16AE8]" />
                    <div>
                      <h4 className="text-lg font-bold text-foreground">Enterprise Plan</h4>
                      <p className="text-xs text-muted-foreground">Equipment & workspace</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-[#A16AE8] bg-[#A16AE8] flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">$500</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">💻 EQUIPMENT</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                    <span>Managed laptops and accessories</span>
                  </li>
                  <li className="flex items-start gap-2 mt-2">
                    <span className="font-semibold text-foreground">🏢 WORKSPACE</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                    <span>Smart office locations</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                    <span>Workspace and IT setup</span>
                  </li>
                  <li className="flex items-start gap-2 mt-2">
                    <span className="font-semibold text-foreground">✨ TEAMIFIED AI</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                    <span>Full Access to Teamified AI Agents</span>
                  </li>
                </ul>

                <button
                  onClick={() => handleUpgrade("Enterprise Plan", "hiring-manager")}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "Choose Plan"}
                </button>
              </div>

              {/* Premium Plan */}
              <div className="p-6 rounded-2xl border-2 border-border hover:border-[#A16AE8]/50 cursor-pointer transition-all relative bg-card">
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold">
                  All-In
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="text-lg font-bold text-foreground">Premium Plan</h4>
                      <p className="text-xs text-muted-foreground">Complete solution</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0" />
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">30% + $300</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">🤝 SERVICE</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Dedicated account management</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Continuous HR & compliance support</span>
                  </li>
                  <li className="flex items-start gap-2 mt-2">
                    <span className="font-semibold text-foreground">🤝 MANAGEMENT</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Payroll + performance oversight</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Centralized reporting tools</span>
                  </li>
                  <li className="flex items-start gap-2 mt-2">
                    <span className="font-semibold text-foreground">💻 EQUIPMENT</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Laptop + Office Space</span>
                  </li>
                  <li className="flex items-start gap-2 mt-2">
                    <span className="font-semibold text-foreground">✨ TEAMIFIED AI</span>
                  </li>
                  <li className="flex items-start gap-2 pl-4">
                    <Check className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Full Access to Teamified AI Agents + Dashboarding & Analytics</span>
                  </li>
                </ul>

                <button
                  onClick={() => handleUpgrade("Premium Plan", "hiring-manager")}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background text-foreground font-medium hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "Choose Plan"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Comparison Summary */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Plan Comparison Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#A16AE8]" />
                Candidate Plans
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Free:</strong> $0/month (basic features, 10 AI interactions)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Premium Monthly:</strong> $19.99/month (was $29.99)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[#60D394] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Premium Annual:</strong> $149/year (save 38%)
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#8096FD]" />
                Hiring Manager Plans
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[#8096FD] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Basic:</strong> $300/month (payroll & HR essentials)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[#8096FD] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Recruiter:</strong> 9% per hire (performance-based)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[#8096FD] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Enterprise:</strong> $500/month (most popular)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[#FFD700] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Premium:</strong> 30% + $300/month (white-glove)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FeatureItemProps {
  text: string
  color?: string
}

function FeatureItem({ text, color = "text-green-500" }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-3">
      <Check className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
      <span className="text-sm text-foreground">{text}</span>
    </div>
  )
}
