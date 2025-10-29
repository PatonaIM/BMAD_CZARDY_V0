export type WorkspaceContentType =
  | "pdf"
  | "markdown"
  | "code"
  | "image"
  | "video"
  | "job-board"
  | "job-description"
  | "table"
  | "analytics"
  | null

export interface WorkspaceContent {
  type: WorkspaceContentType
  title?: string
  data?: any
}

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
  logo?: string
}
