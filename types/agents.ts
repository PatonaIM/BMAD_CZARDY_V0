export interface AIAgent {
  id: string
  name: string
  description: string
  icon: string
  color: string
  actions: string[]
}

export const AI_AGENTS: AIAgent[] = [
  {
    id: "account-manager",
    name: "Account Manager",
    description: "Service overview, quotes, job creation, billing & contracts",
    icon: "💼",
    color: "#A16AE8",
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
    description: "AI interviews, candidate briefs, job descriptions & salary benchmarking",
    icon: "🎯",
    color: "#8096FD",
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
    description: "Lead qualification, case studies, ROI calculator & demos",
    icon: "📊",
    color: "#6366F1",
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
    description: "Onboarding, policies, benefits & training",
    icon: "👥",
    color: "#10B981",
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
    description: "Invoices, payments, billing cycles & EOR fees",
    icon: "💳",
    color: "#F59E0B",
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
