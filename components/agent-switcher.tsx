"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { AI_AGENTS, type AIAgent } from "@/types/agents"

interface AgentSwitcherProps {
  activeAgent: AIAgent
  onAgentChange: (agent: AIAgent) => void
}

export function AgentSwitcher({ activeAgent, onAgentChange }: AgentSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition-all group"
        aria-label="Switch AI Agent"
      >
        <span className="text-2xl">{activeAgent.icon}</span>
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-foreground">{activeAgent.name}</div>
          <div className="text-xs text-muted-foreground hidden sm:block">{activeAgent.description}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
            {AI_AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  onAgentChange(agent)
                  setIsOpen(false)
                }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
              >
                <span className="text-2xl flex-shrink-0">{agent.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{agent.name}</span>
                    {activeAgent.id === agent.id && <Check className="w-4 h-4 text-[#A16AE8]" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
