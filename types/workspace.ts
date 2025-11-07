import type React from "react"
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
  | "candidate-profile-view" // Added new workspace type for viewing candidate profiles
  | "hiring-manager-profile"
  | "candidate-pricing"
  | "payment-success"
  | "challenge-loading"
  | "challenge"
  | "candidate-swipe"
  | "job-swipe"
  | "match-success"
  | "browse-candidates"
  | "candidate-chat"
  | "hiring-manager-chat" // Added hiring-manager-chat workspace type for candidate-hiring manager conversations
  | "pricing-plans" // Added new pricing-plans workspace type for centralized pricing information
  | null

export interface WorkspaceContent {
  type: WorkspaceContentType
  title?: string
  data?: any
  planName?: string
  amount?: string
  job?: JobListing
  jobs?: JobListing[] // Added jobs array for job-board context
  jobBoardTab?: "applied" | "invited" | "saved" | "browse"
  jobStatusFilter?: "draft" | "open" | "closed" // Added jobStatusFilter for hiring manager job navigation
  candidate?: CandidateProfile
  candidates?: CandidateProfile[] // Full list of candidates for swiping through
  currentCandidateIndex?: number // Current index in the candidates array
  matchedWith?: string
  timestamp?: number // Added timestamp to ensure unique workspace instances for randomization
  showSwipeButtons?: boolean // Added flag to show swipe buttons in candidate profile view
  sourceView?: "browse-candidates" | "job-view" // Track where the profile was opened from
}

export type JobStatus = "draft" | "open" | "closed" | "cancelled"

export type ApplicationStage = "applied" | "take-home-challenge" | "ai-interview" | "final-review" | "offer"

export type AssessmentStatus = "completed" | "pending" | "not_started"
export type MatchStatus = "waiting" | "matched"
export type OfferStatus = "pending" | "sent" | "accepted"

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
  invited?: boolean // Added invited property to track job invitations
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
  skillMatch?: number
  applicationStage?: ApplicationStage
  takeHomeChallengeStatus?: AssessmentStatus
  aiSkillAssessmentStatus?: AssessmentStatus
  hiringManagerMatchStatus?: MatchStatus
  jobOfferStatus?: OfferStatus
  // Legacy fields for backward compatibility
  takeHomeChallengeCompleted?: boolean
  aiInterviewCompleted?: boolean
  finalReviewCompleted?: boolean
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
  codeReviewPoints?: string[]
  submissionFiles?: { name: string; url: string; type: string; size?: string }[]
  submissionLinks?: string[]
  githubRepo?: string
  aiInterviewStatus: "completed" | "pending" | "not_started"
  aiInterviewScore?: number
  aiInterviewRecordingUrl?: string
  aiInterviewTranscript?: string
  aiGeneratedInsights: string[]
  matchedJobs?: string[]
  swipedRight?: boolean
  swipedLeft?: boolean
}

export interface WorkspacePaneProps {
  isOpen: boolean
  onClose: () => void
  content: WorkspaceContent
  onProfileSave?: () => void // Added callback for profile save
  onUpgradePlan?: () => void // Added onUpgradePlan prop
  onHiringManagerStepChange?: (step: number) => void
  onViewJob?: (job: JobListing) => void // Added callback for viewing job details
  onBackToJobBoard?: () => void // Added onBackToJobBoard prop
  activeWorkspace?: string // Added activeWorkspace prop for context
  onApplyForJob?: (job: JobListing) => void // Added prop
  // Added onOpenWorkspace prop
  onOpenWorkspace?: (workspaceType: WorkspaceContent["type"], data?: any) => void
  // Added showApplicationStatus and onToggleApplicationView props
  showApplicationStatus?: boolean
  onToggleApplicationView?: (show: boolean) => void
  onRequestSubmit?: () => void
  onConfirmSubmit?: () => void
  onSubmissionComplete?: () => void
  onSendMessage?: (message: string) => void
  onOpenCandidateChat?: (candidate: CandidateProfile, job?: JobListing) => void
  chatMainRef?: React.RefObject<any>
}
