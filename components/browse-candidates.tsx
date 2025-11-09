"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Check } from "lucide-react"
import type { CandidateProfile } from "@/types/workspace"

interface BrowseCandidatesProps {
  candidates: CandidateProfile[]
  onCandidateSelect: (candidate: CandidateProfile) => void
  onSwipe: (candidate: CandidateProfile, direction: "left" | "right") => void
  onSendMessage?: (message: string) => void
  onCandidateShown?: (candidate: CandidateProfile) => void
}

export function BrowseCandidates({
  candidates,
  onCandidateSelect,
  onSwipe,
  onSendMessage,
  onCandidateShown,
}: BrowseCandidatesProps) {
  const hasLoadedRef = useRef(false)
  const shownCandidateRef = useRef<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [isShowingNewCard, setIsShowingNewCard] = useState(false)

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      setIsLoading(true)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1500)

      return () => clearTimeout(timer)
    } else {
      // Already loaded, skip loading screen
      setIsLoading(false)
    }
  }, []) // Empty dependency array so it only runs once

  const currentCandidate = candidates[currentIndex]

  useEffect(() => {
    if (currentCandidate && onCandidateShown && !isLoading && shownCandidateRef.current !== currentCandidate.id) {
      shownCandidateRef.current = currentCandidate.id
      const timer = setTimeout(() => {
        onCandidateShown(currentCandidate)
      }, 400)

      return () => clearTimeout(timer)
    }
  }, [currentCandidate, onCandidateShown, isLoading])

  const handleSwipeLeft = () => {
    if (!currentCandidate) return

    setSwipeDirection("left")
    setTimeout(() => {
      onSwipe(currentCandidate, "left")
      setSwipeDirection(null)
      setIsShowingNewCard(true)
      setCurrentIndex((prev) => prev + 1)
      setTimeout(() => {
        setIsShowingNewCard(false)
      }, 50)
    }, 400)
  }

  const handleSwipeRight = () => {
    if (!currentCandidate) return

    setSwipeDirection("right")
    setTimeout(() => {
      onSwipe(currentCandidate, "right")
      setSwipeDirection(null)
      setIsShowingNewCard(true)
      setCurrentIndex((prev) => prev + 1)
      setTimeout(() => {
        setIsShowingNewCard(false)
      }, 50)
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
    if (isShowingNewCard) return 0
    return 1
  }

  const getSkillMatchInfo = (percentage: number) => {
    if (percentage >= 90) {
      return { color: "text-green-500", label: "STRONG FIT" }
    } else if (percentage >= 70) {
      return { color: "text-amber-500", label: "GOOD FIT" }
    } else {
      return { color: "text-red-500", label: "WEAK FIT" }
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/20">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-muted border-t-[#A16AE8] border-r-[#8096FD] animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-1">Finding Highly Skilled Candidates</h2>
            <p className="text-sm text-muted-foreground">Analyzing profiles and matching skills...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentCandidate) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Check className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No More Candidates</h2>
        <p className="text-muted-foreground">You've reviewed all candidates</p>
      </div>
    )
  }

  const skillMatchInfo = getSkillMatchInfo(currentCandidate.skillMatch)

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/20">
      <div className="w-full max-w-md">
        <Card
          key={currentIndex}
          className="overflow-hidden cursor-pointer"
          onClick={() => onCandidateSelect(currentCandidate)}
          style={{
            transform: getCardTransform(),
            transition: swipeDirection
              ? "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out"
              : "opacity 0.3s ease-out",
            opacity: getCardOpacity(),
          }}
        >
          {/* Profile Photo */}
          <div className="h-80 relative bg-gradient-to-br from-[#A16AE8] to-[#8096FD]">
            {currentCandidate.avatar ? (
              <img
                src={currentCandidate.avatar || "/placeholder.svg"}
                alt={currentCandidate.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                {currentCandidate.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Minimal Info */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold mb-0.5 truncate">{currentCandidate.name}</h2>
                <p className="text-base text-muted-foreground truncate">{currentCandidate.title}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentCandidate.skills.slice(0, 4).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                  {currentCandidate.skills.length > 4 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                      +{currentCandidate.skills.length - 4}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <div className={`text-3xl font-bold ${skillMatchInfo.color}`}>{currentCandidate.skillMatch}%</div>
                <div className={`text-xs font-semibold uppercase ${skillMatchInfo.color}`}>{skillMatchInfo.label}</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-center gap-12 mt-8">
          <Button
            onClick={handleSwipeLeft}
            size="lg"
            variant="outline"
            className="w-20 h-20 rounded-full border-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all bg-background shadow-lg"
          >
            <X className="w-10 h-10 stroke-[3]" />
          </Button>
          <Button
            onClick={handleSwipeRight}
            size="lg"
            className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg border-4 border-emerald-500"
          >
            <Check className="w-10 h-10 stroke-[3]" />
          </Button>
        </div>
      </div>
    </div>
  )
}
