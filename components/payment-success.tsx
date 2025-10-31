"use client"

import { Check } from "lucide-react"
import { useEffect, useState } from "react"

interface PaymentSuccessProps {
  planName: string
  amount: string
  onClose?: () => void
}

export function PaymentSuccess({ planName, amount, onClose }: PaymentSuccessProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  return (
    <div className="h-full flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/20">
      <div
        className={`max-w-md w-full transition-all duration-700 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-card rounded-3xl border border-border shadow-2xl p-8">
          {/* Success checkmark animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Outer ring animation */}
              <div
                className={`w-32 h-32 rounded-full bg-gradient-to-br from-[#A16AE8] to-[#8096FD] flex items-center justify-center transition-all duration-700 ${
                  isVisible ? "scale-100 rotate-0" : "scale-0 rotate-180"
                }`}
              >
                {/* Inner white circle */}
                <div className="w-28 h-28 rounded-full bg-background flex items-center justify-center">
                  {/* Checkmark */}
                  <Check
                    className={`w-16 h-16 text-[#A16AE8] transition-all duration-500 delay-300 ${
                      isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                    strokeWidth={3}
                  />
                </div>
              </div>

              {/* Pulse effect */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-br from-[#A16AE8] to-[#8096FD] transition-all duration-1000 ${
                  isVisible ? "scale-150 opacity-0" : "scale-100 opacity-50"
                }`}
              />
            </div>
          </div>

          {/* Success message */}
          <div
            className={`text-center space-y-4 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h2 className="text-3xl font-bold text-foreground">Payment Successful!</h2>
            <p className="text-muted-foreground">Your enterprise account has been activated and is ready to use.</p>

            {/* Payment details */}
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5 border border-border">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-semibold text-foreground">{planName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-xl font-bold text-[#A16AE8]">{amount}</span>
                </div>
              </div>
            </div>

            {/* Success features */}
            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#A16AE8]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-[#A16AE8]" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Full Access Granted</p>
                  <p className="text-sm text-muted-foreground">All features are now available</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8096FD]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-[#8096FD]" />
                </div>
                <div>
                  <p className="font-medium text-foreground">AI Agents Ready</p>
                  <p className="text-sm text-muted-foreground">Start hiring with Teamified AI</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#A16AE8]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-[#A16AE8]" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Support Available</p>
                  <p className="text-sm text-muted-foreground">24/7 dedicated account support</p>
                </div>
              </div>
            </div>

            {/* Close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="mt-8 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-semibold hover:shadow-lg transition-all hover:scale-105"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
