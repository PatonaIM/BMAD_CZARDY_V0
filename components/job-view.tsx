"use client"

import type React from "react"

import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  CheckCircle2,
  ExternalLink,
  Users,
  Star,
  Pencil,
  Check,
  X,
  Bold,
  Italic,
  Underline,
  List,
  LinkIcon,
  Loader2,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { JobListing, JobStatus, CandidateProfile } from "@/types/workspace"

interface JobViewProps {
  job: JobListing
  userRole?: "candidate" | "hiring_manager"
  onClose?: () => void
  onApplyForJob?: (job: JobListing) => void
  onSaveJob?: (jobId: string, newJob: JobListing) => void
  onUnsaveJob?: (jobId: string) => void
  onSendMessage?: (message: string) => void
  showApplicationStatus?: boolean
  onToggleApplicationView?: (show: boolean) => void
  onUpdateJob?: (jobId: string, updatedJob: JobListing) => void
  matchedCandidates?: CandidateProfile[]
  onBrowseMoreCandidates?: () => void
  onOpenCandidateChat?: (candidate: CandidateProfile) => void
}

const getStatusConfig = (status: JobStatus) => {
  switch (status) {
    case "draft":
      return {
        label: "Draft",
        className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        description: "Work in progress, not yet opened but can be edited",
      }
    case "open":
      return {
        label: "Open",
        className: "bg-green-500/10 text-green-500 border-green-500/20",
        description: "Accepting candidates, some details can still be edited",
      }
    case "closed":
      return {
        label: "Closed",
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        description: "At least 1 candidate was hired, no longer accepting candidates",
      }
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-red-500/10 text-red-500 border-red-500/20",
        description: "No candidates hired, no longer accepting candidates",
      }
    default:
      return {
        label: "Unknown",
        className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        description: "",
      }
  }
}

const getSkillMatchConfig = (percentage: number) => {
  if (percentage >= 90) {
    return {
      label: "STRONG FIT",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      description: "Your skills align excellently with this position",
    }
  }
  if (percentage >= 70) {
    return {
      label: "GOOD FIT",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      description: "Your skills match well with this position",
    }
  }
  return {
    label: "NOT FIT",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "Consider taking assessments to improve your match",
  }
}

export default function JobView({
  job,
  userRole = "candidate",
  onClose,
  onApplyForJob,
  onSaveJob,
  onUnsaveJob,
  onSendMessage,
  showApplicationStatus = false,
  onToggleApplicationView,
  onUpdateJob,
  matchedCandidates,
  onBrowseMoreCandidates,
  onOpenCandidateChat,
}: JobViewProps) {
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [isEditingSkills, setIsEditingSkills] = useState(false)
  const [editedSkills, setEditedSkills] = useState<string[]>([])
  const [newSkillInput, setNewSkillInput] = useState("")
  const [isEditingBenefits, setIsEditingBenefits] = useState(false)
  const [editedBenefits, setEditedBenefits] = useState<string[]>([])
  const [newBenefitInput, setNewBenefitInput] = useState("")
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [candidatesPage, setCandidatesPage] = useState(1) // Added pagination state
  const editorRef = useRef<HTMLDivElement>(null)
  const jobSummaryRef = useRef<HTMLDivElement>(null)

  const statusConfig = getStatusConfig(job.status || "open")
  const skillMatchConfig = job.skillMatch !== undefined ? getSkillMatchConfig(job.skillMatch) : null

  console.log("[v0] JobView rendered with showApplicationStatus:", showApplicationStatus)

  const handleEditJobSummary = () => {
    setIsEditingSummary(true)
  }

  const handleGenerateJobSummary = async () => {
    if (!job.title) return

    setIsGeneratingSummary(true)
    try {
      const response = await fetch("/api/generate-job-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate job summary")
      }

      const data = await response.json()

      if (editorRef.current && data.summary) {
        editorRef.current.innerHTML = data.summary
      }
    } catch (error) {
      console.error("[v0] Error generating job summary:", error)
      alert("Failed to generate job summary. Please try again.")
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleSaveJobSummary = () => {
    if (editorRef.current && onSaveJob) {
      const htmlContent = editorRef.current.innerHTML
      console.log("[v0] Saving job summary HTML:", htmlContent)
      onSaveJob(job.id, { ...job, jobSummary: htmlContent })
    }
    setIsEditingSummary(false)
  }

  const handleCancelEditJobSummary = () => {
    setIsEditingSummary(false)
  }

  const handleEditSkills = () => {
    setEditedSkills([...(job.qualifications || job.requirements)])
    setIsEditingSkills(true)
  }

  const handleAddSkill = () => {
    if (newSkillInput.trim()) {
      setEditedSkills([...editedSkills, newSkillInput.trim()])
      setNewSkillInput("")
    }
  }

  const handleRemoveSkill = (index: number) => {
    setEditedSkills(editedSkills.filter((_, i) => i !== index))
  }

  const handleSaveSkills = () => {
    console.log("[v0] Saving skills for job:", job.id, editedSkills)
    if (onSaveJob) {
      onSaveJob(job.id, { ...job, qualifications: editedSkills })
    }
    setIsEditingSkills(false)
  }

  const handleCancelSkillEdit = () => {
    setIsEditingSkills(false)
    setEditedSkills([])
    setNewSkillInput("")
  }

  const applyFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " && editorRef.current) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const textBeforeCursor = range.startContainer.textContent?.substring(0, range.startOffset) || ""

        if (textBeforeCursor.trim() === "-") {
          e.preventDefault()

          range.setStart(range.startContainer, 0)
          range.deleteContents()

          document.execCommand("insertUnorderedList", false)
        }
      }
    }
  }

  useEffect(() => {
    if (isEditingSummary && editorRef.current) {
      editorRef.current.innerHTML = job.jobSummary || job.description
    }
  }, [isEditingSummary])

  const renderJobSummary = (summary: string) => {
    console.log("[v0] Rendering job summary HTML:", summary)

    let formattedSummary = summary

    // Check if the content has bullet characters but no HTML list tags
    if ((summary.includes("•") || summary.includes("- ")) && !summary.includes("<ul>") && !summary.includes("<li>")) {
      // Split by bullet characters and filter out empty items
      const bulletItems = summary
        .split(/[•-]\s+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0)

      if (bulletItems.length > 1) {
        // Convert to proper HTML list
        formattedSummary = "<ul>" + bulletItems.map((item) => `<li>${item}</li>`).join("") + "</ul>"
      }
    }

    return (
      <div
        className="text-sm leading-relaxed text-muted-foreground prose prose-sm max-w-none
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:space-y-1
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_ol]:space-y-1
          [&_li]:leading-relaxed [&_li]:ml-0
          [&_strong]:font-semibold [&_strong]:text-foreground
          [&_em]:italic
          [&_u]:underline
          [&_a]:text-[#A16AE8] [&_a]:underline [&_a]:hover:text-[#8096FD]
          [&_p]:my-2
          [&_br]:block [&_br]:my-1
          [&_div]:block"
        style={{
          listStylePosition: "outside",
        }}
        dangerouslySetInnerHTML={{ __html: formattedSummary }}
      />
    )
  }

  const handleApplyClick = () => {
    console.log("[v0] Apply button clicked for job:", job.title)
    if (job.applied && onToggleApplicationView) {
      console.log("[v0] Job already applied, showing application status")
      onToggleApplicationView(true)
    } else if (onApplyForJob) {
      console.log("[v0] handleApplyForJob called for:", job.title)
      onApplyForJob(job)
    }
  }

  const handleBackToDetails = () => {
    console.log("[v0] Back to details clicked")
    if (onToggleApplicationView) {
      onToggleApplicationView(false)
    }
  }

  const handleStageClick = (stageName: string) => {
    console.log("[v0] Stage clicked:", stageName)
    if (onSendMessage) {
      onSendMessage(stageName.toLowerCase())
    }
  }

  const handleEditBenefits = () => {
    setIsEditingBenefits(true)
    setEditedBenefits(job.benefits || [])
    setNewBenefitInput("")
  }

  const handleCancelBenefitEdit = () => {
    setIsEditingBenefits(false)
    setEditedBenefits(job.benefits || [])
    setNewBenefitInput("")
  }

  const handleSaveBenefits = () => {
    // In a real app, this would call an API to update the job
    console.log("[v0] Saving benefits:", editedBenefits)
    if (onSaveJob) {
      onSaveJob(job.id, { ...job, benefits: editedBenefits })
    }
    setIsEditingBenefits(false)
    setNewBenefitInput("")
  }

  const handleAddBenefit = () => {
    if (newBenefitInput.trim()) {
      setEditedBenefits([...editedBenefits, newBenefitInput.trim()])
      setNewBenefitInput("")
    }
  }

  const handleRemoveBenefit = (index: number) => {
    setEditedBenefits(editedBenefits.filter((_, idx) => idx !== index))
  }

  const candidatesPerPage = 6
  const totalCandidates = job.matchedCandidates?.length || 0
  const totalPages = Math.ceil(totalCandidates / candidatesPerPage)
  const startIndex = (candidatesPage - 1) * candidatesPerPage
  const endIndex = startIndex + candidatesPerPage
  const paginatedCandidates = job.matchedCandidates?.slice(startIndex, endIndex) || []

  return (
    <div className="h-full overflow-auto relative">
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <div className="bg-card rounded-2xl border border-border p-8 relative">
          {userRole === "candidate" && job.saved && (
            <div className="absolute -top-2 -right-2 w-12 h-12 z-10">
              <img src="/pin.png" alt="Saved" className="w-full h-full object-contain drop-shadow-lg" />
            </div>
          )}

          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#A16AE8]/10 to-[#8096FD]/10 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                {job.logo ? (
                  <img
                    src={job.logo || "/placeholder.svg"}
                    alt={`${job.company} logo`}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-[#A16AE8]" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
                {job.companyWebsite ? (
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-[#A16AE8] hover:text-[#8096FD] transition-colors flex items-center gap-2 group"
                  >
                    {job.company}
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <p className="text-lg text-muted-foreground">{job.company}</p>
                )}
                {job.department && <p className="text-sm text-muted-foreground mt-1">Department: {job.department}</p>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-2 text-sm font-medium rounded-full border ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
              {userRole === "candidate" && (
                <>
                  {job.applied ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#A16AE8] text-white">Applied</span>
                  ) : job.saved ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#A16AE8] text-white">Saved</span>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-[#A16AE8]" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-[#A16AE8]" />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-[#A16AE8]" />
              <span>{job.salary}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[#A16AE8]" />
              <span>Posted {job.posted}</span>
            </div>
          </div>
        </div>

        {userRole === "hiring_manager" && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-[#A16AE8]" />
                <h2 className="text-lg font-semibold">Matched Candidates</h2>
                {job.matchedCandidates && job.matchedCandidates.length > 0 && (
                  <span className="px-2.5 py-1 bg-[#A16AE8] text-white text-sm font-medium rounded-full">
                    {job.matchedCandidates.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSendMessage(`browse candidates`)}
                  className="px-4 py-2 rounded-lg bg-[#A16AE8] text-white font-medium hover:bg-[#A16AE8]/90 transition-all"
                >
                  Browse Candidates
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border-2 border-[#A16AE8] text-[#A16AE8] font-medium hover:bg-[#A16AE8]/10 transition-all"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>

            {!job.matchedCandidates || job.matchedCandidates.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No matched candidates yet</p>
                <p className="text-sm text-muted-foreground">Start browsing candidates to find your perfect match</p>
              </div>
            ) : (
              <>
                <div className="space-y-0 mb-6 border border-border rounded-lg overflow-hidden">
                  {paginatedCandidates.map((candidate, index) => (
                    <div
                      key={candidate.id}
                      onClick={() => onOpenCandidateChat?.(candidate)}
                      className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-all cursor-pointer ${
                        index !== paginatedCandidates.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      {/* Profile Picture - AI Generated */}
                      <div className="relative flex-shrink-0">
                        {candidate.avatar &&
                        (candidate.avatar.startsWith("http") || candidate.avatar.startsWith("/")) ? (
                          <img
                            src={candidate.avatar || "/placeholder.svg"}
                            alt={candidate.name}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#A16AE8] to-[#8096FD] flex items-center justify-center text-white text-lg font-bold">
                            {candidate.avatar || candidate.name.charAt(0)}
                          </div>
                        )}
                        {/* Green dot for completed assessments */}
                        {candidate.aiInterviewStatus === "completed" &&
                          candidate.takeHomeChallengeStatus === "completed" && (
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                          )}
                      </div>

                      {/* Candidate Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-base truncate">{candidate.name}</h3>
                          {/* Assessment completion badges */}
                          {candidate.aiInterviewStatus === "completed" && <span className="text-xs">🎥</span>}
                          {candidate.takeHomeChallengeStatus === "completed" && <span className="text-xs">✅</span>}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {candidate.title} • {candidate.location} • {candidate.experience}
                        </p>
                      </div>

                      {/* Skill Match Score - Right Side */}
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-base font-bold text-[#A16AE8]">{candidate.skillMatch}%</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Match</span>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <button
                      onClick={() => setCandidatesPage((prev) => Math.max(1, prev - 1))}
                      disabled={candidatesPage === 1}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-[#A16AE8] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-sm font-medium">Previous</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Page {candidatesPage} of {totalPages}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({startIndex + 1}-{Math.min(endIndex, totalCandidates)} of {totalCandidates})
                      </span>
                    </div>

                    <button
                      onClick={() => setCandidatesPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={candidatesPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-[#A16AE8] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <span className="text-sm font-medium">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {showApplicationStatus && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-6">Application Status</h2>

              <div className="space-y-4">
                {/* Stage 1: Take Home Challenge */}
                <div
                  onClick={() => handleStageClick("Take Home Challenge")}
                  className="flex items-start gap-4 p-4 rounded-xl bg-accent/50 border border-border cursor-pointer hover:bg-accent/70 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#A16AE8] text-white flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Take Home Challenge</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete a practical coding challenge to demonstrate your technical skills
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                      Pending
                    </span>
                  </div>
                </div>

                {/* Stage 2: Teamified AI Interviews */}
                <div
                  onClick={() => handleStageClick("Teamified AI Interviews")}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border cursor-pointer hover:bg-accent/70 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Teamified AI Interviews</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered interview to assess your skills and cultural fit
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      Not Started
                    </span>
                  </div>
                </div>

                {/* Stage 3: Meet the hiring manager */}
                <div
                  onClick={() => handleStageClick("Meet the hiring manager")}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border cursor-pointer hover:bg-accent/70 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Meet the hiring manager!</h3>
                    <p className="text-sm text-muted-foreground">
                      Final interview with the hiring manager to discuss the role and team
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      Not Started
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className={`space-y-6 transition-opacity duration-500 ${showApplicationStatus ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}
        >
          {userRole === "candidate" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">About The Client</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {job.aboutClient ||
                  `${job.company} is a leading organization committed to innovation and excellence. We are dedicated to creating a positive impact in our industry and fostering a collaborative work environment where talented professionals can thrive and grow their careers.`}
              </p>
            </div>
          )}

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Job Summary</h2>
              {userRole === "hiring_manager" && !isEditingSummary && (
                <button
                  onClick={handleEditJobSummary}
                  className="p-2 rounded-lg hover:bg-accent transition-colors group"
                  aria-label="Edit job summary"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground group-hover:text-[#A16AE8] transition-colors" />
                </button>
              )}
            </div>

            {isEditingSummary ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1 p-2 border border-border rounded-lg bg-accent/30">
                    <button
                      onClick={() => applyFormatting("bold")}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Bold (Ctrl+B)"
                      type="button"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => applyFormatting("italic")}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Italic (Ctrl+I)"
                      type="button"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => applyFormatting("underline")}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Underline (Ctrl+U)"
                      type="button"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => applyFormatting("insertUnorderedList")}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Bullet List"
                      type="button"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const url = prompt("Enter URL:")
                        if (url) {
                          applyFormatting("createLink", url)
                        }
                      }}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Add Link"
                      type="button"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={handleGenerateJobSummary}
                    disabled={isGeneratingSummary}
                    className="absolute top-2 right-2 z-10 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border hover:bg-[#A16AE8]/10 hover:border-[#A16AE8] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    title="Generate job summary with AI"
                    type="button"
                  >
                    {isGeneratingSummary ? (
                      <Loader2 className="w-4 h-4 text-[#A16AE8] animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-[#A16AE8]" />
                    )}
                  </button>
                  <div
                    ref={editorRef}
                    contentEditable
                    onKeyDown={handleEditorKeyDown}
                    className="w-full min-h-[300px] p-4 rounded-lg border border-border bg-background text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#A16AE8] focus:border-transparent overflow-auto"
                    style={{ whiteSpace: "pre-wrap" }}
                  />
                </div>
              </div>
            ) : (
              <div ref={jobSummaryRef}>{renderJobSummary(job.jobSummary || job.description)}</div>
            )}
          </div>

          {((job.qualifications && job.qualifications.length > 0) || job.requirements.length > 0) && (
            <div className="bg-card rounded-2xl border border-border p-6">
              {isEditingSkills ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Required Skills</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {editedSkills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-[#A16AE8] flex-shrink-0" />
                          <span className="flex-1 text-sm">{skill}</span>
                          <button
                            onClick={() => handleRemoveSkill(idx)}
                            className="p-1 hover:bg-destructive/10 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddSkill()
                          }
                        }}
                        placeholder="Add a new skill requirement..."
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                      />
                      <button
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-[#A16AE8] text-white rounded-lg hover:bg-[#8f5cd4] transition-colors text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-border">
                      <button
                        onClick={handleCancelSkillEdit}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSkills}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex gap-6">
                  <div className={userRole === "hiring_manager" ? "flex-1" : "flex-[7]"}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold">Required Skills</h2>
                      {userRole === "hiring_manager" && (
                        <button
                          onClick={handleEditSkills}
                          className="p-2 rounded-lg hover:bg-accent transition-colors group"
                          aria-label="Edit skills"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground group-hover:text-[#A16AE8] transition-colors" />
                        </button>
                      )}
                    </div>
                    <ul className="space-y-3">
                      {(job.qualifications || job.requirements).map((req, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <CheckCircle2 className="w-5 h-5 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {job.skillMatch !== undefined && userRole === "candidate" && (
                    <div className="w-px bg-border flex-shrink-0" />
                  )}

                  {job.skillMatch !== undefined && userRole === "candidate" && (
                    <div className="flex-[3] flex flex-col items-center justify-center text-center space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`text-5xl font-bold ${skillMatchConfig?.color}`}>{job.skillMatch}%</div>
                      </div>
                      <div className={`text-lg font-semibold ${skillMatchConfig?.color}`}>
                        {skillMatchConfig?.label}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{skillMatchConfig?.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6">
              {isEditingBenefits ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Benefits</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {editedBenefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="flex-1 text-sm">{benefit}</span>
                          <button
                            onClick={() => handleRemoveBenefit(idx)}
                            className="p-1 hover:bg-destructive/10 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newBenefitInput}
                        onChange={(e) => setNewBenefitInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddBenefit()
                          }
                        }}
                        placeholder="Add a new benefit..."
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                      />
                      <button
                        onClick={handleAddBenefit}
                        className="px-4 py-2 bg-[#A16AE8] text-white rounded-lg hover:bg-[#8f5cd4] transition-colors text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-border">
                      <button
                        onClick={handleCancelBenefitEdit}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveBenefits}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Benefits</h2>
                    {userRole === "hiring_manager" && (
                      <button
                        onClick={handleEditBenefits}
                        className="p-2 rounded-lg hover:bg-accent transition-colors group"
                        aria-label="Edit benefits"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground group-hover:text-[#A16AE8] transition-colors" />
                      </button>
                    )}
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {job.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        {userRole === "candidate" && !showApplicationStatus && (
          <div className="flex gap-4">
            <button
              onClick={handleApplyClick}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-semibold hover:shadow-lg transition-all"
            >
              {job.applied ? "View Application" : "Submit Application"}
            </button>
            {!job.saved && onSaveJob && (
              <button
                onClick={() => onSaveJob(job.id, { ...job, saved: true })}
                className="px-6 py-3 rounded-xl border-2 border-[#A16AE8] text-[#A16AE8] font-semibold hover:bg-[#A16AE8]/10 transition-all"
              >
                Save Job
              </button>
            )}
            {job.saved && onUnsaveJob && (
              <button
                onClick={() => onUnsaveJob(job.id)}
                className="px-6 py-3 rounded-xl border-2 border-[#A16AE8] text-[#A16AE8] font-semibold hover:bg-[#A16AE8]/10 transition-all"
              >
                Unsave Job
              </button>
            )}
          </div>
        )}

        {userRole === "candidate" && showApplicationStatus && (
          <button
            onClick={handleBackToDetails}
            className="w-full px-6 py-3 rounded-xl border-2 border-[#A16AE8] text-[#A16AE8] font-semibold hover:bg-[#A16AE8]/10 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Job Details
          </button>
        )}

        {isEditingSummary && (
          <div className="flex gap-4 sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border">
            <button
              onClick={handleCancelEditJobSummary}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-border hover:bg-muted transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveJobSummary}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-semibold hover:shadow-lg transition-all"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export { JobView }
