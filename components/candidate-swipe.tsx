"use client"

import { useState } from "react"
import {
  Heart,
  X,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  FileText,
  Video,
  Code,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react"
import type { CandidateProfile } from "@/types/workspace"
import { Button } from "@/components/ui/button"

interface CandidateSwipeProps {
  candidates: CandidateProfile[]
  jobTitle: string
  onSwipeLeft: (candidate: CandidateProfile) => void
  onSwipeRight: (candidate: CandidateProfile) => void
  onBackToJobs: () => void
}

export function CandidateSwipe({ candidates, jobTitle, onSwipeLeft, onSwipeRight, onBackToJobs }: CandidateSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["skills", "insights", "challenge", "interview"]),
  )

  const currentCandidate = candidates[currentIndex]

  if (!currentCandidate) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A16AE8] to-[#8096FD] flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No More Candidates</h2>
        <p className="text-muted-foreground mb-6">You've reviewed all candidates for this position</p>
        <Button onClick={onBackToJobs} className="bg-gradient-to-r from-[#A16AE8] to-[#8096FD]">
          Back to My Jobs
        </Button>
      </div>
    )
  }

  const handleSwipeLeft = () => {
    onSwipeLeft(currentCandidate)
    setCurrentIndex((prev) => prev + 1)
  }

  const handleSwipeRight = () => {
    onSwipeRight(currentCandidate)
    setCurrentIndex((prev) => prev + 1)
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const getSkillMatchColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 75) return "text-amber-500"
    return "text-red-500"
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500"
    if (score >= 70) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBackToJobs}
              className="text-sm text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1"
            >
              ← Back to My Jobs
            </button>
            <h1 className="text-2xl font-bold">Candidates for {jobTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} of {candidates.length}
            </p>
          </div>
        </div>

        {/* Candidate Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-[#A16AE8]/10 to-[#8096FD]/10 p-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A16AE8] to-[#8096FD] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {currentCandidate.avatar || currentCandidate.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{currentCandidate.name}</h2>
                <p className="text-xl text-muted-foreground mb-3">{currentCandidate.title}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#A16AE8]" />
                    <span>{currentCandidate.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#A16AE8]" />
                    <span>{currentCandidate.experience}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`text-5xl font-bold ${getSkillMatchColor(currentCandidate.skillMatch)}`}>
                  {currentCandidate.skillMatch}%
                </div>
                <div className="text-sm font-semibold text-muted-foreground">SKILL MATCH</div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-wrap gap-4 text-sm">
              <a
                href={`mailto:${currentCandidate.email}`}
                className="flex items-center gap-2 text-[#A16AE8] hover:text-[#8096FD]"
              >
                <Mail className="w-4 h-4" />
                {currentCandidate.email}
              </a>
              {currentCandidate.phone && (
                <a
                  href={`tel:${currentCandidate.phone}`}
                  className="flex items-center gap-2 text-[#A16AE8] hover:text-[#8096FD]"
                >
                  <Phone className="w-4 h-4" />
                  {currentCandidate.phone}
                </a>
              )}
              {currentCandidate.linkedin && (
                <a
                  href={currentCandidate.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#A16AE8] hover:text-[#8096FD]"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {currentCandidate.github && (
                <a
                  href={currentCandidate.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#A16AE8] hover:text-[#8096FD]"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {currentCandidate.portfolio && (
                <a
                  href={currentCandidate.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#A16AE8] hover:text-[#8096FD]"
                >
                  <Globe className="w-4 h-4" />
                  Portfolio
                </a>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold mb-3">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{currentCandidate.summary}</p>
          </div>

          {/* Skills */}
          <div className="p-6 border-b border-border">
            <button onClick={() => toggleSection("skills")} className="w-full flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Skills</h3>
              {expandedSections.has("skills") ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {expandedSections.has("skills") && (
              <div className="flex flex-wrap gap-2">
                {currentCandidate.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-[#A16AE8]/10 text-[#A16AE8] rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI Generated Insights */}
          <div className="p-6 border-b border-border">
            <button onClick={() => toggleSection("insights")} className="w-full flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#A16AE8]" />
                <h3 className="text-lg font-semibold">AI Generated Insights</h3>
              </div>
              {expandedSections.has("insights") ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {expandedSections.has("insights") && (
              <ul className="space-y-2">
                {currentCandidate.aiGeneratedInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <TrendingUp className="w-4 h-4 text-[#A16AE8] flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{insight}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Take Home Challenge */}
          <div className="p-6 border-b border-border">
            <button
              onClick={() => toggleSection("challenge")}
              className="w-full flex items-center justify-between mb-3"
            >
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-[#A16AE8]" />
                <h3 className="text-lg font-semibold">Take Home Challenge</h3>
              </div>
              {expandedSections.has("challenge") ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {expandedSections.has("challenge") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      currentCandidate.takeHomeChallengeStatus === "completed"
                        ? "bg-green-500/10 text-green-500"
                        : currentCandidate.takeHomeChallengeStatus === "pending"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-gray-500/10 text-gray-500"
                    }`}
                  >
                    {currentCandidate.takeHomeChallengeStatus.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                {currentCandidate.takeHomeChallengeScore !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Score:</span>
                    <span className={`text-2xl font-bold ${getScoreColor(currentCandidate.takeHomeChallengeScore)}`}>
                      {currentCandidate.takeHomeChallengeScore}/100
                    </span>
                  </div>
                )}
                {currentCandidate.takeHomeChallengeSubmission && (
                  <a
                    href={currentCandidate.takeHomeChallengeSubmission}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#A16AE8] hover:text-[#8096FD] text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Submission
                  </a>
                )}
                {currentCandidate.takeHomeChallengeNotes && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">{currentCandidate.takeHomeChallengeNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Interview */}
          <div className="p-6 border-b border-border">
            <button
              onClick={() => toggleSection("interview")}
              className="w-full flex items-center justify-between mb-3"
            >
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#A16AE8]" />
                <h3 className="text-lg font-semibold">AI Interview</h3>
              </div>
              {expandedSections.has("interview") ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {expandedSections.has("interview") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      currentCandidate.aiInterviewStatus === "completed"
                        ? "bg-green-500/10 text-green-500"
                        : currentCandidate.aiInterviewStatus === "pending"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-gray-500/10 text-gray-500"
                    }`}
                  >
                    {currentCandidate.aiInterviewStatus.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                {currentCandidate.aiInterviewScore !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Score:</span>
                    <span className={`text-2xl font-bold ${getScoreColor(currentCandidate.aiInterviewScore)}`}>
                      {currentCandidate.aiInterviewScore}/100
                    </span>
                  </div>
                )}
                {currentCandidate.aiInterviewRecordingUrl && (
                  <a
                    href={currentCandidate.aiInterviewRecordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#A16AE8] hover:text-[#8096FD] text-sm"
                  >
                    <Video className="w-4 h-4" />
                    Watch Recording
                  </a>
                )}
                {currentCandidate.aiInterviewTranscript && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg max-h-40 overflow-y-auto">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {currentCandidate.aiInterviewTranscript}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resume */}
          {currentCandidate.resumeUrl && (
            <div className="p-6">
              <a
                href={currentCandidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[#A16AE8] text-[#A16AE8] rounded-xl hover:bg-[#A16AE8]/10 transition-colors font-medium"
              >
                <FileText className="w-5 h-5" />
                View Full Resume
              </a>
            </div>
          )}
        </div>

        {/* Swipe Actions */}
        <div className="flex items-center justify-center gap-6 pb-6">
          <Button
            onClick={handleSwipeLeft}
            size="lg"
            variant="outline"
            className="w-20 h-20 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all bg-transparent"
          >
            <X className="w-10 h-10" />
          </Button>
          <Button
            onClick={handleSwipeRight}
            size="lg"
            className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all"
          >
            <Heart className="w-10 h-10" />
          </Button>
        </div>
      </div>
    </div>
  )
}
