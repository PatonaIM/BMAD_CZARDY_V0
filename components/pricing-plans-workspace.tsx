"use client"
import { Check, Sparkles, Building2, Users, Zap, Crown, Briefcase } from "lucide-react"
import { useState, useEffect } from "react"

interface PricingPlansWorkspaceProps {
  initialView?: "candidate" | "hiring-manager"
  onViewChange?: (view: "candidate" | "hiring-manager") => void
}

export function PricingPlansWorkspace({ initialView = "candidate", onViewChange }: PricingPlansWorkspaceProps = {}) {
  const [activeView, setActiveView] = useState<"candidate" | "hiring-manager">(initialView)
  const [selectedCandidatePlan, setSelectedCandidatePlan] = useState<string | null>(null)
  const [selectedManagerPlan, setSelectedManagerPlan] = useState<string | null>(null)

  useEffect(() => {
    if (initialView) {
      setActiveView(initialView)
    }
  }, [initialView])

  const handleViewChange = (view: "candidate" | "hiring-manager") => {
    setActiveView(view)
    onViewChange?.(view)
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto p-8">
        {/* Segmented Control Toggle */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex items-center rounded-lg bg-muted p-1">
            <button
              onClick={() => handleViewChange("candidate")}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all
                ${
                  activeView === "candidate"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <Users className="w-4 h-4" />
              Candidate Plans
            </button>
            <button
              onClick={() => handleViewChange("hiring-manager")}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all
                ${
                  activeView === "hiring-manager"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <Building2 className="w-4 h-4" />
              Hiring Manager Plans
            </button>
          </div>
        </div>

        {activeView === "candidate" ? (
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                <div className="px-4 py-2 rounded-lg bg-muted text-center">
                  <span className="text-sm font-medium text-muted-foreground">Current Default Plan</span>
                </div>
              </div>

              {/* Premium Monthly */}
              <div
                className="rounded-2xl border-2 border-[#A16AE8] bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5 p-6 relative flex flex-col cursor-pointer"
                onClick={() => setSelectedCandidatePlan(selectedCandidatePlan === "monthly" ? null : "monthly")}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white text-xs font-bold">
                  POPULAR
                </div>

                <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-[#A16AE8] flex items-center justify-center">
                  {selectedCandidatePlan === "monthly" && <Check className="w-4 h-4 text-[#A16AE8]" />}
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
                  <FeatureItem text="Everything in Free Plan" isPremium />
                  <FeatureItem text="Unlimited AI agent interactions" isPremium />
                  <FeatureItem text="Advanced resume optimization" isPremium />
                  <FeatureItem text="Priority job matching" isPremium />
                  <FeatureItem text="Interview preparation tools" isPremium />
                  <FeatureItem text="AI Mock Interviews" isPremium />
                  <FeatureItem text="Access to Teamified Learning" isPremium />
                  <FeatureItem text="Salary insights and negotiation tips" isPremium />
                  <FeatureItem text="Direct messaging with recruiters" isPremium />
                  <FeatureItem text="Application tracking dashboard" isPremium />
                  <FeatureItem text="Career coaching sessions (2/month)" isPremium />
                  <FeatureItem text="Early access to new features" isPremium />
                </div>

                {selectedCandidatePlan === "monthly" && (
                  <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium text-sm hover:opacity-90 transition-opacity">
                    Upgrade to Premium Monthly
                  </button>
                )}
              </div>

              {/* Premium Annual */}
              <div
                className="rounded-2xl border-2 border-[#60D394] bg-gradient-to-br from-[#60D394]/5 to-[#60D394]/10 p-6 relative flex flex-col cursor-pointer"
                onClick={() => setSelectedCandidatePlan(selectedCandidatePlan === "annual" ? null : "annual")}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#60D394] to-[#4CAF50] text-white text-xs font-bold">
                  BEST VALUE
                </div>

                <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-[#60D394] flex items-center justify-center">
                  {selectedCandidatePlan === "annual" && <Check className="w-4 h-4 text-[#60D394]" />}
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
                  <FeatureItem text="Everything in Premium Monthly" isAnnual />
                  <FeatureItem text="38% discount vs monthly plan" isAnnual />
                  <FeatureItem text="Billed annually at $149/year" isAnnual />
                </div>

                {selectedCandidatePlan === "annual" && (
                  <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#60D394] to-[#4CAF50] text-white font-medium text-sm hover:opacity-90 transition-opacity">
                    Upgrade to Premium Annual
                  </button>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="mb-16">
            <div className="grid grid-cols-2 gap-4">
              {/* Basic Plan */}
              <div
                className="p-6 rounded-2xl border-2 border-border hover:border-[#A16AE8]/50 cursor-pointer transition-all bg-card"
                onClick={() => setSelectedManagerPlan(selectedManagerPlan === "basic" ? null : "basic")}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#A16AE8]" />
                    <div>
                      <h4 className="text-lg font-bold text-foreground">Basic Plan</h4>
                      <p className="text-xs text-muted-foreground">Payroll & HR essentials</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-[#A16AE8] flex items-center justify-center flex-shrink-0">
                    {selectedManagerPlan === "basic" && <Check className="w-4 h-4 text-[#A16AE8]" />}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">$300</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
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
                {selectedManagerPlan === "basic" && (
                  <button className="w-full mt-4 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium text-sm hover:opacity-90 transition-opacity">
                    Upgrade to Basic Plan
                  </button>
                )}
              </div>

              {/* Recruiter Plan */}
              <div
                className="p-6 rounded-2xl border-2 border-border hover:border-[#8096FD]/50 cursor-pointer transition-all bg-card"
                onClick={() => setSelectedManagerPlan(selectedManagerPlan === "recruiter" ? null : "recruiter")}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#8096FD]" />
                    <div>
                      <h4 className="text-lg font-bold text-foreground">Recruiter Plan</h4>
                      <p className="text-xs text-muted-foreground">Full recruitment lifecycle</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-[#8096FD] flex items-center justify-center flex-shrink-0">
                    {selectedManagerPlan === "recruiter" && <Check className="w-4 h-4 text-[#8096FD]" />}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">9% of base salary</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Per hire</p>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
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
                {selectedManagerPlan === "recruiter" && (
                  <button className="w-full mt-4 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#8096FD] to-[#6B7FE8] text-white font-medium text-sm hover:opacity-90 transition-opacity">
                    Upgrade to Recruiter Plan
                  </button>
                )}
              </div>

              {/* Enterprise Plan */}
              <div
                className="p-6 rounded-2xl border-2 border-[#A16AE8] bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5 cursor-pointer transition-all relative"
                onClick={() => setSelectedManagerPlan(selectedManagerPlan === "enterprise" ? null : "enterprise")}
              >
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
                  <div className="w-6 h-6 rounded-full border-2 border-[#A16AE8] flex items-center justify-center flex-shrink-0">
                    {selectedManagerPlan === "enterprise" && <Check className="w-4 h-4 text-[#A16AE8]" />}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">$500</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
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
                {selectedManagerPlan === "enterprise" && (
                  <button className="w-full mt-4 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium text-sm hover:opacity-90 transition-opacity">
                    Upgrade to Enterprise Plan
                  </button>
                )}
              </div>

              {/* Premium Plan */}
              <div
                className="p-6 rounded-2xl border-2 border-border hover:border-amber-500/50 cursor-pointer transition-all relative bg-card"
                onClick={() => setSelectedManagerPlan(selectedManagerPlan === "premium" ? null : "premium")}
              >
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
                  <div className="w-6 h-6 rounded-full border-2 border-amber-500 flex items-center justify-center flex-shrink-0">
                    {selectedManagerPlan === "premium" && <Check className="w-4 h-4 text-amber-500" />}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">30% + $300</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
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
                {selectedManagerPlan === "premium" && (
                  <button className="w-full mt-4 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium text-sm hover:opacity-90 transition-opacity">
                    Upgrade to Premium Plan
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Pricing Comparison Summary - Always visible */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Pricing Comparison Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Candidate Plans</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Free Plan: $0/month (basic features, 10 AI interactions)</li>
                <li>• Premium Monthly: $19.99/month (was $29.99, on sale)</li>
                <li>• Premium Annual: $149/year (was $239.88, save 38%)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Hiring Manager Plans</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Basic: $300/month (payroll & HR essentials)</li>
                <li>• Recruiter: 9% per hire (performance-based)</li>
                <li>• Enterprise: $500/month (most popular, all-inclusive)</li>
                <li>• Premium: 30% + $300/month (white-glove service)</li>
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
  isPremium?: boolean
  isAnnual?: boolean
}

function FeatureItem({ text, isPremium, isAnnual }: FeatureItemProps) {
  const color = isPremium ? "text-[#A16AE8]" : isAnnual ? "text-[#60D394]" : "text-green-500"

  return (
    <div className="flex items-start gap-3">
      <Check className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
      <span className="text-sm text-foreground">{text}</span>
    </div>
  )
}
