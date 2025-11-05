"use client"

import { useState } from "react"
import {
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  FileText,
  Video,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Play,
  CheckIcon,
  Copy,
  LinkIcon,
  Clock,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CandidateProfile } from "@/types/workspace"

interface CandidateProfileViewProps {
  candidate: CandidateProfile
  showSwipeButtons?: boolean // Added prop to conditionally show swipe buttons
  onSwipe?: (candidate: CandidateProfile, direction: "left" | "right") => void // Added swipe callback
}

export function CandidateProfileView({ candidate, showSwipeButtons = false, onSwipe }: CandidateProfileViewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["interview", "challenge", "skills"]))
  const [copiedRepo, setCopiedRepo] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)

  const handleSwipeLeft = () => {
    setSwipeDirection("left")
    setTimeout(() => {
      if (onSwipe) {
        onSwipe(candidate, "left")
      }
      setSwipeDirection(null)
    }, 400)
  }

  const handleSwipeRight = () => {
    setSwipeDirection("right")
    setTimeout(() => {
      if (onSwipe) {
        onSwipe(candidate, "right")
      }
      setSwipeDirection(null)
    }, 400)
  }

  const getCardTransform = () => {
    if (swipeDirection === "left") {
      return "translateX(-120%) rotate(-10deg)"
    }
    if (swipeDirection === "right") {
      return "translateX(120%) rotate(10deg)"
    }
    return "translateX(0) rotate(0deg)"
  }

  const getCardOpacity = () => {
    if (swipeDirection) return 0
    return 1
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedRepo(true)
      setTimeout(() => setCopiedRepo(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="h-full overflow-auto">
      <div
        className="max-w-4xl mx-auto px-6 pt-6 space-y-6"
        style={{
          transform: getCardTransform(),
          transition: swipeDirection ? "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out" : "none",
          opacity: getCardOpacity(),
        }}
      >
        {/* Candidate Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-[#A16AE8]/10 to-[#8096FD]/10 py-4 px-6">
            <div className="flex items-start justify-between gap-6 mb-4">
              <div className="flex items-start gap-6 flex-1">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#A16AE8] to-[#8096FD] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {candidate.avatar ? (
                    <img
                      src={candidate.avatar || "/placeholder.svg"}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    candidate.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{candidate.name}</h2>
                  <p className="text-lg text-muted-foreground mb-2">{candidate.title}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#A16AE8]" />
                      <span>{candidate.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#A16AE8]" />
                      <span>{candidate.experience}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <div className="flex flex-col items-center">
                  <div className={`text-5xl font-bold ${getSkillMatchColor(candidate.skillMatch)}`}>
                    {candidate.skillMatch}%
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground">SKILL MATCH</div>
                </div>
                {showSwipeButtons && (
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleSwipeLeft}
                      size="lg"
                      variant="outline"
                      className="w-14 h-14 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all bg-transparent"
                    >
                      <X className="w-7 h-7" />
                    </Button>
                    <Button
                      onClick={handleSwipeRight}
                      size="lg"
                      className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 transition-all"
                    >
                      <CheckIcon className="w-7 h-7" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-wrap gap-4 text-sm">
              <a
                href={`mailto:${candidate.email}`}
                className="flex items-center gap-2 text-[#A16AE8] hover:text-[#8096FD]"
              >
                <Mail className="w-4 h-4" />
                {candidate.email}
              </a>
              {candidate.phone && (
                <a
                  href={`tel:${candidate.phone}`}
                  className="flex items-center gap-2 text-[#A16AE8] hover:text-[#8096FD]"
                >
                  <Phone className="w-4 h-4" />
                  {candidate.phone}
                </a>
              )}
              {candidate.linkedin && (
                <a
                  href={candidate.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#A16AE8] hover:text-[#8096FD]"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {candidate.github && (
                <a
                  href={candidate.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#A16AE8] hover:text-[#8096FD]"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {candidate.portfolio && (
                <a
                  href={candidate.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#A16AE8] hover:text-[#8096FD]"
                >
                  <Globe className="w-4 h-4" />
                  Portfolio
                </a>
              )}
              <span className="text-muted-foreground">|</span>
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#A16AE8] hover:text-[#8096FD] font-medium"
              >
                <FileText className="w-4 h-4" />
                View Full Resume
              </a>
            </div>
          </div>

          {/* AI Interview */}
          <div className="py-3 px-6 border-b border-border">
            <button
              onClick={() => toggleSection("interview")}
              className="w-full flex items-center justify-between mb-3"
            >
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#A16AE8]" />
                <h3 className="text-lg font-semibold">AI Interview Video</h3>
              </div>
              <div className="flex items-center gap-2">
                {expandedSections.has("interview") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log("[v0] View transcript clicked")
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-[#A16AE8] hover:text-[#8096FD] hover:bg-[#A16AE8]/10 rounded-lg transition-colors"
                  >
                    View Transcript
                  </button>
                )}
                {expandedSections.has("interview") ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>
            {expandedSections.has("interview") && (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#A16AE8]/20 to-[#8096FD]/20">
                    <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-white transition-colors">
                      <Play className="w-10 h-10 text-[#A16AE8] ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Clock className="w-4 h-4" />
                      <span>15:32</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Interview Summary</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {candidate.name} demonstrated strong technical knowledge and problem-solving skills during the AI
                    interview. They articulated their experience clearly and showed enthusiasm for the role.
                    Communication was excellent, with thoughtful responses to behavioral questions.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Take Home Challenge */}
          <div className="p-6 border-b border-border">
            <button
              onClick={() => toggleSection("challenge")}
              className="w-full flex items-center justify-between mb-3"
            >
              <h3 className="text-lg font-semibold">Take Home Challenge</h3>
              {expandedSections.has("challenge") ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {expandedSections.has("challenge") && (
              <div className="space-y-4">
                {/* GitHub Repository */}
                {candidate.githubRepo && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium">GitHub Repository</span>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Repository</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm font-mono">
                            {candidate.githubRepo.replace("https://github.com/", "")}
                          </div>
                          <button
                            onClick={() => copyToClipboard(candidate.githubRepo!)}
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                            title="Copy repository URL"
                          >
                            {copiedRepo ? (
                              <CheckIcon className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                      <a
                        href={candidate.githubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[#A16AE8] hover:text-[#8096FD] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in GitHub
                      </a>
                    </div>
                  </div>
                )}

                {/* Submission Files */}
                {candidate.submissionFiles && candidate.submissionFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Submission Files
                    </h4>
                    <div className="space-y-2">
                      {candidate.submissionFiles.map((file, index) => (
                        <a
                          key={index}
                          href={file.url}
                          download
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#A16AE8]/20 to-[#8096FD]/20 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-[#A16AE8]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              {file.size && <p className="text-xs text-muted-foreground">{file.size}</p>}
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-[#A16AE8] transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submission Links */}
                {candidate.submissionLinks && candidate.submissionLinks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Submission Links
                    </h4>
                    <div className="space-y-2">
                      {candidate.submissionLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-sm group"
                        >
                          <ExternalLink className="w-4 h-4 text-[#A16AE8] flex-shrink-0" />
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors truncate">
                            {link}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Feedback */}
                {candidate.codeReviewPoints && candidate.codeReviewPoints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#A16AE8]" />
                      AI Feedback
                    </h4>
                    <div className="bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5 rounded-lg p-4 border border-[#A16AE8]/20">
                      <ul className="space-y-2">
                        {candidate.codeReviewPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-[#A16AE8] mt-1">•</span>
                            <span className="flex-1">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold mb-3">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{candidate.summary}</p>
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
              <div className="grid grid-cols-5 gap-4">
                {candidate.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2 p-3 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/20 dark:to-transparent rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                  >
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-4Xpn6mVs4otlfis8QuotoknlHJdr3x.png"
                      alt="Skill Badge"
                      className="w-16 h-16 object-contain"
                    />
                    <span className="text-sm font-semibold text-center text-foreground leading-tight">{skill}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
