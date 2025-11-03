export type WorkspaceContentType =
  | "pdf"
  | "markdown"
  | "code"
  | "image"
  | "video"
  | "job-board"
  | "job-description"
  | "job-view"
  | "table"
  | "analytics"
  | "candidate-profile"
  | "hiring-manager-profile"
  | "candidate-pricing"
  | "payment-success"
  | "challenge-loading"
  | "challenge"
  | null

export interface WorkspaceContent {
  type: WorkspaceContentType
  title?: string
  data?: any
  planName?: string
  amount?: string
  job?: JobListing
}

export type JobStatus = "draft" | "open" | "closed" | "cancelled"

export type StageStatus = "completed" | "pending" | "not-started" | "scheduled"

export interface ApplicationStatus {
  takeHomeChallenge: StageStatus
  aiInterviews: StageStatus
  hiringManager: StageStatus
  jobOffer: StageStatus
}

export interface JobListing {
  id: string
  title: string
  company: string
  companyWebsite?: string
  location: string
  type: string
  salary: string
  posted: string
  description: string
  requirements: string[]
  applied?: boolean
  saved?: boolean
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
  aboutClient?: string
  jobSummary?: string
  skillMatch?: number // Percentage (0-100) indicating how well candidate matches job requirements
  applicationStatus?: ApplicationStatus // Added to track application stage completion
}
