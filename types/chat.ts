export interface Message {
  id: string
  type: "user" | "ai"
  content: string
  agentId: string
  timestamp?: number
  responseType?: "text" | "code" | "table" | "file" | "chart"
  codeSnippet?: string
  promptSuggestions?: string[]
  hasActionButton?: boolean
  actionButtonText?: string
  actionButtonHandler?: string
}
