"use server"

import { generateText } from "ai"
import { AI_AGENTS } from "@/types/agents"

const RESERVED_COMMANDS = [
  {
    command: "browse candidates",
    description: "Browse and swipe through candidate profiles",
    keywords: [
      "browse candidates",
      "see candidates",
      "look at candidates",
      "view candidates",
      "swipe candidates",
      "check candidates",
      "show me candidates",
      "show candidates",
      "open candidates",
    ],
  },
  {
    command: "job board",
    description: "View all available job positions",
    keywords: [
      "job board",
      "available jobs",
      "open positions",
      "see jobs",
      "view jobs",
      "job listings",
      "all jobs",
      "show me jobs",
      "show jobs",
      "open job board",
      "open jobs",
    ],
  },
  {
    command: "browse jobs",
    description: "Browse available unapplied jobs",
    keywords: [
      "browse jobs",
      "browse for jobs",
      "browse available jobs",
      "see available jobs",
      "view available jobs",
      "show available jobs",
      "look for jobs",
      "find jobs",
      "search jobs",
      "explore jobs",
      "discover jobs",
    ],
  },
  {
    command: "my jobs",
    description: "View jobs the user has applied to or saved",
    keywords: ["my jobs", "my applications", "applied jobs", "saved jobs", "my positions"],
  },
  {
    command: "data",
    description: "View analytics and data dashboard",
    keywords: ["data", "analytics", "dashboard", "statistics", "metrics", "insights", "reports", "show me data"],
  },
  {
    command: "compare jobs",
    description: "Compare multiple jobs side by side",
    keywords: [
      "compare jobs",
      "compare 2 jobs",
      "compare two jobs",
      "compare 3 jobs",
      "compare three jobs",
      "compare positions",
      "job comparison",
      "compare these jobs",
      "compare the jobs",
      "show job comparison",
      "view job comparison",
    ],
  },
  {
    command: "applied jobs",
    description: "Show applied jobs tab in job board",
    keywords: [
      "applied jobs",
      "show applied jobs",
      "view applied jobs",
      "see applied jobs",
      "my applied jobs",
      "jobs i applied to",
      "jobs i've applied to",
      "applications",
      "my applications",
      "show applications",
      "view applications",
      "open applied jobs",
      "open my applied jobs",
      "open applications",
    ],
  },
  {
    command: "invited jobs",
    description: "Show invited jobs tab in job board",
    keywords: [
      "invited jobs",
      "show invited jobs",
      "view invited jobs",
      "see invited jobs",
      "my invited jobs",
      "jobs i'm invited to",
      "invitations",
      "my invitations",
      "show invitations",
      "view invitations",
      "invited positions",
      "open invited jobs",
      "open my invited jobs",
      "open invitations",
      "open my invitations",
    ],
  },
  {
    command: "saved jobs",
    description: "Show saved jobs tab in job board",
    keywords: [
      "saved jobs",
      "show saved jobs",
      "view saved jobs",
      "see saved jobs",
      "my saved jobs",
      "jobs i saved",
      "jobs i've saved",
      "bookmarked jobs",
      "my bookmarks",
      "show saved",
      "view saved",
      "open saved jobs",
      "open my saved jobs",
      "open saved",
      "open bookmarks",
    ],
  },
  {
    command: "draft jobs",
    description: "Show draft jobs for hiring manager",
    keywords: [
      "draft jobs",
      "drafted jobs", // Added "drafted jobs" as alternative term
      "show draft jobs",
      "show drafted jobs", // Added variation with "drafted"
      "view draft jobs",
      "view drafted jobs", // Added variation with "drafted"
      "see draft jobs",
      "see drafted jobs", // Added variation with "drafted"
      "my draft jobs",
      "my drafted jobs", // Added variation with "drafted"
      "jobs in draft",
      "draft positions",
      "drafted positions", // Added variation with "drafted"
      "show drafts",
      "view drafts",
      "see drafts",
      "open draft jobs",
      "open my draft jobs",
      "open drafts",
    ],
  },
  {
    command: "open jobs",
    description: "Show open jobs for hiring manager",
    keywords: [
      "open jobs",
      "show open jobs",
      "view open jobs",
      "see open jobs",
      "my open jobs",
      "active jobs",
      "live jobs",
      "jobs accepting applications",
      "show active jobs",
      "view active jobs",
      "open my open jobs",
      "open active jobs",
    ],
  },
  {
    command: "closed jobs",
    description: "Show closed jobs for hiring manager",
    keywords: [
      "closed jobs",
      "show closed jobs",
      "view closed jobs",
      "see closed jobs",
      "my closed jobs",
      "completed jobs",
      "archived jobs",
      "filled positions",
      "show archived jobs",
      "view archived jobs",
      "open closed jobs",
      "open my closed jobs",
      "open archived jobs",
    ],
  },
  {
    command: "pricing plans",
    description: "Show pricing plans and subscription options",
    keywords: [
      "pricing plans",
      "pricing",
      "plans",
      "subscription plans",
      "subscriptions",
      "upgrade",
      "upgrade plan",
      "upgrade my plan",
      "change plan",
      "change my plan",
      "pricing options",
      "plan options",
      "show pricing",
      "view pricing",
      "see pricing",
      "show plans",
      "view plans",
      "see plans",
      "what plans",
      "available plans",
      "subscription options",
      "how much",
      "cost",
      "price",
      "fees",
      "premium",
      "premium plan",
      "enterprise plan",
      "what's included",
      "plan inclusions",
      "plan features",
      "plan benefits",
    ],
  },
  ...AI_AGENTS.map((agent) => ({
    command: `switch to ${agent.firstName.toLowerCase()}`,
    description: `Switch to ${agent.firstName} - ${agent.name}`,
    keywords: [
      // Direct switching
      `switch to ${agent.firstName.toLowerCase()}`,
      `talk to ${agent.firstName.toLowerCase()}`,
      `speak to ${agent.firstName.toLowerCase()}`,
      `speak with ${agent.firstName.toLowerCase()}`,
      `connect me with ${agent.firstName.toLowerCase()}`,
      `connect me to ${agent.firstName.toLowerCase()}`,
      `get me ${agent.firstName.toLowerCase()}`,
      // Past tense variations
      `i want to talk to ${agent.firstName.toLowerCase()}`,
      `i want to speak to ${agent.firstName.toLowerCase()}`,
      `i want to speak with ${agent.firstName.toLowerCase()}`,
      `i wanted to talk to ${agent.firstName.toLowerCase()}`,
      `i wanted to speak to ${agent.firstName.toLowerCase()}`,
      `i wanted to speak with ${agent.firstName.toLowerCase()}`,
      `i'd like to talk to ${agent.firstName.toLowerCase()}`,
      `i'd like to speak to ${agent.firstName.toLowerCase()}`,
      `i'd like to speak with ${agent.firstName.toLowerCase()}`,
      // Question forms
      `can i talk to ${agent.firstName.toLowerCase()}`,
      `can i speak to ${agent.firstName.toLowerCase()}`,
      `can i speak with ${agent.firstName.toLowerCase()}`,
      `could i talk to ${agent.firstName.toLowerCase()}`,
      `could i speak to ${agent.firstName.toLowerCase()}`,
      // Role-based keywords for all agents
      ...(agent.id === "account-manager"
        ? [
            "talk to the account manager",
            "speak to the account manager",
            "switch to the account manager",
            "i want to talk to the account manager",
            "i wanted to talk to the account manager",
            "connect me with the account manager",
          ]
        : []),
      ...(agent.id === "technical-recruiter"
        ? [
            "talk to the recruiter",
            "speak to the recruiter",
            "switch to the recruiter",
            "talk to the technical recruiter",
            "speak to the technical recruiter",
            "i want to talk to the recruiter",
            "i wanted to talk to the recruiter",
            "connect me with the recruiter",
          ]
        : []),
      ...(agent.id === "hr-manager"
        ? [
            "talk to the hr manager",
            "speak to the hr manager",
            "switch to the hr manager",
            "talk to hr",
            "speak to hr",
            "i want to talk to the hr manager",
            "i wanted to talk to the hr manager",
            "connect me with the hr manager",
          ]
        : []),
      ...(agent.id === "sales-marketing"
        ? [
            "talk to the sales agent",
            "speak to the sales agent",
            "switch to the sales agent",
            "talk to sales",
            "speak to sales",
            "talk to marketing",
            "speak to marketing",
            "talk to the marketing agent",
            "speak to the marketing agent",
            "i want to talk to sales",
            "i wanted to talk to sales",
            "i want to talk to marketing",
            "i wanted to talk to marketing",
            "connect me with sales",
            "connect me with marketing",
          ]
        : []),
      ...(agent.id === "financial-controller"
        ? [
            "talk to the financial controller",
            "speak to the financial controller",
            "switch to the financial controller",
            "talk to finance",
            "speak to finance",
            "talk to the finance controller",
            "speak to the finance controller",
            "talk to accounting",
            "speak to accounting",
            "i want to talk to finance",
            "i wanted to talk to finance",
            "i want to talk to the financial controller",
            "i wanted to talk to the financial controller",
            "connect me with finance",
            "connect me with the financial controller",
          ]
        : []),
    ],
  })),
]

function fuzzyMatchAgentName(input: string): string | null {
  const normalizedInput = input.toLowerCase().trim()

  console.log("[v0] Fuzzy matching input:", normalizedInput)

  // Extract potential name from phrases like "I want to speak to Darlene"
  const nameExtractionPatterns = [
    /(?:talk to|speak to|speak with|switch to|connect (?:me )?(?:with|to)|get me)\s+(.+)/i,
    /(?:i want to|i wanted to|i'd like to)\s+(?:talk to|speak to|speak with)\s+(.+)/i,
    /(?:can i|could i)\s+(?:talk to|speak to|speak with)\s+(.+)/i,
  ]

  let extractedName = normalizedInput
  for (const pattern of nameExtractionPatterns) {
    const match = normalizedInput.match(pattern)
    if (match && match[1]) {
      extractedName = match[1].trim()
      console.log("[v0] Extracted name from pattern:", extractedName)
      break
    }
  }

  extractedName = extractedName
    .replace(/[?!.,;:]/g, "") // Remove punctuation
    .replace(/\b(the|agent|our)\b/gi, "") // Remove common words
    .trim()

  console.log("[v0] Cleaned extracted name:", extractedName)

  // Direct name matching with typo tolerance
  for (const agent of AI_AGENTS) {
    const firstName = agent.firstName.toLowerCase()

    // Exact match
    if (extractedName === firstName) {
      console.log("[v0] Exact match found:", agent.firstName)
      return agent.firstName.toLowerCase()
    }

    // Check if input contains the name
    if (extractedName.includes(firstName) || firstName.includes(extractedName)) {
      console.log("[v0] Partial match found:", agent.firstName)
      return agent.firstName.toLowerCase()
    }

    // Simple Levenshtein distance for typos (e.g., "Darlene" → "Darlyn", "Lorenz" → "Lawrence")
    const distance = levenshteinDistance(extractedName, firstName)
    console.log(`[v0] Levenshtein distance between "${extractedName}" and "${firstName}":`, distance)
    if (distance <= 2) {
      console.log("[v0] Fuzzy match found:", agent.firstName)
      return agent.firstName.toLowerCase()
    }
  }

  // Role-based matching
  if (normalizedInput.includes("account") || (normalizedInput.includes("manager") && !normalizedInput.includes("hr"))) {
    const accountManager = AI_AGENTS.find((a) => a.id === "account-manager")
    console.log("[v0] Role-based match: account manager")
    return accountManager?.firstName.toLowerCase() || null
  }

  if (normalizedInput.includes("recruit") || normalizedInput.includes("technical")) {
    const recruiter = AI_AGENTS.find((a) => a.id === "technical-recruiter")
    console.log("[v0] Role-based match: recruiter")
    return recruiter?.firstName.toLowerCase() || null
  }

  if (normalizedInput.includes("hr") || normalizedInput.includes("human resource")) {
    const hrManager = AI_AGENTS.find((a) => a.id === "hr-manager")
    console.log("[v0] Role-based match: hr manager")
    return hrManager?.firstName.toLowerCase() || null
  }

  if (normalizedInput.includes("sales") || normalizedInput.includes("marketing")) {
    const salesMarketing = AI_AGENTS.find((a) => a.id === "sales-marketing")
    console.log("[v0] Role-based match: sales/marketing")
    return salesMarketing?.firstName.toLowerCase() || null
  }

  if (
    normalizedInput.includes("finance") ||
    normalizedInput.includes("financial") ||
    normalizedInput.includes("controller") ||
    normalizedInput.includes("accounting")
  ) {
    const financialController = AI_AGENTS.find((a) => a.id === "financial-controller")
    console.log("[v0] Role-based match: financial controller")
    return financialController?.firstName.toLowerCase() || null
  }

  console.log("[v0] No fuzzy match found")
  return null
}

// Simple Levenshtein distance implementation for typo detection
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

function fuzzyMatchNavigationCommand(input: string): { command: string; confidence: number } | null {
  const normalizedInput = input.toLowerCase().trim()

  // Convert "OpenMyInvitedJobs" to "open my invited jobs"
  const splitCamelCase = (str: string): string => {
    return str
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // Handle consecutive capitals
      .toLowerCase()
  }

  const processedInput = splitCamelCase(normalizedInput)
  console.log("[v0] Processed input (camelCase split):", processedInput)

  const navigationMappings = [
    {
      command: "job board",
      variations: ["job board", "jump board", "job bored", "job port", "job boards", "jobs board"],
    },
    {
      command: "browse candidates",
      variations: ["browse candidates", "browse candidate", "brows candidates", "browse can dates", "candidate browse"],
    },
    {
      command: "my jobs",
      variations: ["my jobs", "my job", "my jabs", "my applications", "my apps"],
    },
    {
      command: "data",
      variations: ["data", "date a", "data dashboard", "analytics", "dashboard"],
    },
    {
      command: "applied jobs",
      variations: [
        "applied jobs",
        "applied job",
        "apply jobs", // Added common speech recognition error
        "apply jumps", // Added common speech recognition error
        "applied jumps", // Added common speech recognition error
        "show applied jobs",
        "view applied jobs",
        "see applied jobs",
        "my applied jobs",
        "jobs i applied to",
        "jobs i've applied to",
        "applications",
        "my applications",
        "show applications",
        "view applications",
        "open applied jobs",
        "open my applied jobs",
        "open applications",
      ],
    },
    {
      command: "invited jobs",
      variations: [
        "invited jobs",
        "invited job",
        "invite jobs",
        "invites",
        "show invited jobs",
        "view invited jobs",
        "see invited jobs",
        "my invited jobs",
        "jobs i'm invited to",
        "invitations",
        "my invitations",
        "show invitations",
        "view invitations",
        "invited positions",
        "open invited jobs",
        "open my invited jobs",
        "open invitations",
        "open my invitations",
      ],
    },
    {
      command: "saved jobs",
      variations: [
        "saved jobs",
        "saved job",
        "save jobs",
        "safe jobs", // Common speech recognition error
        "same jobs", // Common speech recognition error
        "team jobs", // Added common speech recognition error
        "same jumps", // Added common speech recognition error
        "safe jumps", // Added common speech recognition error
        "saved jumps", // Added common speech recognition error
        "saved", // Short form
        "show saved jobs",
        "view saved jobs",
        "see saved jobs",
        "my saved jobs",
        "jobs i saved",
        "jobs i've saved",
        "bookmarked jobs",
        "my bookmarks",
        "show saved",
        "view saved",
        "open saved jobs",
        "open my saved jobs",
        "open saved",
        "open bookmarks",
      ],
    },
    {
      command: "browse jobs",
      variations: [
        "browse jobs",
        "browse for jobs",
        "browse available jobs",
        "see available jobs",
        "view available jobs",
        "show available jobs",
        "look for jobs",
        "find jobs",
        "search jobs",
        "explore jobs",
        "discover jobs",
        "open browse jobs",
        "open available jobs",
      ],
    },
    {
      command: "draft jobs",
      variations: [
        "draft jobs",
        "drafted jobs",
        "show draft jobs",
        "show drafted jobs",
        "view draft jobs",
        "view drafted jobs",
        "see draft jobs",
        "see drafted jobs",
        "my draft jobs",
        "my drafted jobs",
        "jobs in draft",
        "draft positions",
        "drafted positions",
        "show drafts",
        "view drafts",
        "see drafts",
        "open draft jobs",
        "open my draft jobs",
        "open drafts",
      ],
    },
    {
      command: "open jobs",
      variations: [
        "open jobs",
        "show open jobs",
        "view open jobs",
        "see open jobs",
        "my open jobs",
        "active jobs",
        "live jobs",
        "jobs accepting applications",
        "show active jobs",
        "view active jobs",
        "open my open jobs",
        "open active jobs",
      ],
    },
    {
      command: "closed jobs",
      variations: [
        "closed jobs",
        "show closed jobs",
        "view closed jobs",
        "see closed jobs",
        "my closed jobs",
        "completed jobs",
        "archived jobs",
        "filled positions",
        "show archived jobs",
        "view archived jobs",
        "open closed jobs",
        "open my closed jobs",
        "open archived jobs",
      ],
    },
    {
      command: "compare jobs",
      variations: [
        "compare jobs",
        "compare 2 jobs",
        "compare two jobs",
        "compare 3 jobs",
        "compare three jobs",
        "compare positions",
        "job comparison",
        "compare these jobs",
        "compare the jobs",
        "show job comparison",
        "view job comparison",
      ],
    },
    {
      command: "pricing plans",
      variations: [
        "pricing plans",
        "pricing",
        "plans",
        "subscription plans",
        "subscriptions",
        "upgrade",
        "upgrade plan",
        "upgrade my plan",
        "change plan",
        "change my plan",
        "pricing options",
        "plan options",
        "show pricing",
        "view pricing",
        "see pricing",
        "show plans",
        "view plans",
        "see plans",
        "what plans",
        "available plans",
        "subscription options",
        "how much",
        "cost",
        "price",
        "fees",
        "premium",
        "premium plan",
        "enterprise plan",
        "what's included",
        "plan inclusions",
        "plan features",
        "plan benefits",
      ],
    },
  ]

  // Remove common filler words and phrases
  const fillerWords = [
    "how about",
    "what about",
    "can you",
    "could you",
    "show me",
    "let me see",
    "i want to see",
    "open",
    "the",
  ]
  let cleanedInput = processedInput // Use processedInput instead of normalizedInput
  for (const filler of fillerWords) {
    cleanedInput = cleanedInput.replace(new RegExp(`\\b${filler}\\b`, "g"), " ")
  }
  cleanedInput = cleanedInput.replace(/\s+/g, " ").trim()

  console.log("[v0] Cleaned input for fuzzy matching:", cleanedInput)

  for (const mapping of navigationMappings) {
    for (const variation of mapping.variations) {
      // Check if the variation appears in the original input
      if (normalizedInput.includes(variation)) {
        return { command: mapping.command, confidence: 0.95 }
      }

      // Check if the variation appears in the processed input (camelCase split)
      if (processedInput.includes(variation)) {
        console.log(`[v0] Match found in processed input: "${processedInput}" contains "${variation}"`)
        return { command: mapping.command, confidence: 0.95 }
      }

      // Check if the variation appears in the cleaned input
      if (cleanedInput.includes(variation)) {
        return { command: mapping.command, confidence: 0.9 }
      }

      // Check Levenshtein distance for typos on cleaned input
      const distance = levenshteinDistance(cleanedInput, variation)
      if (distance <= 2 && cleanedInput.length > 3) {
        console.log(`[v0] Fuzzy match found: "${cleanedInput}" ≈ "${variation}" (distance: ${distance})`)
        return { command: mapping.command, confidence: 0.85 }
      }
    }
  }

  return null
}

export async function detectCommandIntent(userInput: string): Promise<{
  isCommand: boolean
  command?: string
  confidence: number
  jobTitle?: string // Added jobTitle for job-specific commands
}> {
  console.log("[v0] detectCommandIntent called with:", userInput)

  const normalizedInput = userInput.toLowerCase().trim()

  if (normalizedInput.length < 3) {
    console.log("[v0] Input too short, skipping command detection")
    return {
      isCommand: false,
      confidence: 0,
    }
  }

  // Check fuzzy navigation match first
  const fuzzyNavMatch = fuzzyMatchNavigationCommand(normalizedInput)
  if (fuzzyNavMatch) {
    console.log("[v0] Fuzzy navigation match found:", fuzzyNavMatch.command)
    return {
      isCommand: true,
      command: fuzzyNavMatch.command,
      confidence: fuzzyNavMatch.confidence,
    }
  }

  // Check keyword matches for navigation commands
  for (const cmd of RESERVED_COMMANDS) {
    for (const keyword of cmd.keywords) {
      if (normalizedInput.includes(keyword)) {
        console.log("[v0] Keyword match found:", keyword, "→", cmd.command)
        return {
          isCommand: true,
          command: cmd.command,
          confidence: 0.95,
        }
      }
    }
  }

  // Check for job-specific patterns AFTER ruling out navigation commands
  const jobRequestPatterns = [
    /tell me (?:more )?about (?:the )?(.+?)(?:\s+(?:position|role|job))?$/i,
    /(?:details|info|information) (?:on|about|for) (?:the )?(.+?)(?:\s+(?:position|role|job))?$/i,
    /(?:i want to|i'd like to|can you) (?:see|view|know about|learn about) (?:the )?(.+?)(?:\s+(?:position|role|job))?$/i,
  ]

  const navigationExclusions = [
    "job board",
    "jump board",
    "candidates",
    "data",
    "dashboard",
    "analytics",
    "my jobs",
    "applied jobs",
    "saved jobs",
    "invited jobs",
    "browse jobs",
    "available jobs",
    "open positions",
    "draft jobs",
    "open jobs",
    "closed jobs",
    "compare jobs",
    "pricing plans",
    "pricing",
    "plans",
    "subscription plans",
    "subscriptions",
    "upgrade",
    "upgrade plan",
    "upgrade my plan",
    "change plan",
    "change my plan",
    "pricing options",
    "plan options",
    "show pricing",
    "view pricing",
    "see pricing",
    "show plans",
    "view plans",
    "see plans",
    "what plans",
    "available plans",
    "subscription options",
    "how much",
    "cost",
    "price",
    "fees",
    "premium",
    "premium plan",
    "enterprise plan",
    "what's included",
    "plan inclusions",
    "plan features",
    "plan benefits",
  ]

  for (const pattern of jobRequestPatterns) {
    const match = normalizedInput.match(pattern)
    if (match && match[1]) {
      const potentialJobTitle = match[1].trim()

      // Check if it's a navigation command in disguise
      const isNavigationCommand = navigationExclusions.some((exclusion) => potentialJobTitle.includes(exclusion))

      // Only consider it a job request if:
      // 1. It's not a navigation command
      // 2. It's longer than 3 characters
      // 3. It contains typical job title words (engineer, developer, manager, etc.)
      const hasJobTitleWords =
        /engineer|developer|manager|designer|analyst|specialist|coordinator|director|lead|senior|junior|intern/i.test(
          potentialJobTitle,
        )

      if (!isNavigationCommand && potentialJobTitle.length > 3 && hasJobTitleWords) {
        console.log("[v0] Job-specific request detected:", potentialJobTitle)
        return {
          isCommand: true,
          command: "view job",
          confidence: 0.9,
          jobTitle: potentialJobTitle,
        }
      }
    }
  }

  const switchingKeywords = [
    "talk to",
    "speak to",
    "speak with",
    "switch to",
    "connect",
    "want to talk",
    "want to speak",
    "wanted to talk",
    "wanted to speak",
    "like to talk",
    "like to speak",
    "can i talk",
    "can i speak",
    "could i talk",
    "could i speak",
    "get me",
  ]

  const hasSwitchingKeyword = switchingKeywords.some((keyword) => normalizedInput.includes(keyword))

  if (hasSwitchingKeyword) {
    console.log("[v0] Switching keyword detected, attempting fuzzy agent name matching")
    const fuzzyAgentName = fuzzyMatchAgentName(normalizedInput)
    console.log("[v0] Fuzzy agent name result:", fuzzyAgentName)

    if (fuzzyAgentName) {
      console.log("[v0] Agent switch command detected:", `switch to ${fuzzyAgentName}`)
      return {
        isCommand: true,
        command: `switch to ${fuzzyAgentName}`,
        confidence: 0.9,
      }
    }
  } else {
    console.log("[v0] No switching keywords detected, skipping fuzzy agent name matching")
  }

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a command intent detector. Analyze the user's input and determine if it matches any of these reserved commands:

${RESERVED_COMMANDS.map((cmd) => `- "${cmd.command}": ${cmd.description}`).join("\n")}

User input: "${userInput}"

Respond with ONLY a JSON object in this exact format:
{
  "isCommand": true/false,
  "command": "exact command name" or null,
  "confidence": 0.0 to 1.0
}

**IMPORTANT RULES:**
- Return isCommand: true if the user is requesting a command with action words like "open", "show", "view", "browse"
- If the user is just having a casual conversation without requesting action, return isCommand: false
- Gibberish or unclear input should return isCommand: false with low confidence
- Be reasonable - clear requests should be detected even if not perfectly phrased

Examples of COMMANDS (isCommand: true):
- "Can you open the job board?" → {"isCommand": true, "command": "job board", "confidence": 0.9}
- "Show me the candidates" → {"isCommand": true, "command": "browse candidates", "confidence": 0.9}
- "I want to see jobs" → {"isCommand": true, "command": "job board", "confidence": 0.85}

Examples of NOT COMMANDS (isCommand: false):
- "Tell me about candidates" → {"isCommand": false, "command": null, "confidence": 0.3}
- "What is a job board?" → {"isCommand": false, "command": null, "confidence": 0.3}
- "asdf" → {"isCommand": false, "command": null, "confidence": 0.0}`,
    })

    let cleanedText = text.trim()

    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```(?:json)?\s*\n?/, "")
      cleanedText = cleanedText.replace(/\n?```\s*$/, "")
      cleanedText = cleanedText.trim()
    }

    const result = JSON.parse(cleanedText)

    if (result.isCommand && result.confidence >= 0.7) {
      return {
        isCommand: true,
        command: result.command,
        confidence: result.confidence,
      }
    }

    return {
      isCommand: false,
      confidence: result.confidence || 0,
    }
  } catch (error) {
    console.error("[v0] Error detecting command intent:", error)
    return {
      isCommand: false,
      confidence: 0,
    }
  }
}
