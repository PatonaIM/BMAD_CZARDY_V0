"use client"

import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Building2,
  Calendar,
  User,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react"
import type { JobListing, JobStatus } from "@/types/workspace"

interface JobViewProps {
  job: JobListing
  onBack?: () => void // Added onBack callback prop
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

export function JobView({ job, onBack }: JobViewProps) {
  const statusConfig = getStatusConfig(job.status || "open")

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-accent transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Job Board
          </button>
        )}

        {/* Header Section */}
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
                <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
                <p className="text-lg text-muted-foreground">{job.company}</p>
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

        {/* Status Description */}
        {statusConfig.description && (
          <div className="bg-muted/50 rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">{statusConfig.description}</p>
          </div>
        )}

        {/* Job Description */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Job Description</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{job.description}</p>
        </div>

        {/* Key Qualifications */}
        {job.qualifications && job.qualifications.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Key Qualifications</h2>
            <ul className="space-y-3">
              {job.qualifications.map((qual, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{qual}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements (fallback if no qualifications) */}
        {(!job.qualifications || job.qualifications.length === 0) && job.requirements.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Requirements</h2>
            <ul className="space-y-3">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Responsibilities</h2>
            <ul className="space-y-3">
              {job.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#A16AE8] flex-shrink-0 mt-2" />
                  <span className="text-muted-foreground">{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Benefits</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {job.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Information */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {job.department && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Department</p>
                <p className="text-sm">{job.department}</p>
              </div>
            )}
            {job.reportingTo && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Reporting To</p>
                <p className="text-sm">{job.reportingTo}</p>
              </div>
            )}
            {job.teamSize && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Team Size</p>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#A16AE8]" />
                  <p className="text-sm">{job.teamSize}</p>
                </div>
              </div>
            )}
            {job.workArrangement && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Work Arrangement</p>
                <p className="text-sm">{job.workArrangement}</p>
              </div>
            )}
            {job.hiringManager && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Hiring Manager</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#A16AE8]" />
                  <p className="text-sm">{job.hiringManager}</p>
                </div>
              </div>
            )}
            {job.applicationDeadline && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Application Deadline</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#A16AE8]" />
                  <p className="text-sm">{job.applicationDeadline}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons (only show for open positions) */}
        {job.status === "open" && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all">
                {job.applied ? "View Application" : "Apply for this Position"}
              </button>
              <button className="px-6 py-3 rounded-xl border border-border hover:bg-accent transition-colors font-medium">
                Save Job
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
