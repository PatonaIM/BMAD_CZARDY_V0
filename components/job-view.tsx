"use client"

import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  BookOpen,
  Target,
  Sparkles,
} from "lucide-react"
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

const generateSkillGapInsights = (matchPercentage: number) => {
  if (matchPercentage >= 90) {
    return {
      title: "Excellent Match!",
      description: "You're an outstanding fit for this role. Consider these areas to stand out even more:",
      gaps: [
        "Advanced certifications in your field",
        "Leadership or mentorship experience",
        "Contributions to open-source projects or industry publications",
      ],
      recommendations: [
        {
          title: "Advanced Technical Certification",
          description: "Earn industry-recognized certifications to validate your expertise",
        },
        { title: "Leadership Training", description: "Develop management and team leadership skills" },
      ],
    }
  } else if (matchPercentage >= 70) {
    return {
      title: "Good Match with Room for Growth",
      description: "You have a solid foundation. Focus on these areas to increase your match score:",
      gaps: [
        "Some required technical skills need strengthening",
        "Additional years of experience in specific technologies",
        "Certifications or formal training in key areas",
      ],
      recommendations: [
        {
          title: "Technical Skills Assessment",
          description: "Take targeted assessments to identify and improve specific skill gaps",
        },
        {
          title: "Online Courses & Bootcamps",
          description: "Complete focused training in the technologies mentioned in the job requirements",
        },
        { title: "Practice Projects", description: "Build portfolio projects demonstrating the required skills" },
      ],
    }
  } else {
    return {
      title: "Significant Skill Gaps Identified",
      description: "This role requires skills you may need to develop. Here's how to improve your match:",
      gaps: [
        "Multiple core technical skills are missing",
        "Insufficient experience level for this position",
        "Lack of required certifications or qualifications",
      ],
      recommendations: [
        {
          title: "Comprehensive Skills Training",
          description: "Enroll in structured learning programs to build foundational skills",
        },
        {
          title: "Entry-Level Positions",
          description: "Consider similar roles with lower requirements to gain experience",
        },
        {
          title: "Mentorship Program",
          description: "Connect with experienced professionals in this field for guidance",
        },
        {
          title: "Certification Programs",
          description: "Pursue relevant certifications to demonstrate commitment and knowledge",
        },
      ],
    }
  }
}

export function JobView({ job, onBack }: JobViewProps) {
  const statusConfig = getStatusConfig(job.status || "open")
  const skillMatchConfig = job.skillMatch !== undefined ? getSkillMatchConfig(job.skillMatch) : null
  const skillGapInsights = job.skillMatch !== undefined ? generateSkillGapInsights(job.skillMatch) : null

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
        <div className="bg-card rounded-2xl border border-border p-8 relative">
          {/* Pin overlay for saved jobs */}
          {job.saved && (
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
              {job.applied ? (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#A16AE8] text-white">Applied</span>
              ) : job.saved ? (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#A16AE8] text-white">Saved</span>
              ) : null}
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
                  <div className={`text-5xl font-bold ${skillMatchConfig?.color}`}>{job.skillMatch}%</div>
                  <div className={`text-lg font-semibold ${skillMatchConfig?.color}`}>{skillMatchConfig?.label}</div>
                  <p className="text-xs text-muted-foreground mt-2">{skillMatchConfig?.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skill Gap Analysis section */}
        {skillGapInsights && job.skillMatch !== undefined && job.skillMatch < 100 && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A16AE8]/10 to-[#8096FD]/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#A16AE8]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{skillGapInsights.title}</h2>
                <p className="text-sm text-muted-foreground">{skillGapInsights.description}</p>
              </div>
            </div>

            {/* Identified Gaps */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {skillGapInsights.gaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                    <span className="text-muted-foreground">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#A16AE8]" />
                Recommended Actions
              </h3>
              <div className="grid gap-3">
                {skillGapInsights.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border hover:border-[#A16AE8]/30 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistance CTA */}
            <div className="pt-4 border-t border-border">
              <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#A16AE8]/10 to-[#8096FD]/10 border border-[#A16AE8]/30 hover:from-[#A16AE8]/20 hover:to-[#8096FD]/20 transition-all group">
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#A16AE8] group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-foreground">
                    Ask Technical Recruiter AI for Personalized Insights
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Get customized training recommendations and career guidance
                </p>
              </button>
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
            <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all">
              {job.applied ? "View Application" : "Apply for this Position"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
