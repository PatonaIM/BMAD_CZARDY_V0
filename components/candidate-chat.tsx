"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Smile } from "lucide-react"
import type { CandidateProfile } from "@/types/workspace"

interface Message {
  id: string
  sender: "candidate" | "hiring-manager" | "ai-agent"
  senderName: string
  content: string
  timestamp: string
  avatar?: string
}

interface CandidateChatProps {
  candidate: CandidateProfile
  jobTitle?: string
}

// Mock conversation data
const getMockConversation = (candidateName: string, jobTitle?: string): Message[] => {
  return [
    {
      id: "1",
      sender: "ai-agent",
      senderName: "AI Recruiter",
      content: `Hi! I'm excited to introduce you to ${candidateName}, who has applied for the ${jobTitle || "position"}. They've completed their AI interview and take-home challenge with excellent results.`,
      timestamp: "2 days ago",
      avatar: "/ai-robot-assistant.png",
    },
    {
      id: "2",
      sender: "candidate",
      senderName: candidateName,
      content: `Hello! Thank you for considering my application. I'm really excited about this opportunity and would love to discuss how my experience aligns with your team's needs.`,
      timestamp: "2 days ago",
    },
    {
      id: "3",
      sender: "hiring-manager",
      senderName: "You",
      content: `Hi ${candidateName.split(" ")[0]}, thanks for your interest! I've reviewed your profile and I'm impressed with your background. Can you tell me more about your experience with the technologies mentioned in the job description?`,
      timestamp: "1 day ago",
    },
    {
      id: "4",
      sender: "candidate",
      senderName: candidateName,
      content: `I've been working with these technologies for the past 3 years. In my current role, I've led several projects that involved similar tech stacks. I'd be happy to walk you through some specific examples if you're interested.`,
      timestamp: "1 day ago",
    },
    {
      id: "5",
      sender: "ai-agent",
      senderName: "AI Recruiter",
      content: `Based on ${candidateName.split(" ")[0]}'s AI interview, they demonstrated strong problem-solving skills and excellent communication. Their technical assessment scored 92%, showing proficiency in the required areas.`,
      timestamp: "1 day ago",
      avatar: "/ai-robot-assistant.png",
    },
    {
      id: "6",
      sender: "hiring-manager",
      senderName: "You",
      content: `That's great to hear! I'd like to schedule a follow-up call to discuss the role in more detail. Are you available this week?`,
      timestamp: "12 hours ago",
    },
    {
      id: "7",
      sender: "candidate",
      senderName: candidateName,
      content: `Yes, I'm available! I'm flexible with timing. What works best for you?`,
      timestamp: "10 hours ago",
    },
  ]
}

export function CandidateChat({ candidate, jobTitle }: CandidateChatProps) {
  const [messages] = useState<Message[]>(getMockConversation(candidate.name, jobTitle))
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the backend
      console.log("[v0] Sending message:", newMessage)
      setNewMessage("")
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Avatar className="w-12 h-12">
          <AvatarImage
            src={`/smiling-woman-curly-brown-hair-headshot.png?height=48&width=48&query=professional headshot of ${candidate.name}`}
            alt={candidate.name}
          />
          <AvatarFallback>
            {candidate.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{candidate.name}</h2>
          <p className="text-sm text-muted-foreground">{candidate.title}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-[#A16AE8]">{candidate.skillMatch}% Match</div>
          <div className="text-xs text-muted-foreground">
            {candidate.aiInterviewStatus === "completed" && candidate.takeHomeChallengeStatus === "completed"
              ? "All assessments completed"
              : "Assessments in progress"}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === "hiring-manager" ? "flex-row-reverse" : ""}`}
          >
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage
                src={
                  message.sender === "candidate"
                    ? `/smiling-woman-curly-brown-hair-headshot.png?height=40&width=40&query=professional headshot of ${candidate.name}`
                    : message.sender === "ai-agent"
                      ? message.avatar
                      : "/professional-business-person.png"
                }
                alt={message.senderName}
              />
              <AvatarFallback>
                {message.senderName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className={`flex-1 ${message.sender === "hiring-manager" ? "items-end" : ""}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-sm">{message.senderName}</span>
                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
              </div>
              <div
                className={`inline-block p-3 rounded-lg max-w-[80%] ${
                  message.sender === "hiring-manager"
                    ? "bg-[#A16AE8] text-white"
                    : message.sender === "ai-agent"
                      ? "bg-blue-100 dark:bg-blue-900 text-foreground"
                      : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Smile className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon" className="flex-shrink-0 bg-[#A16AE8] hover:bg-[#8F4FD1]">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
