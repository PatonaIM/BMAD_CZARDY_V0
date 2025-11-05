export interface AIAgent {
  id: string
  name: string
  firstName: string
  description: string
  icon: string
  color: string
  actions: string[]
  fullDescription: string
  callToAction: string
}

export const AI_AGENTS: AIAgent[] = [
  {
    id: "account-manager",
    name: "Account Manager",
    firstName: "Lawrence",
    description: "Service overview, quotes, job creation, billing & contracts",
    icon: "💼",
    color: "#A16AE8",
    fullDescription:
      "I specialize in service overviews, quotations, job creation, candidate management, billing inquiries, and contract management. I'm here to help you navigate our services and manage your account effectively.",
    callToAction: "What can I help you with today?",
    actions: [
      "service-overview",
      "timeline-estimate",
      "quick-quote",
      "talk-to-human",
      "schedule-meeting",
      "create-job-request",
      "show-candidates",
      "contract-status",
      "billing-inquiry",
      "payment-options",
      "feedback-survey",
      "reference-check",
    ],
  },
  {
    id: "technical-recruiter",
    name: "Technical Recruiter",
    firstName: "Danny",
    description: "AI interviews, candidate briefs, job descriptions & salary benchmarking",
    icon: "🎯",
    color: "#8096FD",
    fullDescription:
      "I specialize in conducting AI interviews, providing candidate briefs, refining job descriptions, preparing interview questions, and salary benchmarking. I'm here to help you find and evaluate the best technical talent.",
    callToAction: "What recruitment challenge can I help you tackle today?",
    actions: [
      "ai-interview",
      "interview-results",
      "status-update",
      "candidate-brief",
      "refine-job-description",
      "prepare-questions",
      "interview-feedback",
      "salary-benchmarking",
      "schedule-interview",
      "candidate-comparison",
      "role-requirements",
      "market-insights",
    ],
  },
  {
    id: "sales-marketing",
    name: "Sales & Marketing",
    firstName: "Darlyn",
    description: "Lead qualification, case studies, ROI calculator & demos",
    icon: "📊",
    color: "#6366F1",
    fullDescription:
      "I specialize in lead qualification, service comparisons, case studies, testimonials, ROI calculations, and demo scheduling. I'm here to help you understand our value proposition and make informed decisions.",
    callToAction: "How can I help you explore our services today?",
    actions: [
      "lead-qualification",
      "service-comparison",
      "case-studies",
      "testimonials",
      "roi-calculator",
      "industry-insights",
      "demo-scheduling",
      "pricing-info",
      "competitor-analysis",
    ],
  },
  {
    id: "hr-manager",
    name: "HR Manager",
    firstName: "Siona",
    description: "Onboarding, policies, benefits & training",
    icon: "👥",
    color: "#10B981",
    fullDescription:
      "I specialize in onboarding processes, policy guidance, document management, benefits overview, compliance, and training schedules. I'm here to help you with all your HR-related needs.",
    callToAction: "What HR matter can I assist you with today?",
    actions: [
      "onboarding-checklist",
      "policy-questions",
      "document-requests",
      "benefits-overview",
      "contact-hr",
      "compliance-guide",
      "training-schedule",
      "employee-handbook",
      "timesheet-help",
    ],
  },
  {
    id: "financial-controller",
    name: "Financial Controller",
    firstName: "Dave",
    description: "Invoices, payments, billing cycles & EOR fees",
    icon: "💳",
    color: "#F59E0B",
    fullDescription:
      "I specialize in invoice management, payment processing, billing cycles, account balances, payment plans, tax documents, and EOR fee calculations. I'm here to help you manage your financial matters efficiently.",
    callToAction: "What financial question can I help you with today?",
    actions: [
      "invoice-status",
      "payment-methods",
      "receipt-requests",
      "billing-cycles",
      "account-balance",
      "payment-plans",
      "tax-documents",
      "eor-fee-calculation",
      "cost-breakdown",
    ],
  },
]
