export interface ConversationMessage {
  sender: "hiring_manager" | "candidate"
  content: string
  timestamp: string
}

export interface CandidateConversation {
  candidateId: string
  candidateName: string
  messages: ConversationMessage[]
}

const conversations: CandidateConversation[] = [
  // Sarah Chen - Professional, enthusiastic, detail-oriented
  {
    candidateId: "cand-1",
    candidateName: "Sarah Chen",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hi Sarah, I came across your profile and was really impressed by your experience leading the microservices migration at your previous company. Would you be interested in discussing our Senior Full-Stack Developer position?",
        timestamp: "March 12, 2024 - 9:15 AM",
      },
      {
        sender: "candidate",
        content:
          "Thank you for reaching out! I'm definitely interested. The microservices project was one of my proudest achievements - we reduced deployment time by 70% and improved system reliability significantly. I'd love to learn more about the role and your tech stack.",
        timestamp: "March 12, 2024 - 10:30 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's impressive! We're building a modern SaaS platform using React, Node.js, and AWS. We're looking for someone who can help architect scalable solutions and mentor junior developers. Does that align with your interests?",
        timestamp: "March 12, 2024 - 2:45 PM",
      },
      {
        sender: "candidate",
        content:
          "I've been working with that exact stack for the past 4 years, and I really enjoy mentoring - I currently lead a team of 5 developers. I'd be happy to complete any technical assessments you have.",
        timestamp: "March 12, 2024 - 3:20 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you our take-home challenge. It should take about 3-4 hours. Take your time and feel free to ask any questions.",
        timestamp: "March 13, 2024 - 11:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Just submitted my solution! I added comprehensive tests and documentation. I also included some performance optimizations that weren't required but I thought would be valuable. Looking forward to your feedback!",
        timestamp: "March 15, 2024 - 8:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Wow, I just reviewed your submission - this is excellent work! The code quality is outstanding and I love the bonus optimizations. Let's schedule a call to discuss next steps. Are you available this week?",
        timestamp: "March 16, 2024 - 10:15 AM",
      },
      {
        sender: "candidate",
        content:
          "Thank you! I'm available Thursday or Friday afternoon. I'm really excited about this opportunity and would love to discuss how I can contribute to your team.",
        timestamp: "March 16, 2024 - 11:45 AM",
      },
    ],
  },
  // Michael Rodriguez - Friendly, eager, learning-focused
  {
    candidateId: "cand-2",
    candidateName: "Michael Rodriguez",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hi Michael, your portfolio caught my attention - the e-commerce project you built looks really polished. We have a Full-Stack Engineer position that might be a great fit. Interested in learning more?",
        timestamp: "March 10, 2024 - 3:30 PM",
      },
      {
        sender: "candidate",
        content:
          "Hi! Yes, I'm very interested! That e-commerce project was a lot of fun to build. I learned so much about state management and API integration. What technologies does your team use?",
        timestamp: "March 10, 2024 - 4:15 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "We primarily use React, Node.js, and MongoDB. We're also starting to adopt TypeScript across the codebase. How comfortable are you with TypeScript?",
        timestamp: "March 11, 2024 - 9:00 AM",
      },
      {
        sender: "candidate",
        content:
          "I've been using TypeScript for about a year now and I really love it! The type safety has saved me from so many bugs. I'm always eager to learn new things and improve my skills.",
        timestamp: "March 11, 2024 - 9:45 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Great attitude! Let's move forward with a coding challenge. It's a real-world scenario similar to what you'd work on here. No time pressure - take a few days if you need.",
        timestamp: "March 11, 2024 - 2:00 PM",
      },
      {
        sender: "candidate",
        content:
          "Sounds good! I'll get started on it this evening. Quick question - are there any specific patterns or best practices you'd like me to follow?",
        timestamp: "March 11, 2024 - 2:30 PM",
      },
      {
        sender: "hiring_manager",
        content: "Just write clean, maintainable code and include some tests. We value code quality over speed.",
        timestamp: "March 11, 2024 - 3:15 PM",
      },
      {
        sender: "candidate",
        content:
          "Done! I submitted my solution. I tried to follow best practices and added unit tests for the main components. Hope you like it!",
        timestamp: "March 14, 2024 - 6:45 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Nice work! The implementation is solid. I have a few questions about your approach - let's schedule a call to discuss. How's Wednesday afternoon?",
        timestamp: "March 15, 2024 - 11:30 AM",
      },
      {
        sender: "candidate",
        content: "Wednesday works perfectly! I'm looking forward to it.",
        timestamp: "March 15, 2024 - 12:00 PM",
      },
    ],
  },
  // Priya Sharma - Technical, precise, backend-focused
  {
    candidateId: "cand-3",
    candidateName: "Priya Sharma",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hello Priya, I noticed your extensive experience with distributed systems and microservices. We're building a high-scale platform and could use someone with your expertise. Would you be open to discussing our Software Engineer position?",
        timestamp: "March 8, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Hello, thank you for reaching out. I'm interested in learning more about the technical challenges you're facing. Could you provide details about your current architecture and the scale you're operating at?",
        timestamp: "March 8, 2024 - 2:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "We're processing about 10M requests per day across multiple microservices. Currently using Node.js, PostgreSQL, and Redis. We're looking to optimize our database queries and improve system reliability.",
        timestamp: "March 9, 2024 - 9:15 AM",
      },
      {
        sender: "candidate",
        content:
          "That's an interesting scale. I have experience optimizing PostgreSQL for high-throughput scenarios and implementing caching strategies with Redis. What's your current database indexing strategy?",
        timestamp: "March 9, 2024 - 10:45 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "We have basic indexes but haven't done a comprehensive optimization pass. This is exactly the kind of expertise we need. Would you be willing to complete a technical assessment?",
        timestamp: "March 9, 2024 - 3:00 PM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I can do that. Please send over the requirements. I prefer challenges that focus on system design and backend optimization.",
        timestamp: "March 9, 2024 - 4:20 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect, I'm sending you a challenge that involves designing a scalable API with database optimization. Take your time with it.",
        timestamp: "March 10, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "I've completed the challenge. I focused on database schema design, query optimization, and implemented a caching layer. I've also included performance benchmarks in my documentation.",
        timestamp: "March 13, 2024 - 7:15 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Excellent work on the backend implementation! The database design is particularly strong. Let's schedule a technical discussion to dive deeper into your approach.",
        timestamp: "March 14, 2024 - 11:00 AM",
      },
      {
        sender: "candidate",
        content:
          "I'm available Monday or Tuesday next week. I can walk through my architectural decisions and discuss potential improvements.",
        timestamp: "March 14, 2024 - 2:30 PM",
      },
    ],
  },
  // James Wilson - Creative, design-focused, enthusiastic about UX
  {
    candidateId: "cand-4",
    candidateName: "James Wilson",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hi James, your portfolio is stunning! The animations and attention to detail really stand out. We're looking for a Frontend Developer who cares deeply about user experience. Interested?",
        timestamp: "March 14, 2024 - 11:30 AM",
      },
      {
        sender: "candidate",
        content:
          "Thank you so much! I'm definitely interested! I'm passionate about creating delightful user experiences. What kind of products are you building?",
        timestamp: "March 14, 2024 - 1:45 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "We're building a SaaS platform for project management. We need someone who can create intuitive, accessible interfaces that users love. Your focus on accessibility really impressed me.",
        timestamp: "March 14, 2024 - 3:00 PM",
      },
      {
        sender: "candidate",
        content:
          "That sounds amazing! Accessibility is so important to me - I always test with screen readers and ensure keyboard navigation works perfectly. I'd love to contribute to making your platform accessible to everyone.",
        timestamp: "March 14, 2024 - 3:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's exactly what we need! I'd like to see how you approach a design challenge. I'll send you a Figma mockup and ask you to implement it with React. Sound good?",
        timestamp: "March 15, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Perfect! I love working from designs. Should I focus on pixel-perfect implementation or is there room for creative interpretation?",
        timestamp: "March 15, 2024 - 10:30 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Pixel-perfect is great, but we also value your creative input. If you see opportunities to improve the UX, feel free to suggest them!",
        timestamp: "March 15, 2024 - 11:00 AM",
      },
      {
        sender: "candidate",
        content:
          "I'm still working on the challenge - I want to make sure the animations are smooth and the component is fully accessible. Should have it ready by tomorrow!",
        timestamp: "March 17, 2024 - 5:30 PM",
      },
      {
        sender: "hiring_manager",
        content: "No rush! Take your time to make it great. Looking forward to seeing what you create.",
        timestamp: "March 17, 2024 - 6:00 PM",
      },
    ],
  },
  // Elena Popescu - Experienced, professional, security-conscious
  {
    candidateId: "cand-5",
    candidateName: "Elena Popescu",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hello Elena, your background in fintech and e-commerce is exactly what we're looking for. We're building a payment platform and need someone with your security expertise. Do you have time to discuss our Full-Stack Developer position?",
        timestamp: "March 11, 2024 - 2:00 PM",
      },
      {
        sender: "candidate",
        content:
          "Hello, I'm interested. I have 7 years of experience building secure payment systems and I'm well-versed in PCI compliance. What payment methods are you planning to support?",
        timestamp: "March 11, 2024 - 4:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "We're starting with Stripe but plan to add multiple payment gateways. Security is our top priority. Your experience with payment integration and security best practices is exactly what we need.",
        timestamp: "March 12, 2024 - 9:00 AM",
      },
      {
        sender: "candidate",
        content:
          "I've integrated Stripe, PayPal, and several European payment methods in my previous roles. I always implement proper encryption, secure token handling, and comprehensive audit logging. What's your current security infrastructure?",
        timestamp: "March 12, 2024 - 10:15 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "We're building it from the ground up, which is why we need someone with your expertise. Would you be willing to complete a technical challenge focused on secure API design?",
        timestamp: "March 12, 2024 - 2:30 PM",
      },
      {
        sender: "candidate",
        content: "I'll approach it with production-grade security practices. When do you need it completed?",
        timestamp: "March 12, 2024 - 3:00 PM",
      },
      {
        sender: "hiring_manager",
        content: "By end of week would be great, but take the time you need to do it properly.",
        timestamp: "March 12, 2024 - 3:15 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I implemented OAuth 2.0 authentication, encrypted sensitive data at rest and in transit, added rate limiting, and included comprehensive error handling. The documentation covers security considerations and potential vulnerabilities to watch for.",
        timestamp: "March 15, 2024 - 9:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "This is exceptional work! The security implementation is exactly what we need. Your documentation is thorough and shows deep understanding. Let's schedule a call to discuss the role in detail and talk about compensation.",
        timestamp: "March 16, 2024 - 10:30 AM",
      },
      {
        sender: "candidate",
        content:
          "Thank you. I'm available this week. I'm particularly interested in understanding your long-term technical roadmap and how this role would evolve.",
        timestamp: "March 16, 2024 - 11:00 AM",
      },
    ],
  },
]

export function getCandidateConversation(candidateId: string, candidateName?: string): ConversationMessage[] {
  const conversation = conversations.find((conv) => conv.candidateId === candidateId)

  if (!conversation && candidateName) {
    const nameToConversationId: Record<string, string> = {
      "Sarah Chen": "cand-1",
      "Michael Rodriguez": "cand-2",
      "Priya Sharma": "cand-3",
      "James Wilson": "cand-4",
      "Elena Popescu": "cand-5",
    }

    const conversationId = nameToConversationId[candidateName]
    if (conversationId) {
      return conversations.find((conv) => conv.candidateId === conversationId)?.messages || []
    }
  }

  return conversation?.messages || []
}

export function saveCandidateMessage(
  candidateId: string,
  candidateName: string,
  sender: "hiring_manager" | "candidate",
  content: string,
): void {
  let conversation = conversations.find((conv) => conv.candidateId === candidateId)

  // If conversation doesn't exist, create a new one
  if (!conversation) {
    conversation = {
      candidateId,
      candidateName,
      messages: [],
    }
    conversations.push(conversation)
  }

  // Add the new message
  const timestamp = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  conversation.messages.push({
    sender,
    content,
    timestamp,
  })
}

export function getCandidateProfile(candidateId: string, candidateName?: string) {
  // Map candidate names to their profiles
  const candidateProfiles: Record<string, any> = {
    "cand-1": {
      name: "Sarah Chen",
      title: "Senior Full-Stack Developer",
      experience: "6 years",
      personality: "Professional, enthusiastic, detail-oriented, loves mentoring",
      skills: ["React", "Node.js", "AWS", "Microservices", "Team Leadership"],
      background: "Led microservices migration, reduced deployment time by 70%, manages team of 5 developers",
    },
    "cand-2": {
      name: "Michael Rodriguez",
      title: "Full-Stack Engineer",
      experience: "3 years",
      personality: "Friendly, eager to learn, positive attitude, growth-focused",
      skills: ["React", "Node.js", "MongoDB", "TypeScript", "E-commerce"],
      background: "Built polished e-commerce projects, loves learning new technologies, values code quality",
    },
    "cand-3": {
      name: "Priya Sharma",
      title: "Software Engineer",
      experience: "8 years",
      personality: "Technical, precise, backend-focused, analytical",
      skills: ["Distributed Systems", "PostgreSQL", "Redis", "Node.js", "System Design"],
      background: "Expert in database optimization, high-scale systems (10M+ requests/day), performance benchmarking",
    },
    "cand-4": {
      name: "James Wilson",
      title: "Frontend Developer",
      experience: "3 years",
      personality: "Creative, design-focused, enthusiastic about UX and accessibility",
      skills: ["React", "Animations", "Accessibility", "UI/UX Design", "Tailwind CSS"],
      background: "Creates delightful user experiences, tests with screen readers, pixel-perfect implementations",
    },
    "cand-5": {
      name: "Elena Popescu",
      title: "Full-Stack Developer",
      experience: "7 years",
      personality: "Experienced, professional, security-conscious, detail-oriented",
      skills: ["Payment Systems", "Security", "Stripe", "OAuth", "PCI Compliance"],
      background: "Built secure payment systems, expert in encryption and security best practices, fintech experience",
    },
  }

  let profile = candidateProfiles[candidateId]

  // If not found by ID, try to find by name
  if (!profile && candidateName) {
    const nameToId: Record<string, string> = {
      "Sarah Chen": "cand-1",
      "Michael Rodriguez": "cand-2",
      "Priya Sharma": "cand-3",
      "James Wilson": "cand-4",
      "Elena Popescu": "cand-5",
    }
    const id = nameToId[candidateName]
    if (id) {
      profile = candidateProfiles[id]
    }
  }

  return profile
}
