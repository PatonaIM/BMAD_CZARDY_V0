"use client"

import type { JobListing } from "@/types/workspace"
import { Building2, MapPin, DollarSign, Clock, Users, Briefcase } from "lucide-react"

interface JobComparisonProps {
  jobs: JobListing[]
}

export function JobComparison({ jobs }: JobComparisonProps) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No jobs to compare</p>
          <p className="text-sm text-muted-foreground">Ask me to compare specific jobs from your list</p>
        </div>
      </div>
    )
  }

  const comparisonFields = [
    { label: "Company", icon: Building2, key: "company" },
    { label: "Location", icon: MapPin, key: "location" },
    { label: "Salary", icon: DollarSign, key: "salary" },
    { label: "Type", icon: Briefcase, key: "type" },
    { label: "Posted", icon: Clock, key: "posted" },
    { label: "Team Size", icon: Users, key: "teamSize" },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Job Comparison</h2>
          <p className="text-muted-foreground">Compare key details across {jobs.length} positions</p>
        </div>

        {/* Job Titles Header */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${jobs.length}, 1fr)` }}>
          <div className="font-semibold text-muted-foreground">Position</div>
          {jobs.map((job) => (
            <div key={job.id} className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
              {job.skillMatch && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD]"
                      style={{ width: `${job.skillMatch}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground">{job.skillMatch}% match</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison Fields */}
        <div className="space-y-3">
          {comparisonFields.map((field) => {
            const Icon = field.icon
            return (
              <div
                key={field.key}
                className="grid gap-4 items-center"
                style={{ gridTemplateColumns: `200px repeat(${jobs.length}, 1fr)` }}
              >
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Icon className="w-4 h-4" />
                  {field.label}
                </div>
                {jobs.map((job) => (
                  <div key={job.id} className="bg-muted/30 rounded-lg p-3 text-sm">
                    {job[field.key as keyof JobListing] || "N/A"}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Requirements Comparison */}
        <div className="space-y-3">
          <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${jobs.length}, 1fr)` }}>
            <div className="text-sm font-medium text-muted-foreground">Key Requirements</div>
            {jobs.map((job) => (
              <div key={job.id} className="bg-muted/30 rounded-lg p-3">
                <ul className="space-y-1 text-sm">
                  {job.requirements?.slice(0, 3).map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#A16AE8] mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                  {job.requirements && job.requirements.length > 3 && (
                    <li className="text-muted-foreground text-xs">+{job.requirements.length - 3} more</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Comparison */}
        {jobs.some((job) => job.benefits && job.benefits.length > 0) && (
          <div className="space-y-3">
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${jobs.length}, 1fr)` }}>
              <div className="text-sm font-medium text-muted-foreground">Benefits</div>
              {jobs.map((job) => (
                <div key={job.id} className="bg-muted/30 rounded-lg p-3">
                  <ul className="space-y-1 text-sm">
                    {job.benefits?.slice(0, 3).map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#8096FD] mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                    {job.benefits && job.benefits.length > 3 && (
                      <li className="text-muted-foreground text-xs">+{job.benefits.length - 3} more</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
