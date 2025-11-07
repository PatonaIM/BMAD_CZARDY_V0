"use client"

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import { X, Pause, Play } from "lucide-react"
import { RealtimeClient } from "@/lib/realtime-client"
import type { WorkspaceContent } from "@/types/workspace"
import type { AIAgent } from "@/types/agents"
import { AI_AGENTS } from "@/types/agents"
import { buildSystemPrompt } from "@/config/agent-prompts"

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
  userType: string // Added userType prop
}

export interface VoiceModeRef {
  handleVerbalAgentSwitch: (agent: AIAgent) => void
}

export const VoiceMode = forwardRef<VoiceModeRef, VoiceModeProps>(
  (
    {
      onClose,
      onTranscriptionUpdate,
      onCommandDetected,
      agentName,
      agentId,
      currentWorkspaceContent,
      allAgents,
      currentAgent,
      onAgentChange,
      userType, // Added userType prop
    },
    ref,
  ) => {
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
    const isIntroducingRef = useRef(false) // Added ref to track if introduction is in progress
    const pendingAgentSwitchRef = useRef<AIAgent | null>(null) // Added ref to track pending agent switch after confirmation speech completes
    const agentDropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const initializeVoiceMode = async () => {
        try {
          const client = new RealtimeClient()

          client.onConnectionReady(() => {
            console.log("[v0] Voice mode connection ready")
            setIsConnecting(false)

            const systemInstructions = buildSystemPrompt(agentId, AI_AGENTS, true)

            client.sendMessage({
              type: "session.update",
              session: {
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.7, // Higher threshold = less sensitive (default is 0.5)
                  prefix_padding_ms: 300,
                  silence_duration_ms: 800, // Longer silence required to detect speech end (default is 500ms)
                },
                input_audio_transcription: { model: "whisper-1" },
                instructions: systemInstructions,
              },
            })

            if (!hasRequestedIntroRef.current) {
              hasRequestedIntroRef.current = true
              isIntroducingRef.current = true
              setTimeout(() => {
                client.requestIntroduction()
              }, 500)
            }
          })

          await client.connect(agentId)
          clientRef.current = client

          client.onMessage(async (message) => {
            if (message.type === "input_audio_buffer.speech_started") {
              if (!isIntroducingRef.current) {
                setIsUserSpeaking(true)
                setIsListening(false)
              }
            }

            if (message.type === "input_audio_buffer.speech_stopped") {
              setIsUserSpeaking(false)
            }

            if (message.type === "conversation.item.input_audio_transcription.completed") {
              if (isIntroducingRef.current) {
                console.log("[v0] Ignoring user input during AI introduction")
                return
              }

              const userText = message.transcript
              const trimmedText = userText.trim()

              // Ignore empty, very short, or filler-only transcriptions
              if (!trimmedText || trimmedText.length < 3) {
                console.log("[v0] Ignoring empty or too short transcription:", userText)
                return
              }

              const fillerWords = ["um", "uh", "hmm", "mm", "mhm", "uh-huh", "mm-hmm", "ah", "oh", "er", "erm"]
              const isFillerOnly = fillerWords.includes(trimmedText.toLowerCase())
              if (isFillerOnly) {
                console.log("[v0] Ignoring filler word transcription:", userText)
                return
              }

              console.log("[v0] Processing user transcription:", userText)

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
              if (!isSpeaking) {
                console.log("[v0] AI started speaking")
                setIsSpeaking(true)
                setIsListening(false)
              }
              aiResponseBufferRef.current += message.delta
              setAiResponse(aiResponseBufferRef.current)
            }

            if (message.type === "response.audio_transcript.done") {
              const finalAiText = message.transcript
              aiResponseBufferRef.current = finalAiText
              setAiResponse(finalAiText)

              if (isIntroducingRef.current) {
                console.log("[v0] AI introduction completed")
                isIntroducingRef.current = false
              }

              // Save to chat (only if there's content to save)
              if (transcriptBufferRef.current || finalAiText) {
                onTranscriptionUpdate(transcriptBufferRef.current, finalAiText)
              }

              transcriptBufferRef.current = ""
              aiResponseBufferRef.current = ""
              setCurrentTranscript("")
              setAiResponse("")
            }

            if (message.type === "response.done") {
              console.log("[v0] AI response fully completed (including audio)")

              setTimeout(() => {
                console.log("[v0] Setting isSpeaking to false after response completion")
                setIsSpeaking(false)
                setIsListening(true)
              }, 1500) // 1.5 second delay to ensure audio finishes playing

              // If there's a pending agent switch, wait a bit for audio to finish playing, then perform the switch
              if (pendingAgentSwitchRef.current) {
                console.log("[v0] AI finished generating confirmation, waiting for audio playback to complete...")
                const agentToSwitch = pendingAgentSwitchRef.current
                pendingAgentSwitchRef.current = null

                // Wait 3 seconds to ensure the audio has finished playing
                // This accounts for audio buffering, playback delay, and network latency
                setTimeout(async () => {
                  console.log("[v0] Audio playback should be complete, now switching to:", agentToSwitch.firstName)
                  await performAgentSwitch(agentToSwitch)
                }, 3000)
              }
            }
          })

          client.onAudioStateChange((isPlaying) => {
            console.log("[v0] Audio state changed - isPlaying:", isPlaying)
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
        const systemInstructions = buildSystemPrompt(agentId, AI_AGENTS, true)
        clientRef.current.sendMessage({
          type: "session.update",
          session: {
            instructions: systemInstructions,
          },
        })
      }
    }, [currentWorkspaceContent, agentId, isConnecting, userType])

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

    const performAgentSwitch = async (agent: AIAgent) => {
      console.log("[v0] Voice mode: Performing agent switch from", currentAgent.id, "to", agent.id)
      setIsReconnecting(true)

      const loadingStartTime = Date.now()
      const minimumLoadingTime = 2000 // 2 seconds

      // Disconnect current client
      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }

      // Reset state
      hasRequestedIntroRef.current = false
      isIntroducingRef.current = false
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

      const elapsedTime = Date.now() - loadingStartTime
      const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime)

      // Wait for the remaining time to ensure loading screen shows for at least 2 seconds
      if (remainingTime > 0) {
        console.log(`[v0] Waiting ${remainingTime}ms more to reach minimum 2-second loading time`)
        await new Promise((resolve) => setTimeout(resolve, remainingTime))
      }

      // The useEffect will handle reconnection with the new agent
      setIsReconnecting(false)
    }

    const handleAgentChange = async (agent: AIAgent) => {
      if (agent.id === currentAgent.id) {
        setIsAgentDropdownOpen(false)
        return
      }

      console.log("[v0] Voice mode: Manual agent switch from dropdown")
      setIsAgentDropdownOpen(false)
      await performAgentSwitch(agent)
    }

    const handleVerbalAgentSwitch = async (agent: AIAgent) => {
      console.log("[v0] Voice mode: Verbal agent switch requested for:", agent.firstName)

      // Store the pending agent switch
      pendingAgentSwitchRef.current = agent

      // Create a confirmation message
      const confirmationText = `Got it. I will now switch to ${agent.firstName}, our ${agent.name} AI Agent.`

      // Send the confirmation as a response from the current AI
      clientRef.current?.sendMessage({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "assistant",
          content: [
            {
              type: "text",
              text: confirmationText,
            },
          ],
        },
      })

      // Trigger the AI to speak the confirmation
      // The agent switch will happen automatically when response.done is received
      clientRef.current?.sendMessage({
        type: "response.create",
      })

      console.log("[v0] Waiting for AI to finish speaking confirmation before switching...")
    }

    useImperativeHandle(ref, () => ({
      handleVerbalAgentSwitch,
    }))

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
          {console.log("[v0] isSpeaking:", isSpeaking, "isUserSpeaking:", isUserSpeaking)}
          {/* Outer sphere with conditional glow */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer sphere with conditional glow */}
            <div
              className={`absolute w-64 h-64 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 overflow-hidden transition-all duration-300`}
              style={{
                boxShadow: isSpeaking
                  ? "0 0 80px 30px rgba(255, 255, 255, 0.6), 0 0 50px 15px rgba(255, 255, 255, 0.7), 0 0 25px 8px rgba(255, 255, 255, 0.8)"
                  : "none",
              }}
            >
              {/* Smoke particles inside sphere */}
              <div className="absolute inset-0">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white/20 smoke-particle"
                    data-pattern={(i % 4) + 1}
                    style={{
                      width: `${40 + (i % 6) * 12}px`,
                      height: `${40 + (i % 6) * 12}px`,
                      left: `${15 + (i % 4) * 20}%`,
                      top: `${20 + (i % 3) * 25}%`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Center indicator */}
            <div className="relative z-10 w-4 h-4 rounded-full bg-white/80" />
          </div>
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
  },
)

VoiceMode.displayName = "VoiceMode"

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

    case "job-board":
      if (content.jobs && content.jobs.length > 0) {
        const tabName =
          content.jobBoardTab === "browse"
            ? "browsing available jobs"
            : content.jobBoardTab === "applied"
              ? "viewing applied jobs"
              : content.jobBoardTab === "invited"
                ? "viewing invited jobs"
                : content.jobBoardTab === "saved"
                  ? "viewing saved jobs"
                  : "viewing jobs"

        context += `The user is ${tabName}. Here are the ${content.jobs.length} jobs currently displayed:\n\n`

        content.jobs.forEach((job, index) => {
          context += `${index + 1}. ${job.title} at ${job.company}\n`
          context += `   - Location: ${job.location}\n`
          context += `   - Salary: ${job.salary}\n`
          if (job.skillMatch) context += `   - Skill Match: ${job.skillMatch}%\n`
          if (job.applied) context += `   - Status: Applied\n`
          if (job.invited) context += `   - Status: Invited\n`
          if (job.saved) context += `   - Status: Saved\n`
          context += `\n`
        })

        context += `You can answer questions about these jobs, such as which has the highest skill match, salary comparisons, or details about specific positions.\n`
      } else {
        context += `The user is viewing the job board, but there are no jobs currently displayed.\n`
        console.log("[v0] Voice mode: Job board workspace has no jobs data")
      }
      break

    case "job-view":
      if (content.job) {
        const j = content.job
        context += `The user is viewing a job posting:\n`
        context += `- Title: ${j.title}\n`
        context += `- Company: ${j.company}\n`
        context += `- Location: ${j.location}\n`
        context += `- Type: ${j.type}\n`
        context += `- Salary: ${j.salary}\n`
        context += `- Posted: ${j.posted}\n`
        if (j.skillMatch) context += `- Skill Match: ${j.skillMatch}%\n`
        if (j.applied) context += `- Status: Already applied\n`
        if (j.saved) context += `- Status: Saved\n`

        // Add detailed job information for follow-up questions
        if (j.aboutClient) {
          context += `\n**About the Client:**\n${j.aboutClient}\n`
        }

        if (j.jobSummary) {
          context += `\n**Job Summary:**\n${j.jobSummary}\n`
        }

        if (j.requirements && j.requirements.length > 0) {
          context += `\n**Required Skills:**\n`
          j.requirements.forEach((req, index) => {
            context += `${index + 1}. ${req}\n`
          })
        }

        if (j.benefits && j.benefits.length > 0) {
          context += `\n**Benefits:**\n`
          j.benefits.forEach((benefit, index) => {
            context += `${index + 1}. ${benefit}\n`
          })
        }

        if (j.responsibilities && j.responsibilities.length > 0) {
          context += `\n**Responsibilities:**\n`
          j.responsibilities.forEach((resp, index) => {
            context += `${index + 1}. ${resp}\n`
          })
        }

        if (j.qualifications && j.qualifications.length > 0) {
          context += `\n**Qualifications:**\n`
          j.qualifications.forEach((qual, index) => {
            context += `${index + 1}. ${qual}\n`
          })
        }
      } else {
        console.log("[v0] Voice mode: Job view workspace has no job data")
      }
      break

    case "pricing-plans":
      context += `The user is viewing the Pricing Plans workspace with detailed pricing information.\n\n`
      context += `**CANDIDATE PRICING:**\n`
      context += `- Free Plan: $0/month (basic features, 10 AI interactions/month)\n`
      context += `- Premium Monthly: $19.99/month (was $29.99, ON SALE)\n`
      context += `  - Unlimited AI interactions, resume optimization, priority matching, interview prep, mock interviews, learning access, salary insights, direct messaging, application tracking, 2 coaching sessions/month\n`
      context += `- Premium Annual: $149/year (was $239.88, saves $90.88 = 38% off)\n`
      context += `  - Same features as Premium Monthly, billed annually\n\n`
      context += `**HIRING MANAGER PRICING:**\n`
      context += `- Basic Plan: $300/month (payroll & HR essentials)\n`
      context += `- Recruiter Plan: 9% of base salary per hire (pay only for successful placements)\n`
      context += `- Enterprise Plan: $500/month (MOST POPULAR - includes equipment, workspace, priority matching, analytics, dedicated account manager)\n`
      context += `- Premium Plan: 30% + $300/month (all-in solution with white-glove service, 24/7 support, custom integrations)\n\n`
      context += `You can answer any questions about pricing, plan features, comparisons, or recommendations based on this information.\n`
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

function getAgentSystemPrompt(agentId: string, workspaceContent?: WorkspaceContent, userType?: string): string {
  // Build base prompt using centralized config (with intro instruction for voice mode)
  let systemMessage = buildSystemPrompt(agentId, AI_AGENTS, true)

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
