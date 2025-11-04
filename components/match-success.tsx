"use client"

import { Heart, MessageSquare, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MatchSuccessProps {
  candidateName: string
  jobTitle?: string
  onOpenChat: () => void
  onContinueSwiping: () => void
}

export function MatchSuccess({ candidateName, jobTitle, onOpenChat, onContinueSwiping }: MatchSuccessProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#A16AE8]/5 to-[#8096FD]/5">
      <div className="animate-in zoom-in duration-500">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#A16AE8] to-[#8096FD] flex items-center justify-center animate-pulse">
            <Heart className="w-16 h-16 text-white fill-white" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-12 h-12 text-yellow-500 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-[#A16AE8] to-[#8096FD] bg-clip-text text-transparent">
          It's a Match!
        </h1>

        <p className="text-xl text-muted-foreground mb-2">
          <span className="font-semibold text-foreground">{candidateName}</span> is already waiting to meet you!
        </p>

        {jobTitle && <p className="text-sm text-muted-foreground mb-8">Position: {jobTitle}</p>}

        <div className="space-y-3 w-full max-w-sm">
          <Button
            onClick={onOpenChat}
            size="lg"
            className="w-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD] hover:from-[#8f5cd4] hover:to-[#6b7ee6] text-white gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Start Conversation
          </Button>

          <Button onClick={onContinueSwiping} size="lg" variant="outline" className="w-full bg-transparent">
            Continue Reviewing Candidates
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          A chat room has been created with you, {candidateName}, and our AI Agents
        </p>
      </div>
    </div>
  )
}
