export type WorkspaceContentType =
  | "pdf"
  | "markdown"
  | "code"
  | "image"
  | "video"
  | "job-board"
  | "job-description"
  | "job-view" // Added job-view content type
  | "table"
  | "analytics"
  | "candidate-profile"
  | "hiring-manager-profile"
  | "candidate-pricing"
  | "payment-success"
  | null

export interface WorkspaceContent {
  type: WorkspaceContentType
  title?: string
  data?: any
  planName?: string
  amount?: string
  job?: JobListing // Added job property for job view
}

export type JobStatus = "draft" | "open" | "closed" | "cancelled"

export interface JobListing {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  posted: string
  description: string
  requirements: string[]
  applied?: boolean
  saved?: boolean // Added saved property to track saved jobs
  logo?: string
  status?: JobStatus
  responsibilities?: string[]
  qualifications?: string[]
  benefits?: string[]
  department?: string
  reportingTo?: string
  teamSize?: string
  workArrangement?: string
  applicationDeadline?: string
  hiringManager?: string
  openings?: number
}
