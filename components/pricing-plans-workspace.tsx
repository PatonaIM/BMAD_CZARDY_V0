"use client"

import { Check, Sparkles, Building2, Users, Zap, Crown } from "lucide-react"

export function PricingPlansWorkspace() {
  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3">Pricing Plans</h1>
          <p className="text-lg text-muted-foreground">
            Complete pricing information for candidates and hiring managers
          </p>
        </div>

        {/* Candidate Pricing Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-[#A16AE8]" />
            <h2 className="text-3xl font-bold text-foreground">Candidate Plans</h2>
          </div>

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
                <FeatureItem text="Everything in Premium Monthly" isAnnual />
                <FeatureItem text="38% discount vs monthly plan" isAnnual />
                <FeatureItem text="Billed annually at $149/year" isAnnual />
              </div>
            </div>
          </div>
        </section>

        {/* Hiring Manager Pricing Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-8 h-8 text-[#8096FD]" />
            <h2 className="text-3xl font-bold text-foreground">Hiring Manager Plans</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Basic Plan */}
            <div className="rounded-2xl border-2 border-border bg-card p-6 flex flex-col">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Basic Plan</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">$300</span>
                  <span className="text-muted-foreground text-sm">USD/month</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <FeatureItem text="Payroll and HR essentials" />
                <FeatureItem text="Basic candidate search" />
                <FeatureItem text="Standard support" />
                <FeatureItem text="Monthly billing" />
              </div>

              <div className="text-xs text-muted-foreground">Perfect for small teams starting out</div>
            </div>

            {/* Recruiter Plan */}
            <div className="rounded-2xl border-2 border-border bg-card p-6 flex flex-col">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Recruiter Plan</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">9%</span>
                  <span className="text-muted-foreground text-sm">of base salary</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <FeatureItem text="Pay only for successful placements" />
                <FeatureItem text="Full candidate access" />
                <FeatureItem text="AI-powered matching" />
                <FeatureItem text="Performance-based pricing" />
              </div>

              <div className="text-xs text-muted-foreground">Risk-free hiring - only pay per hire</div>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-2xl border-2 border-[#8096FD] bg-gradient-to-br from-[#8096FD]/5 to-[#8096FD]/10 p-6 relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#8096FD] to-[#6B7FE8] text-white text-xs font-bold">
                MOST POPULAR
              </div>

              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#8096FD]/10 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-[#8096FD]" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Enterprise Plan</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">$500</span>
                  <span className="text-muted-foreground text-sm">USD/month</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <FeatureItem text="Equipment and workspace included" isPremium />
                <FeatureItem text="Priority candidate matching" isPremium />
                <FeatureItem text="Advanced analytics" isPremium />
                <FeatureItem text="Dedicated account manager" isPremium />
              </div>

              <div className="text-xs text-muted-foreground">Complete solution for growing companies</div>
            </div>

            {/* Premium Plan */}
            <div className="rounded-2xl border-2 border-[#FFD700] bg-gradient-to-br from-[#FFD700]/5 to-[#FFA500]/5 p-6 relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white text-xs font-bold">
                ALL-IN
              </div>

              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#FFD700]/10 flex items-center justify-center mb-4">
                  <Crown className="w-6 h-6 text-[#FFD700]" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Premium Plan</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">30%</span>
                  <span className="text-muted-foreground text-sm">+ $300/month</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <FeatureItem text="All-in comprehensive solution" isAnnual />
                <FeatureItem text="White-glove onboarding" isAnnual />
                <FeatureItem text="24/7 dedicated support team" isAnnual />
                <FeatureItem text="Custom integrations" isAnnual />
              </div>

              <div className="text-xs text-muted-foreground">Premium service for enterprise clients</div>
            </div>
          </div>

          {/* Enterprise Plan Details */}
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
        </section>
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
