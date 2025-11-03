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
  | "candidate-swipe"
  | "job-swipe"
  | "match-success"
  | null

export interface WorkspaceContent {
  type: WorkspaceContentType
  title?: string
  data?: any
  planName?: string
  amount?: string
  job?: JobListing
  candidate?: CandidateProfile
  matchedWith?: string
}

export type JobStatus = "draft" | "open" | "closed" | "cancelled"

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
}

export interface CandidateProfile {
  id: string
  name: string
  avatar?: string
  title: string
  location: string
  experience: string
  email: string
  phone?: string
  linkedin?: string
  github?: string
  portfolio?: string
  summary: string
  skills: string[]
  skillMatch: number
  resumeUrl?: string
  takeHomeChallengeStatus: "completed" | "pending" | "not_started"
  takeHomeChallengeScore?: number
  takeHomeChallengeSubmission?: string
  takeHomeChallengeNotes?: string
  aiInterviewStatus: "completed" | "pending" | "not_started"
  aiInterviewScore?: number
  aiInterviewRecordingUrl?: string
  aiInterviewTranscript?: string
  aiGeneratedInsights: string[]
  matchedJobs?: string[]
  swipedRight?: boolean
  swipedLeft?: boolean
}
