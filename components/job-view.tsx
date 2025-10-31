"use client"

import { Briefcase, MapPin, DollarSign, Clock, Building2, CheckCircle2, ExternalLink } from "lucide-react"
import type { JobListing, JobStatus } from "@/types/workspace"

interface JobViewProps {
  job: JobListing
  onBack?: () => void
}

const getStatusConfig = (status: JobStatus) => {
  switch (status) {
    case "draft":
      return {
        label: "Draft",
        className: "bg-muted text-muted-foreground border-border",
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

export function JobView({ job, onBack }: JobViewProps) {
  const statusConfig = getStatusConfig(job.status || "open")

  const renderJobSummary = (summary: string) => {
    // Check if the summary contains bullet points (lines starting with •)
    const lines = summary.split("\n").filter((line) => line.trim())
    const hasBullets = lines.some((line) => line.trim().startsWith("•"))

    if (hasBullets) {
      return (
        <ul className="space-y-3">
          {lines.map((line, idx) => {
            const text = line.trim().replace(/^•\s*/, "")
            return (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#A16AE8] flex-shrink-0 mt-2" />
                <span className="text-muted-foreground">{text}</span>
              </li>
            )
          })}
        </ul>
      )
    }

    return <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
  }

  return (
    <div className="h-full overflow-auto relative">
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header with Status */}
        <div className="bg-card rounded-2xl border border-border p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#A16AE8]/10 to-[#8096FD]/10 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                {job.logo ? (
                  <img
                    src={job.logo || "/placeholder.svg"}
                    alt={`${job.company} logo`}
                    className="w-full h-full object-cover"
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
              {job.openings && <span className="text-sm text-muted-foreground">{job.openings} opening(s)</span>}
            </div>
          </div>

          {/* Quick Info Grid */}
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

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">About The Client</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {job.aboutClient ||
              `${job.company} is a leading organization committed to innovation and excellence. We are dedicated to creating a positive impact in our industry and fostering a collaborative work environment where talented professionals can thrive and grow their careers.`}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Job Summary</h2>
          {renderJobSummary(job.jobSummary || job.description)}
        </div>

        {((job.qualifications && job.qualifications.length > 0) || job.requirements.length > 0) && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-6">Required Skills</h2>

            <div className="flex gap-6">
              {/* Left Pane - Skills List (70%) */}
              <div className="flex-[7]">
                <ul className="space-y-3">
                  {(job.qualifications || job.requirements).map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vertical Divider */}
              {job.skillMatch !== undefined && <div className="w-px bg-border flex-shrink-0" />}

              {/* Right Pane - Skill Match Score (30%) */}
              {job.skillMatch !== undefined && (
                <div className="flex-[3] flex flex-col items-center justify-center text-center space-y-2">
                  <div className={`text-5xl font-bold ${getSkillMatchConfig(job.skillMatch).color}`}>
                    {job.skillMatch}%
                  </div>
                  <div className={`text-lg font-semibold ${getSkillMatchConfig(job.skillMatch).color}`}>
                    {getSkillMatchConfig(job.skillMatch).label}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {getSkillMatchConfig(job.skillMatch).description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Benefits</h2>
          {job.benefits && job.benefits.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {job.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No benefits information available for this position.</p>
          )}
        </div>

        {/* Action Buttons (only show for open positions) */}
        {job.status === "open" && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all">
                {job.applied ? "View Application" : "Apply for this Position"}
              </button>
              <button className="px-6 py-3 rounded-xl border border-border hover:bg-accent transition-colors font-medium">
                {job.saved ? "Unsave Job" : "Save Job"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
