"use client"

import { useState, useEffect, useRef } from "react"
import { X, Pause, Play } from "lucide-react"
import { RealtimeClient } from "@/lib/realtime-client"
import type { WorkspaceContent } from "@/types/workspace"
import type { AIAgent } from "@/types/agents"

interface VoiceModeProps {
  onClose: () => void
  onTranscriptionUpdate: (userText: string, aiText: string) => void
  onCommandDetected?: (command: string) => Promise<boolean>
  agentName: string
  agentId: string
  currentWorkspaceContent?: WorkspaceContent
  allAgents: AIAgent[]
  currentAgent: AIAgent
  onAgentChange: (agent: AIAgent) => void
}

function getVoiceForAgent(agentId: string): string {
  const voiceMap: Record<string, string> = {
    "account-manager": "echo", // Lawrence - male voice
    "technical-recruiter": "verse", // Danny - male voice
    "sales-marketing": "shimmer", // Darlyn - female voice
    "hr-manager": "shimmer", // Siona - female voice
    "financial-controller": "echo", // Dave - male voice
  }

  const selectedVoice = voiceMap[agentId] || "echo"
  console.log("[v0] Voice selection for agent:", agentId, "→", selectedVoice)
  return selectedVoice
}

export function VoiceMode({
  onClose,
  onTranscriptionUpdate,
  onCommandDetected,
  agentName,
  agentId,
  currentWorkspaceContent,
  allAgents,
  currentAgent,
  onAgentChange,
}: VoiceModeProps) {
  const [isConnecting, setIsConnecting] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const clientRef = useRef<RealtimeClient | null>(null)
  const transcriptBufferRef = useRef<string>("")
  const aiResponseBufferRef = useRef<string>("")
  const hasRequestedIntroRef = useRef(false)
  const agentDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeVoiceMode = async () => {
      try {
        const client = new RealtimeClient()

        client.onConnectionReady(() => {
          console.log("[v0] Voice mode connection ready")
          setIsConnecting(false)

          const systemInstructions = getAgentSystemPrompt(agentId, currentWorkspaceContent)
          client.sendMessage({
            type: "session.update",
            session: {
              turn_detection: { type: "server_vad" },
              input_audio_transcription: { model: "whisper-1" },
              instructions: systemInstructions,
            },
          })

          if (!hasRequestedIntroRef.current) {
            hasRequestedIntroRef.current = true
            setTimeout(() => {
              client.requestIntroduction()
            }, 500)
          }
        })

        await client.connect(agentId)
        clientRef.current = client

        client.onMessage(async (message) => {
          if (message.type === "input_audio_buffer.speech_started") {
            setIsUserSpeaking(true)
            setIsListening(false)
          }

          if (message.type === "input_audio_buffer.speech_stopped") {
            setIsUserSpeaking(false)
          }

          if (message.type === "conversation.item.input_audio_transcription.completed") {
            const userText = message.transcript
            transcriptBufferRef.current = userText
            setCurrentTranscript(userText)
            setIsListening(false)

            if (onCommandDetected) {
              const isCommand = await onCommandDetected(userText)
              if (isCommand) {
                // Command was handled, clear the transcript buffer so it doesn't get saved to chat
                transcriptBufferRef.current = ""
                setCurrentTranscript("")
              }
            }
          }

          if (message.type === "response.audio_transcript.delta") {
            aiResponseBufferRef.current += message.delta
            setAiResponse(aiResponseBufferRef.current)
          }

          if (message.type === "response.audio_transcript.done") {
            const finalAiText = message.transcript
            aiResponseBufferRef.current = finalAiText
            setAiResponse(finalAiText)

            if (transcriptBufferRef.current || finalAiText) {
              onTranscriptionUpdate(transcriptBufferRef.current, finalAiText)
            }

            transcriptBufferRef.current = ""
            aiResponseBufferRef.current = ""
            setCurrentTranscript("")
            setAiResponse("")
            setIsListening(true)
          }
        })

        client.onAudioStateChange((isPlaying) => {
          setIsSpeaking(isPlaying)
          if (!isPlaying) {
            setIsListening(true)
          } else {
            setIsListening(false)
          }
        })
      } catch (error) {
        console.error("[VoiceMode] Initialization error:", error)
        setIsConnecting(false)
      }
    }

    initializeVoiceMode()

    return () => {
      console.log("[v0] Voice mode cleanup: disconnecting Realtime API")
      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }
    }
  }, [agentId]) // Only agentId in dependencies to prevent reconnection on workspace changes

  useEffect(() => {
    if (clientRef.current && !isConnecting) {
      console.log("[v0] Updating workspace context without reconnecting")
      const systemInstructions = getAgentSystemPrompt(agentId, currentWorkspaceContent)
      clientRef.current.sendMessage({
        type: "session.update",
        session: {
          instructions: systemInstructions,
        },
      })
    }
  }, [currentWorkspaceContent, agentId, isConnecting])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(event.target as Node)) {
        setIsAgentDropdownOpen(false)
      }
    }
    if (isAgentDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isAgentDropdownOpen])

  const handleAgentChange = async (agent: AIAgent) => {
    if (agent.id === currentAgent.id) {
      setIsAgentDropdownOpen(false)
      return
    }

    console.log("[v0] Voice mode: Switching agent from", currentAgent.id, "to", agent.id)
    setIsAgentDropdownOpen(false)
    setIsReconnecting(true)

    // Disconnect current client
    if (clientRef.current) {
      clientRef.current.disconnect()
      clientRef.current = null
    }

    // Reset state
    hasRequestedIntroRef.current = false
    setCurrentTranscript("")
    setAiResponse("")
    transcriptBufferRef.current = ""
    aiResponseBufferRef.current = ""
    setIsListening(false)
    setIsUserSpeaking(false)
    setIsSpeaking(false)

    // Update agent in parent component
    onAgentChange(agent)

    // Wait a bit for the agent change to propagate
    await new Promise((resolve) => setTimeout(resolve, 500))

    // The useEffect will handle reconnection with the new agent
    setIsReconnecting(false)
  }

  const handlePauseToggle = () => {
    setIsPaused(!isPaused)
  }

  const handleClose = () => {
    console.log("[v0] Voice mode close button clicked: disconnecting Realtime API")
    if (clientRef.current) {
      clientRef.current.disconnect()
      clientRef.current = null
    }
    onClose()
  }

  if (isConnecting || isReconnecting) {
    return (
      <div className="relative w-full h-full bg-black flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-white/20 border-t-purple-500 border-r-blue-400 animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-1">
              {isReconnecting ? "Switching to" : "Connecting to"} {agentName.split(" - ")[0]}
            </h2>
            <p className="text-sm text-white/60">{agentName.split(" - ")[1]} AI Agent</p>
            <p className="text-sm text-white/70 mt-2">
              {isReconnecting ? "Reconnecting with new agent..." : "Establishing secure voice connection..."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-black flex flex-col items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
        <div className="text-white">
          <p className="text-lg font-semibold">{agentName.split(" - ")[0]}</p>
          <p className="text-sm opacity-60">{agentName.split(" - ")[1]} AI Agent</p>
        </div>
        <div className="relative" ref={agentDropdownRef}>
          <button
            type="button"
            onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-all group"
            aria-label="Select AI Agent"
            title={currentAgent.name}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
              style={{ backgroundColor: currentAgent.color }}
            >
              <span className="text-xl">{currentAgent.icon}</span>
            </div>
          </button>
          {isAgentDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-3 border-b border-border bg-muted">
                <h3 className="text-sm font-semibold text-foreground">Select AI Agent</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {allAgents.map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => handleAgentChange(agent)}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors text-left ${currentAgent.id === agent.id ? "bg-accent/50" : ""}`}
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: agent.color }}
                    >
                      <span className="text-xl">{agent.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">{agent.name}</h4>
                        {currentAgent.id === agent.id && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Animation Area */}
      <div className="flex-1 flex items-center justify-center">
        {isSpeaking ? (
          // Cloud Bubble Animation (AI Speaking)
          <div className="relative">
            <div className="w-64 h-64 relative">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <path
                  d="M 50 100 Q 50 50, 100 50 Q 150 50, 150 100 Q 180 100, 180 130 Q 180 160, 150 160 L 50 160 Q 20 160, 20 130 Q 20 100, 50 100"
                  fill="white"
                  style={{
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                <circle
                  cx="30"
                  cy="180"
                  r="15"
                  fill="white"
                  style={{
                    animation: "bounce 1s ease-in-out infinite",
                  }}
                />
                <circle
                  cx="50"
                  cy="190"
                  r="8"
                  fill="white"
                  style={{
                    animation: "bounce 1.2s ease-in-out infinite",
                  }}
                />
              </svg>
            </div>
          </div>
        ) : isUserSpeaking ? (
          // 4 Circles Animation (User Actively Speaking)
          <div className="relative">
            <div className="flex items-center gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-full bg-white"
                  style={{
                    animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          // Static Circles (Idle/Waiting for user to speak)
          <div className="relative">
            <div className="flex items-center gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-full bg-white opacity-50"
                  style={{
                    animation: `pulse 3s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
        <button
          onClick={handlePauseToggle}
          className="w-14 h-14 rounded-full border-2 border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? <Play className="w-6 h-6 text-white" /> : <Pause className="w-6 h-6 text-white" />}
        </button>
        <button
          onClick={handleClose}
          className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
          aria-label="Close voice mode"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  )
}

function formatWorkspaceContextForVoice(content: WorkspaceContent | undefined): string {
  if (!content) {
    console.log("[v0] Voice mode: No workspace content available")
    return ""
  }

  console.log("[v0] Voice mode: Formatting workspace context for type:", content.type)

  let context = "\n\n**CURRENT WORKSPACE CONTEXT:**\n"

  switch (content.type) {
    case "candidate-profile-view":
    case "candidate-profile":
      if (content.candidate) {
        const c = content.candidate
        context += `The user is currently viewing a candidate profile:\n`
        context += `- Name: ${c.name}\n`
        context += `- Title: ${c.title}\n`
        context += `- Location: ${c.location}\n`
        context += `- Experience: ${c.experience}\n`
        context += `- Skills: ${c.skills.join(", ")}\n`
        context += `- Skill Match: ${c.skillMatch}%\n`
        if (c.takeHomeChallengeStatus) context += `- Take Home Challenge: ${c.takeHomeChallengeStatus}\n`
        if (c.takeHomeChallengeScore) context += `- Challenge Score: ${c.takeHomeChallengeScore}%\n`
        if (c.aiInterviewStatus) context += `- AI Interview: ${c.aiInterviewStatus}\n`
        if (c.aiInterviewScore) context += `- Interview Score: ${c.aiInterviewScore}%\n`
      } else {
        console.log("[v0] Voice mode: Candidate profile workspace has no candidate data")
      }
      break

    case "browse-candidates":
      if (content.candidates && content.candidates.length > 0) {
        context += `The user is browsing ${content.candidates.length} candidates.\n`
        if (content.currentCandidateIndex !== undefined) {
          const currentCandidate = content.candidates[content.currentCandidateIndex]
          if (currentCandidate) {
            context += `Currently viewing: ${currentCandidate.name} (${currentCandidate.title})\n`
          }
        }
      } else {
        console.log("[v0] Voice mode: Browse candidates workspace has no candidates")
      }
      break

    case "job-view":
      if (content.job) {
        const j = content.job
        context += `The user is viewing a job posting:\n`
        context += `- Title: ${j.title}\n`
        context += `- Company: ${j.company}\n`
        context += `- Location: ${j.location}\n`
        context += `- Salary: ${j.salary}\n`
        if (j.skillMatch) context += `- Skill Match: ${j.skillMatch}%\n`
        if (j.applied) context += `- Status: Already applied\n`
      } else {
        console.log("[v0] Voice mode: Job view workspace has no job data")
      }
      break

    case "job-board":
      context += `The user is viewing the job board.\n`
      if (content.data?.jobs) {
        const jobs = content.data.jobs
        const appliedJobs = jobs.filter((j: any) => j.applied)
        const savedJobs = jobs.filter((j: any) => j.saved)
        context += `- Total jobs: ${jobs.length}\n`
        context += `- Applied jobs: ${appliedJobs.length}\n`
        context += `- Saved jobs: ${savedJobs.length}\n`
      } else {
        console.log("[v0] Voice mode: Job board workspace has no jobs data")
      }
      break

    default:
      if (content.title) {
        context += `The user is viewing: ${content.title}\n`
      } else {
        console.log("[v0] Voice mode: Unknown workspace type with no title:", content.type)
      }
  }

  console.log("[v0] Voice mode: Workspace context formatted:", context.length, "characters")
  return context
}

function getAgentSystemPrompt(agentId: string, workspaceContent?: WorkspaceContent): string {
  const systemPrompts: Record<string, string> = {
    "technical-recruiter": `You are a friendly and professional Technical Recruiter AI assistant named Danny helping candidates find their dream jobs.

**IMPORTANT: When the conversation starts, immediately introduce yourself by saying:**
"Hi! I'm Danny, your Technical Recruiter AI Agent. I specialize in conducting AI interviews, providing candidate briefs, refining job descriptions, and salary benchmarking. I can help you find job opportunities, prepare for interviews, review your resume, and guide you through the application process. What can I help you with today?"

Your primary responsibilities:
- Help candidates discover job opportunities that match their skills and experience
- Provide guidance on the application process and interview preparation
- Answer questions about job requirements, company culture, and career growth
- Assist with resume reviews and skill assessments

When a candidate expresses interest in applying for a job, offer them two options:
1. AI Interview (Recommended) - Instant scheduling, personalized questions, immediate feedback, priority consideration
2. Traditional Interview - Scheduled with hiring team, standard process

Always maintain a professional yet friendly tone, and celebrate candidates' achievements and progress in their job search journey.`,

    "account-manager": `You are a helpful Account Manager AI assistant named Lawrence.

**IMPORTANT: When the conversation starts, immediately introduce yourself by saying:**
"Hello! I'm Lawrence, your Account Manager AI Agent. I specialize in service overviews, quotations, job creation, candidate management, billing inquiries, and contract management. I'm here to help you navigate our services and manage your account effectively. What can I help you with today?"

You specialize in service overviews, quotations, job creation, candidate management, billing inquiries, and contract management. You help clients navigate services and manage their accounts effectively. Be professional, efficient, and solution-oriented.`,

    "sales-marketing": `You are a helpful Sales & Marketing AI assistant named Darlyn for Teamified.

**IMPORTANT: When the conversation starts, immediately introduce yourself by saying:**
"Hi there! I'm Darlyn, your Sales & Marketing AI Agent for Teamified. I specialize in lead qualification, service comparisons, case studies, testimonials, ROI calculations, and demo scheduling. I can help you understand our pricing plans, compare our services, calculate ROI, and explore how Teamified can benefit you or your organization. What would you like to learn about today?"

You help both candidates and hiring managers understand the value of Teamified's offerings.

For candidates, you explain the Premium Plan ($19.99/month or $149/year) with features like unlimited AI interactions, resume optimization, priority job matching, and career coaching.

For hiring managers, you explain the 4 enterprise plans:
- Basic Plan ($300/month) - Payroll and HR essentials
- Recruiter Plan (9% per hire) - Pay only for successful placements
- Enterprise Plan ($500/month) - Most popular, includes equipment and workspace
- Premium Plan (30% + $300/month) - All-in solution with dedicated support

Be enthusiastic and focus on value and ROI.`,

    "hr-manager": `You are a helpful HR Manager AI assistant named Siona.

**IMPORTANT: When the conversation starts, immediately introduce yourself by saying:**
"Hello! I'm Siona, your HR Manager AI Agent. I specialize in onboarding processes, policy guidance, document management, benefits overview, compliance, and training schedules. I can help you with onboarding checklists, policy questions, document requests, benefits information, and training schedules. What HR matter can I assist you with today?"

You specialize in onboarding processes, policy guidance, document management, benefits overview, compliance, and training schedules. You help with all HR-related needs in a professional and supportive manner.`,

    "financial-controller": `You are a helpful Financial Controller AI assistant named Dave.

**IMPORTANT: When the conversation starts, immediately introduce yourself by saying:**
"Hi! I'm Dave, your Financial Controller AI Agent. I specialize in invoice management, payment processing, billing cycles, account balances, payment plans, tax documents, and EOR fee calculations. I can help you check invoice status, process payments, review billing cycles, and provide cost breakdowns. What financial question can I help you with today?"

You specialize in invoice management, payment processing, billing cycles, account balances, payment plans, tax documents, and EOR fee calculations. You help manage financial matters efficiently and transparently.`,
  }

  let systemMessage = systemPrompts[agentId] || systemPrompts["technical-recruiter"]

  const workspaceContext = formatWorkspaceContextForVoice(workspaceContent)
  if (workspaceContext && workspaceContext.trim().length > 0) {
    systemMessage += workspaceContext
    systemMessage +=
      "\n\n**CONTEXT-AWARE INSTRUCTIONS:**\n" +
      "- When the user asks questions about what they're viewing (e.g., 'What's their experience?', 'Tell me about this candidate', 'How many jobs have I applied to?'), use the workspace context above to provide accurate, specific answers based on what's currently displayed.\n" +
      "- If the user asks about something not in the workspace context, use your general knowledge to provide helpful information."
  } else {
    systemMessage +=
      "\n\n**GENERAL INSTRUCTIONS:**\n" +
      "- The user currently has no workspace open or the workspace is empty.\n" +
      "- Use your general knowledge and expertise to answer their questions.\n" +
      "- If they ask about specific data that would normally be in a workspace (like candidate details or job information), politely let them know they need to open the relevant workspace first.\n" +
      "- For general questions, provide helpful and informative responses based on your knowledge."
  }

  return systemMessage
}
