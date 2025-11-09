"use client"

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import { X, Camera, Mic, MicOff } from "lucide-react"
import { RealtimeClient } from "@/lib/realtime-client"
import type { WorkspaceContent } from "@/types/workspace"
import type { AIAgent } from "@/types/agents"
import { AI_AGENTS } from "@/types/agents"
import { buildSystemPrompt } from "@/config/agent-prompts"
import { DraggableVideoFeed } from "./draggable-video-feed"

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
  userType: string
  isWorkspaceOpen?: boolean
}

export interface VoiceModeRef {
  handleVerbalAgentSwitch: (agent: AIAgent) => void
  speakResponse: (text: string) => void
  activateAIInterview: () => void
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
      userType,
      isWorkspaceOpen = false,
    },
    ref,
  ) => {
    const [isConnecting, setIsConnecting] = useState(true)
    const [isListening, setIsListening] = useState(false)
    const [isUserSpeaking, setIsUserSpeaking] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isCameraOn, setIsCameraOn] = useState(false)
    const [currentTranscript, setCurrentTranscript] = useState("")
    const [aiResponse, setAiResponse] = useState("")
    const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false)
    const [isReconnecting, setIsReconnecting] = useState(false)
    const [isAIInterviewMode, setIsAIInterviewMode] = useState(false)
    const clientRef = useRef<RealtimeClient | null>(null)
    const transcriptBufferRef = useRef<string>("")
    const aiResponseBufferRef = useRef<string>("")
    const hasRequestedIntroRef = useRef(false)
    const isIntroducingRef = useRef(false)
    const pendingAgentSwitchRef = useRef<AIAgent | null>(null)
    const agentDropdownRef = useRef<HTMLDivElement>(null)
    const givenOverviewsRef = useRef<Set<string>>(new Set())
    const audioStreamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
      const initializeVoiceMode = async () => {
        try {
          const client = new RealtimeClient()

          client.onConnectionReady(() => {
            setIsConnecting(false)

            const systemInstructions = buildSystemPrompt(agentId, AI_AGENTS, true)

            client.sendMessage({
              type: "session.update",
              session: {
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.7,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 800,
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
                return
              }

              const userText = message.transcript
              const trimmedText = userText.trim()

              if (!trimmedText || trimmedText.length < 3) {
                return
              }

              const fillerWords = ["um", "uh", "hmm", "mm", "mhm", "uh-huh", "mm-hmm", "ah", "oh", "er", "erm"]
              const isFillerOnly = fillerWords.includes(trimmedText.toLowerCase())
              if (isFillerOnly) {
                return
              }

              transcriptBufferRef.current = userText
              setCurrentTranscript(userText)
              setIsListening(false)

              if (onCommandDetected) {
                const isCommand = await onCommandDetected(userText)
                if (isCommand) {
                  transcriptBufferRef.current = ""
                  setCurrentTranscript("")
                }
              }
            }

            if (message.type === "response.audio_transcript.delta") {
              if (!isSpeaking) {
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
                isIntroducingRef.current = false
              }

              if (transcriptBufferRef.current || finalAiText) {
                onTranscriptionUpdate(transcriptBufferRef.current, finalAiText)
              }

              transcriptBufferRef.current = ""
              aiResponseBufferRef.current = ""
              setCurrentTranscript("")
              setAiResponse("")
            }

            if (message.type === "response.done") {
              setTimeout(() => {
                setIsSpeaking(false)
                setIsListening(true)
              }, 1500)

              if (pendingAgentSwitchRef.current) {
                const agentToSwitch = pendingAgentSwitchRef.current
                pendingAgentSwitchRef.current = null

                setTimeout(async () => {
                  await performAgentSwitch(agentToSwitch)
                }, 3000)
              }
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

          if (client.audioStream) {
            audioStreamRef.current = client.audioStream
          }
        } catch (error) {
          console.error("[VoiceMode] Initialization error:", error)
          setIsConnecting(false)
        }
      }

      initializeVoiceMode()

      return () => {
        if (clientRef.current) {
          clientRef.current.disconnect()
          clientRef.current = null
        }
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop())
          audioStreamRef.current = null
        }
      }
    }, [agentId])

    useEffect(() => {
      if (clientRef.current && !isConnecting) {
        let systemInstructions = buildSystemPrompt(agentId, AI_AGENTS, true)

        const workspaceContext = formatWorkspaceContextForVoice(currentWorkspaceContent)
        if (workspaceContext && workspaceContext.trim().length > 0) {
          systemInstructions += workspaceContext
          systemInstructions +=
            "\n\n**CONTEXT-AWARE INSTRUCTIONS:**\n" +
            "- When the user asks questions about what they're viewing (pricing plans, jobs, candidates, etc.), use the workspace context above to provide accurate, specific answers.\n" +
            "- For pricing questions, be enthusiastic and persuasive while being helpful. Highlight the value proposition and benefits of upgrading.\n" +
            "- Keep explanations brief but compelling - focus on key benefits that matter most to the user's needs.\n"
        }

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
      setIsReconnecting(true)

      const loadingStartTime = Date.now()
      const minimumLoadingTime = 2000

      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }

      hasRequestedIntroRef.current = false
      isIntroducingRef.current = false
      setCurrentTranscript("")
      setAiResponse("")
      transcriptBufferRef.current = ""
      aiResponseBufferRef.current = ""
      setIsListening(false)
      setIsUserSpeaking(false)
      setIsSpeaking(false)

      onAgentChange(agent)

      await new Promise((resolve) => setTimeout(resolve, 500))

      const elapsedTime = Date.now() - loadingStartTime
      const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime)

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime))
      }

      setIsReconnecting(false)
    }

    const handleAgentChange = async (agent: AIAgent) => {
      if (agent.id === currentAgent.id) {
        setIsAgentDropdownOpen(false)
        return
      }

      setIsAgentDropdownOpen(false)
      await performAgentSwitch(agent)
    }

    const handleVerbalAgentSwitch = async (agent: AIAgent) => {
      pendingAgentSwitchRef.current = agent

      const confirmations = [
        `Let the user know you're switching them over to ${agent.firstName} now. Keep it brief and natural.`,
        `Tell the user you're connecting them with ${agent.firstName}. Keep it conversational.`,
        `Briefly confirm that you're switching them to ${agent.firstName}. Be natural and friendly.`,
        `Let them know you're getting ${agent.firstName} for them. Keep it short.`,
      ]

      const confirmationInstruction = confirmations[Math.floor(Math.random() * confirmations.length)]

      clientRef.current?.sendMessage({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: confirmationInstruction,
            },
          ],
        },
      })

      clientRef.current?.sendMessage({
        type: "response.create",
      })
    }

    const speakResponse = (text: string) => {
      if (!clientRef.current) {
        console.warn("[v0] Voice mode: Cannot speak response, client not connected")
        return
      }

      clientRef.current.sendMessage({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: `${text} Keep it brief and natural.`,
            },
          ],
        },
      })

      clientRef.current.sendMessage({
        type: "response.create",
      })
    }

    const activateAIInterview = () => {
      console.log("[v0] ===== ACTIVATING AI INTERVIEW MODE =====")

      setIsAIInterviewMode(true)
      console.log("[v0] isAIInterviewMode set to true")
      console.log("[v0] Component should now render DraggableVideoFeed")

      const interviewPrompt = `
You are now conducting an AI interview assessment.

Your role is to:
1. Welcome the candidate to the AI interview
2. Ask 3-5 relevant technical questions to assess their general programming and problem-solving skills
3. Ask follow-up questions based on their responses
4. Keep each question clear and focused
5. Be encouraging and professional throughout

Start by welcoming them and asking the first question. Keep your tone conversational and supportive.
`

      if (clientRef.current) {
        console.log("[v0] Updating session instructions for AI interview")
        clientRef.current.updateSessionInstructions(interviewPrompt)

        console.log("[v0] Sending interview start message to AI")
        clientRef.current.sendMessage({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Start the interview now.",
              },
            ],
          },
        })

        clientRef.current.sendMessage({
          type: "response.create",
        })
      }
    }

    useImperativeHandle(ref, () => ({
      handleVerbalAgentSwitch,
      speakResponse,
      activateAIInterview,
    }))

    const handleMicToggle = () => {
      const newMutedState = !isMuted
      setIsMuted(newMutedState)

      if (clientRef.current) {
        if (newMutedState) {
          clientRef.current.muteAudioInput()
        } else {
          clientRef.current.unmuteAudioInput()
        }
      }
    }

    const handleCameraToggle = () => {
      const newCameraState = !isCameraOn
      setIsCameraOn(newCameraState)

      if (newCameraState) {
        setIsAIInterviewMode(true)
      } else {
        setIsAIInterviewMode(false)
      }
    }

    const handleClose = () => {
      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop())
        audioStreamRef.current = null
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
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
          <div className="text-white">
            <p className="text-lg font-semibold">{agentName.split(" - ")[0]}</p>
            <p className="text-sm opacity-60">{agentName.split(" - ")[1]} AI Agent</p>
          </div>

          {!isAIInterviewMode && (
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
          )}
        </div>

        {isAIInterviewMode && (
          <DraggableVideoFeed
            isWorkspaceOpen={isWorkspaceOpen}
            onClose={() => {
              console.log("[v0] DraggableVideoFeed onClose called")
              setIsAIInterviewMode(false)
              setIsCameraOn(false)
              if (clientRef.current && !isConnecting) {
                const systemInstructions = buildSystemPrompt(agentId, AI_AGENTS, true)
                clientRef.current.updateSessionInstructions(systemInstructions)
              }
            }}
          />
        )}

        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <div
              className={`absolute w-64 h-64 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 overflow-hidden transition-all duration-300`}
              style={{
                boxShadow: isSpeaking
                  ? "0 0 80px 30px rgba(255, 255, 255, 0.6), 0 0 50px 15px rgba(255, 255, 255, 0.7), 0 0 25px 8px rgba(255, 255, 255, 0.8)"
                  : "none",
              }}
            >
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

            <div className="relative z-10 w-4 h-4 rounded-full bg-white/80" />
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={handleCameraToggle}
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${
              isCameraOn ? "bg-blue-500 border-blue-400 hover:bg-blue-600" : "border-white/30 hover:bg-white/10"
            }`}
            aria-label={isCameraOn ? "Turn camera off" : "Turn camera on"}
          >
            <Camera className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={handleMicToggle}
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${
              isMuted ? "bg-red-500 border-red-400 hover:bg-red-600" : "border-white/30 hover:bg-white/10"
            }`}
            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
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
    return ""
  }

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
      }
      break

    case "billing":
      context += `The user is viewing their Billing & Invoices workspace.\n\n`

      if (content.billingData) {
        const billing = content.billingData

        context += `**BILLING SUMMARY:**\n`
        context += `- Total Overdue: $${(billing.totalOverdue || 0).toFixed(2)}\n`
        context += `- Total Paid This Year: $${(billing.totalPaidThisYear || 0).toFixed(2)}\n`

        if (billing.nextPaymentDue) {
          context += `- Next Payment Due: $${billing.nextPaymentDue.amount.toFixed(2)} on ${billing.nextPaymentDue.dueDate}\n`
        }

        context += `\n**INVOICES (${billing.invoices.length} total):**\n\n`

        billing.invoices.forEach((invoice, index) => {
          context += `${index + 1}. Invoice ${invoice.invoiceNumber}\n`
          context += `   - Date: ${invoice.date}\n`
          context += `   - Amount: $${invoice.amount.toFixed(2)}\n`
          context += `   - Status: ${invoice.status}\n`
          context += `   - Due Date: ${invoice.dueDate}\n`
          if (invoice.description) {
            context += `   - Description: ${invoice.description}\n`
          }
          context += `\n`
        })

        context += `\nYou can answer questions about specific invoices, payment history, due dates, and help the user understand their billing details.\n`
      } else {
        context += "Billing data is not available.\n"
      }
      break

    case "contract":
      context += `The user is viewing the Service Agreement.\n\n`
      context += `**TEAMIFIED SERVICE AGREEMENT**\n\n`
      if (content.contractData) {
        const contract = content.contractData
        context += `**Contract Details:**\n`
        context += `- Title: ${contract.title}\n`
        context += `- Company: ${contract.parties.company}\n`
        context += `- Client: ${contract.parties.client}\n`
        context += `- Effective Date: ${contract.effectiveDate}\n`
        context += `- Term: ${contract.term}\n`
        context += `- Status: ${contract.status}\n\n`

        context += `**CONTRACT SECTIONS:**\n\n`

        contract.sections.forEach((section) => {
          context += `**${section.title}** (ID: ${section.id})\n`
          context += `${section.content}\n\n`

          if (section.subsections && section.subsections.length > 0) {
            section.subsections.forEach((subsection) => {
              context += `  **${subsection.title}** (ID: ${subsection.id})\n`
              context += `  ${subsection.content}\n\n`
            })
          }
        })

        if (contract.signatories && contract.signatories.length > 0) {
          context += `\n**SIGNATORIES:**\n`
          contract.signatories.forEach((signatory) => {
            context += `- ${signatory.name}, ${signatory.position} (Signed: ${signatory.date})\n`
          })
          context += `\n`
        }

        context += `\n**INSTRUCTIONS FOR ANSWERING CONTRACT QUESTIONS:**\n`
        context += `- When a user asks about specific contract terms (fees, termination, confidentiality, etc.), ALWAYS reference the relevant section by its ID in your response.\n`
        context += `- Format section references like this: "According to [Section IV.B]..." or "As stated in [Section I.C]..."\n`
        context += `- Put the section ID in square brackets so it can be detected and used for auto-scrolling.\n`
        context += `- Examples:\n`
        context += `  * For fees: Reference [Section IV.B] for pricing structure\n`
        context += `  * For termination: Reference [Section I.C] for client termination, [Section I.D] for breach termination\n`
        context += `  * For confidentiality: Reference [Section VI.A]\n`
        context += `  * For intellectual property: Reference [Section VI.B]\n`
        context += `  * For payment terms: Reference [Section IV.C]\n`
        context += `  * For personnel: Reference [Section III]\n`
        context += `- The contract workspace will automatically scroll to the section you reference when you use the [Section X] format.\n`
        context += `- You CAN navigate to sections - do not say you cannot. Just reference them in your response.\n`
      } else {
        context += "Contract data is not available."
      }
      break

    default:
      if (content.title) {
        context += `The user is viewing: ${content.title}\n`
      }
  }

  return context
}

function getAgentSystemPrompt(agentId: string, workspaceContent?: WorkspaceContent, userType?: string): string {
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
