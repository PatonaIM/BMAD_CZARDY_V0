"use client"

import { useState } from "react"
import { Check, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CandidatePricingProps {
  onClose?: () => void
}

export function CandidatePricing({ onClose }: CandidatePricingProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpgrade = (plan: "monthly" | "annual") => {
    setIsProcessing(true)

    setTimeout(() => {
      toast({
        title: "Upgrade successful!",
        description: `Welcome to Teamified Premium ${plan === "annual" ? "(Annual)" : "(Monthly)"}! You now have access to all premium features.`,
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

  const freePlanFeatures = [
    "Basic job search and matching",
    "Limited AI agent interactions (10/month)",
    "Resume upload and basic parsing",
    "Email notifications for new matches",
    "Access to public job board",
  ]

  const premiumPlanFeatures = [
    "Everything in Free Plan",
    "Unlimited AI agent interactions",
    "Advanced resume optimization",
    "Priority job matching",
    "Interview preparation tools",
    "Salary insights and negotiation tips",
    "Direct messaging with recruiters",
    "Application tracking dashboard",
    "Career coaching sessions (2/month)",
    "Early access to new features",
  ]

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Upgrade to Premium</h2>
          <p className="text-sm text-muted-foreground">
            Unlock unlimited access to Teamified AI and accelerate your job search
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Free Plan */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Free Plan</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {freePlanFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <button
              disabled
              className="w-full px-6 py-3 rounded-lg bg-muted text-muted-foreground font-medium cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* Monthly Premium Plan */}
          <div className="rounded-2xl border-2 border-[#A16AE8] bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5 p-6 relative">
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
            </div>

            <div className="space-y-3 mb-6">
              {premiumPlanFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleUpgrade("monthly")}
              disabled={isProcessing}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : "Upgrade Monthly"}
            </button>
          </div>

          {/* Annual Premium Plan */}
          <div className="rounded-2xl border-2 border-[#60D394] bg-gradient-to-br from-[#60D394]/5 to-[#60D394]/10 p-6 relative">
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

            <div className="space-y-3 mb-6">
              {premiumPlanFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#60D394] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleUpgrade("annual")}
              disabled={isProcessing}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#60D394] to-[#4CAF50] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : "Upgrade Annually"}
            </button>
          </div>
        </div>
        {/* </CHANGE> */}

        {/* Benefits Section */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Why upgrade to Premium?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#A16AE8]/20 to-[#8096FD]/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#A16AE8]" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Unlimited AI Access</h4>
                <p className="text-sm text-muted-foreground">
                  Chat with our AI agents as much as you need to find your perfect role
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#A16AE8]/20 to-[#8096FD]/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-[#A16AE8]" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Priority Matching</h4>
                <p className="text-sm text-muted-foreground">
                  Get matched with the best opportunities before other candidates
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#A16AE8]/20 to-[#8096FD]/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-[#A16AE8]" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Career Coaching</h4>
                <p className="text-sm text-muted-foreground">
                  Get personalized guidance from experienced career coaches
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#A16AE8]/20 to-[#8096FD]/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-[#A16AE8]" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Advanced Tools</h4>
                <p className="text-sm text-muted-foreground">
                  Access resume optimization, interview prep, and salary insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
