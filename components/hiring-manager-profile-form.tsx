"use client"

import { useState } from "react"
import {
  Building2,
  User,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Users,
  Zap,
  Crown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HiringManagerProfileFormProps {
  onSave?: () => void
  onClose?: () => void
}

interface CompanyProfile {
  companyName: string
  industry: string
  companySize: string
  website: string
  description: string
}

interface ManagerInfo {
  fullName: string
  email: string
  phone: string
  role: string
  department: string
}

interface RolesHiring {
  roles: string
  numberOfPositions: string
  urgency: string
  budget: string
}

interface PricingSelection {
  plan: "basic" | "recruiter" | "enterprise" | "premium" | null
  seats: number
}

interface PaymentInfo {
  cardNumber: string
  cardName: string
  expiryDate: string
  cvv: string
}

export function HiringManagerProfileForm({ onSave, onClose }: HiringManagerProfileFormProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Company Profile
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    companyName: "",
    industry: "",
    companySize: "",
    website: "",
    description: "",
  })

  const [managerInfo, setManagerInfo] = useState<ManagerInfo>({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
  })

  const [rolesHiring, setRolesHiring] = useState<RolesHiring>({
    roles: "",
    numberOfPositions: "",
    urgency: "",
    budget: "",
  })

  // Step 2: Pricing Selection
  const [pricingSelection, setPricingSelection] = useState<PricingSelection>({
    plan: null,
    seats: 1,
  })

  // Step 3: Payment
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  const [paymentProgress, setPaymentProgress] = useState(0)

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePaymentSlider = (value: number) => {
    setPaymentProgress(value)
    if (value === 100) {
      // Payment complete
      setTimeout(() => {
        toast({
          title: "Payment successful!",
          description: "Your enterprise account has been activated.",
          duration: 2000,
        })

        if (onSave) {
          onSave()
        }

        if (onClose) {
          setTimeout(() => {
            onClose()
          }, 2000)
        }
      }, 500)
    }
  }

  const isStep1Valid = () => {
    return (
      companyProfile.companyName &&
      companyProfile.industry &&
      managerInfo.fullName &&
      managerInfo.email &&
      managerInfo.role
    )
  }

  const isStep2Valid = () => {
    return pricingSelection.plan !== null && pricingSelection.seats > 0
  }

  const isStep3Valid = () => {
    return (
      paymentInfo.cardNumber.length === 19 &&
      paymentInfo.cardName &&
      paymentInfo.expiryDate.length === 5 &&
      paymentInfo.cvv.length === 3
    )
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "")
    const chunks = cleaned.match(/.{1,4}/g)
    return chunks ? chunks.join(" ") : cleaned
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
    }
    return cleaned
  }

  const calculateTotal = () => {
    if (!pricingSelection.plan) return 0

    const pricePerSeat: Record<string, number> = {
      basic: 300,
      recruiter: 500,
      enterprise: 800,
      premium: 1200,
    }

    return pricingSelection.seats * (pricePerSeat[pricingSelection.plan] || 0)
  }

  const getPlanName = () => {
    const planNames: Record<string, string> = {
      basic: "Basic Plan",
      recruiter: "Recruiter Plan",
      enterprise: "Enterprise Plan",
      premium: "Premium Plan",
    }
    return pricingSelection.plan ? planNames[pricingSelection.plan] : ""
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Enterprise Account Setup</h2>
          <p className="text-sm text-muted-foreground">Complete the setup to start hiring with Teamified</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= 1
                    ? "bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 1 ? <Check className="w-5 h-5" /> : 1}
              </div>
              <span className="text-xs mt-2 font-medium text-center whitespace-nowrap">Company Profile</span>
            </div>

            {/* Connector Line 1 */}
            <div
              className={`h-1 flex-1 rounded-full transition-all ${
                currentStep > 1 ? "bg-gradient-to-r from-[#A16AE8] to-[#8096FD]" : "bg-muted"
              }`}
            />

            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= 2
                    ? "bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 2 ? <Check className="w-5 h-5" /> : 2}
              </div>
              <span className="text-xs mt-2 font-medium text-center whitespace-nowrap">Select Pricing</span>
            </div>

            {/* Connector Line 2 */}
            <div
              className={`h-1 flex-1 rounded-full transition-all ${
                currentStep > 2 ? "bg-gradient-to-r from-[#A16AE8] to-[#8096FD]" : "bg-muted"
              }`}
            />

            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= 3
                    ? "bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 3 ? <Check className="w-5 h-5" /> : 3}
              </div>
              <span className="text-xs mt-2 font-medium text-center whitespace-nowrap">Payment</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Company Profile */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Company Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-[#A16AE8]" />
                  <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={companyProfile.companyName}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                      placeholder="TechCorp"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Industry *</label>
                    <div className="relative">
                      <select
                        value={companyProfile.industry}
                        onChange={(e) => setCompanyProfile({ ...companyProfile, industry: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] appearance-none pr-10"
                      >
                        <option value="">Select industry</option>
                        <option value="technology">Technology</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="retail">Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company Size</label>
                    <div className="relative">
                      <select
                        value={companyProfile.companySize}
                        onChange={(e) => setCompanyProfile({ ...companyProfile, companySize: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] appearance-none pr-10"
                      >
                        <option value="">Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501+">501+ employees</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                    <input
                      type="url"
                      value={companyProfile.website}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, website: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                      placeholder="https://techcorp.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tell us about your company.</label>
                  <textarea
                    value={companyProfile.description}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] resize-none"
                    placeholder="Brief description of your company..."
                  />
                </div>
              </div>

              {/* Manager Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-[#8096FD]" />
                  <h3 className="text-lg font-semibold text-foreground">Your Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={managerInfo.fullName}
                      onChange={(e) => setManagerInfo({ ...managerInfo, fullName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                      placeholder="Steve Rogers"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <input
                      type="email"
                      value={managerInfo.email}
                      onChange={(e) => setManagerInfo({ ...managerInfo, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                      placeholder="steve@techcorp.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                    <input
                      type="tel"
                      value={managerInfo.phone}
                      onChange={(e) => setManagerInfo({ ...managerInfo, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Your Role *</label>
                    <input
                      type="text"
                      value={managerInfo.role}
                      onChange={(e) => setManagerInfo({ ...managerInfo, role: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                      placeholder="e.g., CTO, HR Manager"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Department</label>
                  <input
                    type="text"
                    value={managerInfo.department}
                    onChange={(e) => setManagerInfo({ ...managerInfo, department: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                    placeholder="e.g., Engineering, Human Resources"
                  />
                </div>
              </div>

              {/* Roles to Hire */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Roles You're Looking to Fill</h3>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Roles/Positions</label>
                  <textarea
                    value={rolesHiring.roles}
                    onChange={(e) => setRolesHiring({ ...rolesHiring, roles: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] resize-none"
                    placeholder="e.g., Senior Software Engineer, Product Manager, DevOps Engineer..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Number of Positions</label>
                    <input
                      type="number"
                      value={rolesHiring.numberOfPositions}
                      onChange={(e) => setRolesHiring({ ...rolesHiring, numberOfPositions: e.target.value })}
                      min="1"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Urgency</label>
                    <div className="relative">
                      <select
                        value={rolesHiring.urgency}
                        onChange={(e) => setRolesHiring({ ...rolesHiring, urgency: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] appearance-none pr-10"
                      >
                        <option value="">Select urgency</option>
                        <option value="immediate">Immediate (1-2 weeks)</option>
                        <option value="urgent">Urgent (1 month)</option>
                        <option value="normal">Normal (2-3 months)</option>
                        <option value="flexible">Flexible (3+ months)</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Budget Range</label>
                  <input
                    type="text"
                    value={rolesHiring.budget}
                    onChange={(e) => setRolesHiring({ ...rolesHiring, budget: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                    placeholder="e.g., $50k - $80k per role"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing Selection */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-semibold text-foreground">Select Your Enterprise Plan</h3>
              <p className="text-sm text-muted-foreground">Choose the plan that best fits your organization's needs</p>

              <div className="grid grid-cols-2 gap-4">
                {/* Basic Plan */}
                <div
                  onClick={() => setPricingSelection({ ...pricingSelection, plan: "basic" })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    pricingSelection.plan === "basic"
                      ? "border-[#A16AE8] bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5"
                      : "border-border hover:border-[#A16AE8]/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-[#A16AE8]" />
                      <div>
                        <h4 className="text-lg font-bold text-foreground">Basic Plan</h4>
                        <p className="text-xs text-muted-foreground">Essential HR tools</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        pricingSelection.plan === "basic" ? "border-[#A16AE8] bg-[#A16AE8]" : "border-border"
                      }`}
                    >
                      {pricingSelection.plan === "basic" && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">$300</span>
                      <span className="text-sm text-muted-foreground">/seat/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                      <span>Payroll & HR Management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                      <span>Limited access to Teamified AI Agents</span>
                    </li>
                  </ul>
                </div>

                {/* Recruiter Plan */}
                <div
                  onClick={() => setPricingSelection({ ...pricingSelection, plan: "recruiter" })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    pricingSelection.plan === "recruiter"
                      ? "border-[#A16AE8] bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5"
                      : "border-border hover:border-[#A16AE8]/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#8096FD]" />
                      <div>
                        <h4 className="text-lg font-bold text-foreground">Recruiter Plan</h4>
                        <p className="text-xs text-muted-foreground">Hiring & performance</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        pricingSelection.plan === "recruiter" ? "border-[#A16AE8] bg-[#A16AE8]" : "border-border"
                      }`}
                    >
                      {pricingSelection.plan === "recruiter" && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">$500</span>
                      <span className="text-sm text-muted-foreground">/seat/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#8096FD] flex-shrink-0 mt-0.5" />
                      <span>Everything in Basic Plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#8096FD] flex-shrink-0 mt-0.5" />
                      <span>Hire (EOR)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#8096FD] flex-shrink-0 mt-0.5" />
                      <span>Performance Management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#8096FD] flex-shrink-0 mt-0.5" />
                      <span>Limited AI Agents access</span>
                    </li>
                  </ul>
                </div>

                {/* Enterprise Plan */}
                <div
                  onClick={() => setPricingSelection({ ...pricingSelection, plan: "enterprise" })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    pricingSelection.plan === "enterprise"
                      ? "border-[#A16AE8] bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5"
                      : "border-border hover:border-[#A16AE8]/50"
                  }`}
                >
                  <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white text-xs font-semibold">
                    Popular
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#A16AE8]" />
                      <div>
                        <h4 className="text-lg font-bold text-foreground">Enterprise Plan</h4>
                        <p className="text-xs text-muted-foreground">Complete solution</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        pricingSelection.plan === "enterprise" ? "border-[#A16AE8] bg-[#A16AE8]" : "border-border"
                      }`}
                    >
                      {pricingSelection.plan === "enterprise" && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">$800</span>
                      <span className="text-sm text-muted-foreground">/seat/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                      <span>Everything in Recruiter Plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                      <span>Equipment provisioning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                      <span>Office Space management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                      <span>Full access to Teamified AI Agents</span>
                    </li>
                  </ul>
                </div>

                {/* Premium Plan */}
                <div
                  onClick={() => setPricingSelection({ ...pricingSelection, plan: "premium" })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    pricingSelection.plan === "premium"
                      ? "border-[#A16AE8] bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5"
                      : "border-border hover:border-[#A16AE8]/50"
                  }`}
                >
                  <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold">
                    All-In
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      <div>
                        <h4 className="text-lg font-bold text-foreground">Premium Plan</h4>
                        <p className="text-xs text-muted-foreground">All-in package</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        pricingSelection.plan === "premium" ? "border-[#A16AE8] bg-[#A16AE8]" : "border-border"
                      }`}
                    >
                      {pricingSelection.plan === "premium" && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">$1,200</span>
                      <span className="text-sm text-muted-foreground">/seat/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>Everything in Enterprise Plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>Dedicated Account Management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>Advanced Dashboarding Features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>Full access to Teamified AI Agents</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Seats Selection */}
              {pricingSelection.plan && (
                <div className="p-6 rounded-2xl border border-border bg-muted/30">
                  <label className="block text-sm font-medium text-foreground mb-4">Number of Seats</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        setPricingSelection({
                          ...pricingSelection,
                          seats: Math.max(1, pricingSelection.seats - 1),
                        })
                      }
                      className="w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={pricingSelection.seats}
                      onChange={(e) =>
                        setPricingSelection({
                          ...pricingSelection,
                          seats: Math.max(1, Number.parseInt(e.target.value) || 1),
                        })
                      }
                      min="1"
                      className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                    />
                    <button
                      onClick={() =>
                        setPricingSelection({
                          ...pricingSelection,
                          seats: pricingSelection.seats + 1,
                        })
                      }
                      className="w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="mt-4 p-4 rounded-lg bg-background border border-border">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Plan</span>
                      <span className="font-medium">{getPlanName()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Seats</span>
                      <span className="font-medium">{pricingSelection.seats}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Price per seat</span>
                      <span className="font-medium">
                        $
                        {pricingSelection.plan === "basic"
                          ? "300"
                          : pricingSelection.plan === "recruiter"
                            ? "500"
                            : pricingSelection.plan === "enterprise"
                              ? "800"
                              : "1,200"}
                      </span>
                    </div>
                    <div className="border-t border-border my-2" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total Monthly</span>
                      <span className="text-2xl font-bold text-[#A16AE8]">${calculateTotal().toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Billed monthly</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-[#A16AE8]" />
                <h3 className="text-lg font-semibold text-foreground">Payment Information</h3>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-semibold">{getPlanName()}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Seats</span>
                  <span className="font-semibold">{pricingSelection.seats}</span>
                </div>
                <div className="border-t border-border my-3" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-[#A16AE8]">${calculateTotal().toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Billed monthly</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Card Number *</label>
                  <input
                    type="text"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value.replace(/\s/g, ""))
                      if (formatted.replace(/\s/g, "").length <= 16) {
                        setPaymentInfo({ ...paymentInfo, cardNumber: formatted })
                      }
                    }}
                    maxLength={19}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] font-mono"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cardholder Name *</label>
                  <input
                    type="text"
                    value={paymentInfo.cardName}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                    placeholder="Steve Rogers"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Expiry Date *</label>
                    <input
                      type="text"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => {
                        const formatted = formatExpiryDate(e.target.value)
                        if (formatted.replace(/\D/g, "").length <= 4) {
                          setPaymentInfo({ ...paymentInfo, expiryDate: formatted })
                        }
                      }}
                      maxLength={5}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] font-mono"
                      placeholder="MM/YY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">CVV *</label>
                    <input
                      type="text"
                      value={paymentInfo.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        if (value.length <= 3) {
                          setPaymentInfo({ ...paymentInfo, cvv: value })
                        }
                      }}
                      maxLength={3}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] font-mono"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Slider */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-border bg-muted/30">
                <label className="block text-sm font-medium text-foreground mb-4 text-center">
                  Slide to Complete Payment
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={paymentProgress}
                    onChange={(e) => handlePaymentSlider(Number.parseInt(e.target.value))}
                    disabled={!isStep3Valid()}
                    className="w-full h-12 appearance-none bg-gradient-to-r from-muted to-[#A16AE8] rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(to right, #A16AE8 0%, #8096FD ${paymentProgress}%, hsl(var(--muted)) ${paymentProgress}%, hsl(var(--muted)) 100%)`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-sm font-semibold text-foreground">
                      {paymentProgress === 100 ? "Processing..." : `${paymentProgress}%`}
                    </span>
                  </div>
                </div>
                {!isStep3Valid() && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Please fill in all payment details to proceed
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-2.5 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < 3 && (
            <button
              onClick={handleNext}
              disabled={(currentStep === 1 && !isStep1Valid()) || (currentStep === 2 && !isStep2Valid())}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
