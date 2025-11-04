"use client"

import { useState, useEffect } from "react"
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
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Play,
  CheckIcon,
  Copy,
  LinkIcon,
  Clock,
} from "lucide-react"
import type { CandidateProfile } from "@/types/workspace"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

interface CandidateSwipeProps {
  candidates: CandidateProfile[]
  jobTitle: string
  onAccept: (candidate: CandidateProfile) => void
  onReject: (candidate: CandidateProfile) => void
  onSendMessage: () => void
  onCandidateShown?: (candidate: CandidateProfile) => void // Added callback for when candidate is shown
}

export function CandidateSwipe({
  candidates,
  jobTitle,
  onAccept,
  onReject,
  onSendMessage,
  onCandidateShown,
}: CandidateSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["interview", "challenge", "skills", "insights"]),
  )
  const [copiedRepo, setCopiedRepo] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [isShowingNewCard, setIsShowingNewCard] = useState(false)

  const currentCandidate = candidates[currentIndex]

  useEffect(() => {
    if (currentCandidate && onCandidateShown && !swipeDirection) {
      // Trigger after fade-in animation completes
      const timer = setTimeout(() => {
        onCandidateShown(currentCandidate)
      }, 400) // Match fade-in duration

      return () => clearTimeout(timer)
    }
  }, [currentIndex, currentCandidate, onCandidateShown, swipeDirection])

  if (!currentCandidate) {
    return (
      <div className="h-full flex items-center justify-center">
        <Heart className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No More Candidates</h2>
        <p className="text-muted-foreground mb-6">You've reviewed all candidates for this position</p>
      </div>
    )
  }

  const handleSwipeLeft = () => {
    setSwipeDirection("left")
    setTimeout(() => {
      onReject(currentCandidate)
      setSwipeDirection(null)
      setIsShowingNewCard(true)
      setCurrentIndex((prev) => prev + 1)
      setTimeout(() => {
        setIsShowingNewCard(false)
      }, 50)
    }, 400)
  }

  const handleSwipeRight = () => {
    setSwipeDirection("right")
    setTimeout(() => {
      onAccept(currentCandidate)
      setSwipeDirection(null)
      setIsShowingNewCard(true)
      setCurrentIndex((prev) => prev + 1)
      setTimeout(() => {
        setIsShowingNewCard(false)
      }, 50)
    }, 400)
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedRepo(true)
      setTimeout(() => setCopiedRepo(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
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
    if (swipeDirection) return 0.8
    if (isShowingNewCard) return 0
    return 1
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto px-6 pt-6 space-y-6">
        {/* Candidate Card */}
        <div
          key={currentIndex}
          className="bg-card rounded-2xl border border-border overflow-hidden"
          style={{
            transform: getCardTransform(),
            transition: swipeDirection
              ? "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out"
              : "opacity 0.3s ease-out",
            opacity: getCardOpacity(),
          }}
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-[#A16AE8]/10 to-[#8096FD]/10 p-6">
            <div className="flex items-start justify-between gap-6 mb-4">
              <div className="flex items-start gap-6 flex-1">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#A16AE8] to-[#8096FD] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {currentCandidate.avatar ? (
                    <img
                      src={currentCandidate.avatar || "/placeholder.svg"}
                      alt={currentCandidate.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentCandidate.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{currentCandidate.name}</h2>
                  <p className="text-lg text-muted-foreground mb-2">{currentCandidate.title}</p>
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
              </div>
              <div className="flex flex-col items-end gap-4">
                <div className="flex flex-col items-center">
                  <div className={`text-5xl font-bold ${getSkillMatchColor(currentCandidate.skillMatch)}`}>
                    {currentCandidate.skillMatch}%
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground">SKILL MATCH</div>
                </div>
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
              <span className="text-muted-foreground">|</span>
              <a
                href={currentCandidate.resumeUrl}
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
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    currentCandidate.aiInterviewStatus === "completed"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : currentCandidate.aiInterviewStatus === "pending"
                        ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                  }`}
                >
                  {currentCandidate.aiInterviewStatus === "completed"
                    ? "Completed"
                    : currentCandidate.aiInterviewStatus === "pending"
                      ? "Pending"
                      : "Not Started"}
                </Badge>
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
                    {currentCandidate.name} demonstrated strong technical knowledge and problem-solving skills during
                    the AI interview. They articulated their experience clearly and showed enthusiasm for the role.
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
                {currentCandidate.githubRepo && (
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
                            {currentCandidate.githubRepo.replace("https://github.com/", "")}
                          </div>
                          <button
                            onClick={() => copyToClipboard(currentCandidate.githubRepo!)}
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
                        href={currentCandidate.githubRepo}
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
                {currentCandidate.submissionFiles && currentCandidate.submissionFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Submission Files
                    </h4>
                    <div className="space-y-2">
                      {currentCandidate.submissionFiles.map((file, index) => (
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
                {currentCandidate.submissionLinks && currentCandidate.submissionLinks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Submission Links
                    </h4>
                    <div className="space-y-2">
                      {currentCandidate.submissionLinks.map((link, index) => (
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
                {currentCandidate.codeReviewPoints && currentCandidate.codeReviewPoints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#A16AE8]" />
                      AI Feedback
                    </h4>
                    <div className="bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5 rounded-lg p-4 border border-[#A16AE8]/20">
                      <ul className="space-y-2">
                        {currentCandidate.codeReviewPoints.map((point, index) => (
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
              <div className="grid grid-cols-5 gap-4">
                {currentCandidate.skills.map((skill, idx) => (
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

          {/* AI Insights */}
          {currentCandidate.insights && (
            <div className="p-6">
              <button
                onClick={() => toggleSection("insights")}
                className="flex items-center justify-between w-full mb-4"
              >
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#A16AE8]" />
                  AI Insights about {currentCandidate.name}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${expandedSections.has("insights") ? "rotate-180" : ""}`}
                />
              </button>
              {expandedSections.has("insights") && (
                <div className="space-y-3">
                  {currentCandidate.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-[#A16AE8] mt-2 flex-shrink-0" />
                      <p className="text-sm text-foreground">{insight}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Sheet open={false} onOpenChange={() => {}}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Interview Transcript</SheetTitle>
            <SheetDescription>AI Interview with {currentCandidate.name}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {currentCandidate.aiInterviewTranscript ? (
              <div className="space-y-4">
                {/* Video Bytes - Timestamped sections */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-16 text-xs font-mono text-muted-foreground">00:00</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold">Introduction</p>
                      <p className="text-sm text-muted-foreground">
                        Hi, I'm {currentCandidate.name}. Thank you for the opportunity to interview for this position.
                        I'm excited to discuss my background and how I can contribute to your team.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-16 text-xs font-mono text-muted-foreground">02:15</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold">Technical Experience</p>
                      <p className="text-sm text-muted-foreground">
                        In my previous role, I worked extensively with modern web technologies. I've built scalable
                        applications using React, Node.js, and cloud infrastructure. One project I'm particularly proud
                        of involved optimizing our API response times by 60%.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-16 text-xs font-mono text-muted-foreground">05:30</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold">Problem-Solving Approach</p>
                      <p className="text-sm text-muted-foreground">
                        When faced with complex challenges, I start by breaking down the problem into smaller
                        components. I believe in collaborative problem-solving and often seek input from team members to
                        ensure we're considering all perspectives.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-16 text-xs font-mono text-muted-foreground">08:45</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold">Team Collaboration</p>
                      <p className="text-sm text-muted-foreground">
                        I thrive in collaborative environments. I've mentored junior developers and contributed to
                        establishing best practices in code reviews. Communication and knowledge sharing are essential
                        to building strong engineering teams.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-16 text-xs font-mono text-muted-foreground">12:00</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold">Why This Role</p>
                      <p className="text-sm text-muted-foreground">
                        I'm particularly drawn to this opportunity because of your company's commitment to innovation
                        and the technical challenges you're solving. The role aligns perfectly with my skills and career
                        goals, and I'm excited about the potential to make a meaningful impact.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-16 text-xs font-mono text-muted-foreground">15:00</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold">Closing Thoughts</p>
                      <p className="text-sm text-muted-foreground">
                        Thank you for your time today. I'm very interested in this position and would love the
                        opportunity to contribute to your team. Please feel free to reach out if you have any additional
                        questions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No transcript available</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
