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
  // David Kim - Systematic, automation-focused, reliability-driven, proactive
  {
    candidateId: "cand-6",
    candidateName: "David Kim",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hi David, I was impressed by your experience with AWS and Kubernetes. We're looking for a DevOps Engineer who can help us automate our deployment process and improve system reliability. Interested?",
        timestamp: "March 10, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content:
          "Thank you for reaching out! I'm very interested. My experience with cloud infrastructure and automation has improved deployment frequency by 300%. I'm looking forward to discussing how I can contribute.",
        timestamp: "March 10, 2024 - 2:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's fantastic! We're currently using Terraform and Kubernetes for our infrastructure. We need someone who can optimize our CI/CD pipelines and ensure our systems are always reliable. Do you have any experience with Terraform?",
        timestamp: "March 11, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I'm very familiar with Terraform. I've used it to manage cloud resources efficiently. I'm also experienced with monitoring tools to ensure system reliability. Let's move forward with a technical challenge.",
        timestamp: "March 11, 2024 - 11:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Great! I'm sending you a challenge to optimize our CI/CD pipeline using Jenkins and Docker. Focus on improving build times and deployment reliability. Let me know when you're ready to start.",
        timestamp: "March 12, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific metrics for optimization, or are there particular areas you want me to address?",
        timestamp: "March 12, 2024 - 1:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on build times and deployment reliability. If you see opportunities to improve monitoring and alerting, feel free to suggest them!",
        timestamp: "March 12, 2024 - 2:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I optimized build times by caching dependencies and improved deployment reliability with robust rollback strategies. I've also included detailed documentation on the changes made.",
        timestamp: "March 15, 2024 - 4:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Excellent work! The optimizations are spot on. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 16, 2024 - 12:00 PM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 16, 2024 - 12:30 PM",
      },
    ],
  },
  // Maria Santos - Detail-oriented, user-focused, enthusiastic about mobile UX
  {
    candidateId: "cand-7",
    candidateName: "Maria Santos",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hi Maria, your portfolio showcases your expertise in mobile development. We're looking for a Mobile Developer to join our team and help us build a cross-platform app. Interested?",
        timestamp: "March 11, 2024 - 1:30 PM",
      },
      {
        sender: "candidate",
        content:
          "Thank you for reaching out! I'm very interested. My experience with React Native and Swift has allowed me to build high-performance, user-friendly mobile applications. Let's discuss the role further.",
        timestamp: "March 11, 2024 - 2:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're building a SaaS platform that needs to be available on both iOS and Android. We need someone who can create intuitive interfaces and ensure the app performs well on both platforms. Do you have experience with React Native?",
        timestamp: "March 12, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I've been using React Native for the past 4 years. It allows me to write code once and deploy it on both platforms efficiently. I'm also familiar with Swift and Android development. Let's move forward with a technical challenge.",
        timestamp: "March 12, 2024 - 11:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to build a simple cross-platform app using React Native and Swift. Focus on creating a smooth user experience and optimizing performance. Let me know when you're ready to start.",
        timestamp: "March 13, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific performance metrics, or are there particular features you want me to implement?",
        timestamp: "March 13, 2024 - 1:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on creating a smooth user experience and optimizing performance. If you see opportunities to improve accessibility, feel free to suggest them!",
        timestamp: "March 13, 2024 - 2:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on smooth animations and optimized performance by reducing unnecessary re-renders. I've also included accessibility features to ensure the app is usable by everyone.",
        timestamp: "March 15, 2024 - 3:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Great work! The app looks fantastic and performs well. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 16, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 16, 2024 - 1:30 PM",
      },
    ],
  },
  // Ahmed Hassan - Analytical, performance-driven, architecture-focused, methodical
  {
    candidateId: "cand-8",
    candidateName: "Ahmed Hassan",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hi Ahmed, your experience with Java and Spring Boot is impressive. We're building a high-performance platform and need someone who can design and implement scalable APIs. Interested?",
        timestamp: "March 10, 2024 - 11:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Thank you for reaching out! I'm very interested. My experience with Java and Spring Boot has allowed me to handle high-throughput scenarios efficiently. Let's discuss the role further.",
        timestamp: "March 10, 2024 - 12:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're processing about 10M requests per day across multiple microservices. We need someone who can design and implement scalable APIs using Java and Spring Boot. Do you have experience with Kafka?",
        timestamp: "March 11, 2024 - 9:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I have experience with Kafka for building distributed systems. It allows me to handle large volumes of data efficiently. Let's move forward with a technical challenge.",
        timestamp: "March 11, 2024 - 10:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to design and implement a scalable API using Java and Spring Boot with Kafka for message processing. Focus on optimizing database queries and ensuring high performance. Let me know when you're ready to start.",
        timestamp: "March 12, 2024 - 2:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific performance metrics, or are there particular features you want me to implement?",
        timestamp: "March 12, 2024 - 2:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on optimizing database queries and ensuring high performance. If you see opportunities to improve system design, feel free to suggest them!",
        timestamp: "March 12, 2024 - 3:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on optimizing PostgreSQL queries and designed a scalable architecture using Kafka for message processing. I've also included performance benchmarks in my documentation.",
        timestamp: "March 14, 2024 - 8:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Excellent work! The API design is solid and performs well. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 15, 2024 - 12:00 PM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 15, 2024 - 12:30 PM",
      },
    ],
  },
  // Lisa Anderson - Creative, accessibility-focused, detail-oriented, user-centric
  {
    candidateId: "cand-9",
    candidateName: "Lisa Anderson",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hello Lisa, your portfolio showcases your creativity and focus on accessibility. We're looking for a Frontend Engineer who can create intuitive, accessible web applications. Interested?",
        timestamp: "March 8, 2024 - 11:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Hello, thank you for reaching out. I'm very interested. My experience with React and TypeScript has allowed me to create accessible web applications. Let's discuss the role further.",
        timestamp: "March 8, 2024 - 3:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're building a SaaS platform that needs to be accessible to everyone. We need someone who can create intuitive interfaces using React and TypeScript. Do you have experience with TailwindCSS?",
        timestamp: "March 9, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I've been using TailwindCSS for the past 3 years. It allows me to create beautiful and responsive designs quickly. I'm also familiar with WCAG 2.1 AA compliance. Let's move forward with a technical challenge.",
        timestamp: "March 9, 2024 - 11:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to create an accessible web component using React and TailwindCSS. Focus on creating a smooth user experience and ensuring accessibility. Let me know when you're ready to start.",
        timestamp: "March 10, 2024 - 11:00 AM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific accessibility features, or are there particular design elements you want me to implement?",
        timestamp: "March 10, 2024 - 11:30 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on creating a smooth user experience and ensuring accessibility. If you see opportunities to improve design elements, feel free to suggest them!",
        timestamp: "March 10, 2024 - 12:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on smooth animations and ensured full WCAG 2.1 AA compliance. I've also included accessibility testing steps in my documentation.",
        timestamp: "March 13, 2024 - 6:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Great work! The component looks fantastic and is fully accessible. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 14, 2024 - 12:00 PM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 14, 2024 - 12:30 PM",
      },
    ],
  },
  // Carlos Mendoza - Versatile, communicative, problem-solver, team-oriented
  {
    candidateId: "cand-10",
    candidateName: "Carlos Mendoza",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hi Carlos, your portfolio showcases your versatility and strong communication skills. We're looking for a Full-Stack Developer who can contribute to our modern web technologies stack. Interested?",
        timestamp: "March 10, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content:
          "Thank you for reaching out! I'm very interested. My experience with React, Node.js, and TypeScript has allowed me to build modern web applications efficiently. Let's discuss the role further.",
        timestamp: "March 10, 2024 - 2:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're building a SaaS platform using React, Node.js, TypeScript, and MongoDB. We need someone who can contribute to both frontend and backend development. Do you have experience with GraphQL?",
        timestamp: "March 11, 2024 - 9:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I have experience with GraphQL for building efficient APIs. It allows me to fetch only the data I need and improve the overall performance of the application. Let's move forward with a technical challenge.",
        timestamp: "March 11, 2024 - 10:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to build a simple feature using React, Node.js, and GraphQL. Focus on creating a clean and efficient API and a user-friendly frontend interface. Let me know when you're ready to start.",
        timestamp: "March 12, 2024 - 2:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific API features, or are there particular frontend elements you want me to implement?",
        timestamp: "March 12, 2024 - 2:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on creating a clean and efficient API and a user-friendly frontend interface. If you see opportunities to improve either, feel free to suggest them!",
        timestamp: "March 12, 2024 - 3:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on creating a clean GraphQL API and a responsive frontend interface using React. I've also included comprehensive documentation and testing.",
        timestamp: "March 14, 2024 - 7:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Excellent work! The API and frontend interface are both solid and perform well. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 15, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 15, 2024 - 1:30 PM",
      },
    ],
  },
  // Yuki Tanaka - Leadership-oriented, mentoring-focused, quality-driven, strategic
  {
    candidateId: "cand-11",
    candidateName: "Yuki Tanaka",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hi Yuki, your experience in enterprise environments is impressive. We're looking for a Senior Software Engineer who can lead our backend development efforts. Interested?",
        timestamp: "March 11, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Thank you for reaching out! I'm very interested. My experience with Java and Spring Boot has allowed me to lead enterprise projects successfully. Let's discuss the role further.",
        timestamp: "March 11, 2024 - 11:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're building a high-scale platform using Java, Spring Boot, and AWS. We need someone who can lead our backend development efforts and mentor junior developers. Do you have any experience with AWS?",
        timestamp: "March 12, 2024 - 9:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I have extensive experience with AWS, including setting up cloud infrastructure and managing services like EC2, S3, and RDS. I'm also comfortable mentoring junior developers and sharing my knowledge. Let's move forward with a technical challenge.",
        timestamp: "March 12, 2024 - 10:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to design and implement a scalable backend service using Java and Spring Boot on AWS. Focus on optimizing performance and ensuring reliability. Let me know when you're ready to start.",
        timestamp: "March 13, 2024 - 2:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific performance metrics, or are there particular features you want me to implement?",
        timestamp: "March 13, 2024 - 2:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on optimizing performance and ensuring reliability. If you see opportunities to improve system design, feel free to suggest them!",
        timestamp: "March 13, 2024 - 3:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on optimizing database queries and designed a reliable architecture using AWS services. I've also included performance benchmarks and system design documentation.",
        timestamp: "March 15, 2024 - 9:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Great work! The backend service is solid and performs well. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 16, 2024 - 11:00 AM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 16, 2024 - 11:30 AM",
      },
    ],
  },
  // Omar Ibrahim - Analytical, data-driven, detail-oriented, curious
  {
    candidateId: "cand-12",
    candidateName: "Omar Ibrahim",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hi Omar, your experience with Python and data pipelines is impressive. We're looking for a Data Engineer who can help us build and optimize our data infrastructure. Interested?",
        timestamp: "March 10, 2024 - 12:00 PM",
      },
      {
        sender: "candidate",
        content:
          "Thank you for reaching out! I'm very interested. My experience with Python, SQL, and Apache Spark has allowed me to build efficient data pipelines and extract actionable insights. Let's discuss the role further.",
        timestamp: "March 10, 2024 - 1:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're building a data analytics platform using Python, SQL, and Apache Spark. We need someone who can design and implement efficient data pipelines and extract meaningful insights. Do you have experience with Airflow?",
        timestamp: "March 11, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I have experience with Airflow for managing data workflows. It allows me to automate and schedule data processing tasks efficiently. Let's move forward with a technical challenge.",
        timestamp: "March 11, 2024 - 11:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to design and implement a data pipeline using Python, SQL, and Apache Spark with Airflow for orchestration. Focus on optimizing performance and ensuring data accuracy. Let me know when you're ready to start.",
        timestamp: "March 12, 2024 - 3:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific performance metrics, or are there particular features you want me to implement?",
        timestamp: "March 12, 2024 - 3:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on optimizing performance and ensuring data accuracy. If you see opportunities to improve data pipeline design, feel free to suggest them!",
        timestamp: "March 12, 2024 - 4:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on optimizing SQL queries and designed a reliable data pipeline using Apache Spark and Airflow. I've also included performance benchmarks and data accuracy checks.",
        timestamp: "March 14, 2024 - 8:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Excellent work! The data pipeline is solid and performs well. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 15, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 15, 2024 - 1:30 PM",
      },
    ],
  },
  // Sophie Laurent - Creative, user-centered, design-focused, empathetic
  {
    candidateId: "cand-13",
    candidateName: "Sophie Laurent",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hello Sophie, your portfolio showcases your creativity and focus on user-centered design. We're looking for a UI/UX Engineer who can help us design intuitive interfaces. Interested?",
        timestamp: "March 8, 2024 - 12:00 PM",
      },
      {
        sender: "candidate",
        content:
          "Hello, thank you for reaching out. I'm very interested. My experience with React and TypeScript has allowed me to create intuitive interfaces that users love. Let's discuss the role further.",
        timestamp: "March 8, 2024 - 4:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're building a SaaS platform that needs intuitive interfaces. We need someone who can design and implement user-friendly interfaces using React and TypeScript. Do you have experience with Figma?",
        timestamp: "March 9, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I have experience with Figma for creating design mockups. It allows me to collaborate with designers and developers efficiently. Let's move forward with a technical challenge.",
        timestamp: "March 9, 2024 - 11:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to implement a design mockup from Figma using React and TypeScript. Focus on creating a pixel-perfect implementation and ensuring accessibility. Let me know when you're ready to start.",
        timestamp: "March 12, 2024 - 4:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific design elements, or are there particular features you want me to implement?",
        timestamp: "March 12, 2024 - 4:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on creating a pixel-perfect implementation and ensuring accessibility. If you see opportunities to improve design elements, feel free to suggest them!",
        timestamp: "March 12, 2024 - 5:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on creating a pixel-perfect implementation and ensured full accessibility using TypeScript. I've also included design documentation and accessibility testing steps.",
        timestamp: "March 14, 2024 - 9:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Great work! The implementation is solid and accessible. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 15, 2024 - 12:00 PM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 15, 2024 - 12:30 PM",
      },
    ],
  },
  // Raj Patel - Methodical, quality-focused, test-driven, reliable
  {
    candidateId: "cand-14",
    candidateName: "Raj Patel",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hi Raj, your experience with Python and Django is impressive. We're looking for a Backend Developer who can help us build clean and reliable APIs. Interested?",
        timestamp: "March 10, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Thank you for reaching out! I'm very interested. My experience with Python and Django has allowed me to build clean and reliable APIs efficiently. Let's discuss the role further.",
        timestamp: "March 10, 2024 - 11:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're building a SaaS platform that needs clean and reliable APIs. We need someone who can design and implement RESTful APIs using Python and Django. Do you have experience with PostgreSQL?",
        timestamp: "March 11, 2024 - 9:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I have extensive experience with PostgreSQL for building scalable applications. It allows me to handle large volumes of data efficiently. Let's move forward with a technical challenge.",
        timestamp: "March 11, 2024 - 10:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to design and implement a RESTful API using Python and Django with PostgreSQL for data storage. Focus on clean code and comprehensive testing. Let me know when you're ready to start.",
        timestamp: "March 12, 2024 - 3:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific API features, or are there particular testing strategies you want me to implement?",
        timestamp: "March 12, 2024 - 3:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on clean code and comprehensive testing. If you see opportunities to improve API design, feel free to suggest them!",
        timestamp: "March 12, 2024 - 4:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on clean code and implemented comprehensive unit tests and integration tests. I've also included performance benchmarks and API design documentation.",
        timestamp: "March 14, 2024 - 8:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Excellent work! The API design is solid and performs well. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 15, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 15, 2024 - 1:30 PM",
      },
    ],
  },
  // Anna Kowalski - Collaborative, quality-conscious, detail-oriented, team player
  {
    candidateId: "cand-15",
    candidateName: "Anna Kowalski",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hello Anna, your portfolio showcases your collaborative and quality-conscious approach. We're looking for a Full-Stack Developer who can contribute to our web development efforts. Interested?",
        timestamp: "March 8, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content:
          "Hello, thank you for reaching out. I'm very interested. My experience with React, Node.js, and TypeScript has allowed me to build user-friendly web applications efficiently. Let's discuss the role further.",
        timestamp: "March 8, 2024 - 3:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're building a SaaS platform using React, Node.js, TypeScript, and PostgreSQL. We need someone who can contribute to both frontend and backend development. Do you have any experience with Next.js?",
        timestamp: "March 9, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I have experience with Next.js for building server-side rendered applications. It allows me to create fast and SEO-friendly web pages. Let's move forward with a technical challenge.",
        timestamp: "March 9, 2024 - 11:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to build a simple feature using React, Node.js, and Next.js. Focus on creating a clean and efficient API and a user-friendly frontend interface. Let me know when you're ready to start.",
        timestamp: "March 12, 2024 - 2:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific API features, or are there particular frontend elements you want me to implement?",
        timestamp: "March 12, 2024 - 2:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on creating a clean and efficient API and a user-friendly frontend interface. If you see opportunities to improve either, feel free to suggest them!",
        timestamp: "March 12, 2024 - 3:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on creating a clean API and a responsive frontend interface using React and Next.js. I've also included comprehensive documentation and testing.",
        timestamp: "March 14, 2024 - 7:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Great work! The API and frontend interface are both solid and perform well. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 15, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 15, 2024 - 1:30 PM",
      },
    ],
  },
  // Marcus Johnson - Strategic, security-conscious, cost-aware, leadership-oriented
  {
    candidateId: "cand-16",
    candidateName: "Marcus Johnson",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hi Marcus, your experience in cloud architecture is impressive. We're looking for a Cloud Architect who can help us design and optimize our cloud infrastructure. Interested?",
        timestamp: "March 10, 2024 - 11:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Thank you for reaching out! I'm very interested. My experience with AWS and Azure has allowed me to design and optimize cloud infrastructure efficiently. Let's discuss the role further.",
        timestamp: "March 10, 2024 - 12:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're building a SaaS platform using AWS and Azure. We need someone who can design and optimize our cloud infrastructure, focusing on security and cost awareness. Do you have any experience with Terraform?",
        timestamp: "March 11, 2024 - 9:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I have extensive experience with Terraform for managing cloud resources. It allows me to automate and manage infrastructure efficiently. Let's move forward with a technical challenge.",
        timestamp: "March 11, 2024 - 10:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to design and optimize our cloud infrastructure using Terraform, AWS, and Azure. Focus on security best practices and cost optimization. Let me know when you're ready to start.",
        timestamp: "March 12, 2024 - 4:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific security features, or are there particular cost optimization strategies you want me to implement?",
        timestamp: "March 12, 2024 - 4:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on security best practices and cost optimization. If you see opportunities to improve infrastructure design, feel free to suggest them!",
        timestamp: "March 12, 2024 - 5:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on implementing security best practices and optimizing costs using Terraform. I've also included performance benchmarks and infrastructure design documentation.",
        timestamp: "March 14, 2024 - 9:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Great work! The cloud infrastructure design is solid and performs well. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 15, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 15, 2024 - 1:30 PM",
      },
    ],
  },
  // Mei Lin - Eager to learn, collaborative, responsive design-focused, growth-minded
  {
    candidateId: "cand-17",
    candidateName: "Mei Lin",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hi Mei, your portfolio showcases your eagerness to learn and collaborative spirit. We're looking for a Frontend Developer who can create responsive and accessible web applications. Interested?",
        timestamp: "March 14, 2024 - 12:00 PM",
      },
      {
        sender: "candidate",
        content:
          "Thank you for reaching out! I'm very interested. My experience with React, Vue.js, and TypeScript has allowed me to create responsive and accessible web applications efficiently. Let's discuss the role further.",
        timestamp: "March 14, 2024 - 1:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're building a SaaS platform that needs responsive and accessible interfaces. We need someone who can create intuitive interfaces using React and TypeScript. Do you have experience with TailwindCSS?",
        timestamp: "March 15, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I have experience with TailwindCSS for creating design mockups. It allows me to collaborate with designers and developers efficiently. Let's move forward with a technical challenge.",
        timestamp: "March 15, 2024 - 11:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to implement a design mockup from Figma using React and TailwindCSS. Focus on creating a responsive implementation and ensuring accessibility. Let me know when you're ready to start.",
        timestamp: "March 16, 2024 - 2:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific design elements, or are there particular features you want me to implement?",
        timestamp: "March 16, 2024 - 2:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on creating a responsive implementation and ensuring accessibility. If you see opportunities to improve design elements, feel free to suggest them!",
        timestamp: "March 16, 2024 - 3:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on creating a responsive implementation and ensured full accessibility using TypeScript. I've also included design documentation and accessibility testing steps.",
        timestamp: "March 18, 2024 - 6:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Great work! The implementation is solid and accessible. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 19, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 19, 2024 - 10:30 AM",
      },
    ],
  },
  // Diego Fernandez - Security-focused, analytical, proactive, compliance-aware
  {
    candidateId: "cand-18",
    candidateName: "Diego Fernandez",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hello Diego, your experience in application security is impressive. We're looking for a Security Engineer who can help us identify and mitigate vulnerabilities. Interested?",
        timestamp: "March 11, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content:
          "Hello, thank you for reaching out. I'm very interested. My experience in application security and penetration testing has allowed me to identify and mitigate vulnerabilities efficiently. Let's discuss the role further.",
        timestamp: "March 11, 2024 - 2:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're building a SaaS platform that needs robust security measures. We need someone who can identify and mitigate vulnerabilities using Python and OWASP best practices. Do you have experience with Python?",
        timestamp: "March 12, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I have extensive experience with Python for building secure applications. I'm also familiar with OWASP best practices and can identify and mitigate vulnerabilities efficiently. Let's move forward with a technical challenge.",
        timestamp: "March 12, 2024 - 11:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to identify and mitigate vulnerabilities in a sample application using Python and OWASP best practices. Focus on creating a secure implementation and ensuring compliance. Let me know when you're ready to start.",
        timestamp: "March 13, 2024 - 4:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific security features, or are there particular compliance requirements you want me to address?",
        timestamp: "March 13, 2024 - 4:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on creating a secure implementation and ensuring compliance. If you see opportunities to improve security measures, feel free to suggest them!",
        timestamp: "March 13, 2024 - 5:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on identifying and mitigating vulnerabilities and ensured full compliance with OWASP best practices. I've also included security documentation and compliance checks.",
        timestamp: "March 15, 2024 - 10:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Excellent work! The security implementation is solid and compliant. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 16, 2024 - 11:00 AM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 16, 2024 - 11:30 AM",
      },
    ],
  },
  // Fatima Al-Rashid - Analytical, research-oriented, problem-solver, innovative
  {
    candidateId: "cand-19",
    candidateName: "Fatima Al-Rashid",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hello Fatima, your experience in machine learning is impressive. We're looking for a Machine Learning Engineer who can help us build and deploy ML models. Interested?",
        timestamp: "March 8, 2024 - 12:00 PM",
      },
      {
        sender: "candidate",
        content:
          "Hello, thank you for reaching out. I'm very interested. My experience with Python, TensorFlow, and PyTorch has allowed me to build and deploy ML models efficiently. Let's discuss the role further.",
        timestamp: "March 8, 2024 - 3:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're building a platform that needs to apply AI to real-world problems. We need someone who can build and deploy ML models using Python, TensorFlow, and PyTorch. Do you have experience with NLP?",
        timestamp: "March 9, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I have experience with NLP for building natural language processing models. It allows me to analyze and understand text data efficiently. Let's move forward with a technical challenge.",
        timestamp: "March 9, 2024 - 11:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to build a simple NLP model using Python, TensorFlow, and PyTorch. Focus on creating an efficient and accurate model. Let me know when you're ready to start.",
        timestamp: "March 12, 2024 - 5:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific NLP features, or are there particular model architectures you want me to implement?",
        timestamp: "March 12, 2024 - 5:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on creating an efficient and accurate model. If you see opportunities to improve model architectures, feel free to suggest them!",
        timestamp: "March 12, 2024 - 6:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on creating an efficient and accurate NLP model using TensorFlow and PyTorch. I've also included performance benchmarks and model documentation.",
        timestamp: "March 14, 2024 - 9:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Excellent work! The NLP model is solid and performs well. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 15, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 15, 2024 - 1:30 PM",
      },
    ],
  },
  // Thomas O'Brien - Communicative, quality-driven, team-oriented, reliable
  {
    candidateId: "cand-20",
    candidateName: "Thomas O'Brien",
    messages: [
      {
        sender: "hiring_manager",
        content:
          "Hi Thomas, your portfolio showcases your communicative and quality-driven approach. We're looking for a Full-Stack Developer who can contribute to our web development efforts. Interested?",
        timestamp: "March 10, 2024 - 10:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Thank you for reaching out! I'm very interested. My experience with React, Node.js, and TypeScript has allowed me to build user-friendly web applications efficiently. Let's discuss the role further.",
        timestamp: "March 10, 2024 - 11:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "That's great! We're building a SaaS platform using React, Node.js, TypeScript, and PostgreSQL. We need someone who can contribute to both frontend and backend development. Do you have any experience with GraphQL?",
        timestamp: "March 11, 2024 - 9:00 AM",
      },
      {
        sender: "candidate",
        content:
          "Yes, I have experience with GraphQL for building efficient APIs. It allows me to fetch only the data I need and improve the overall performance of the application. Let's move forward with a technical challenge.",
        timestamp: "March 11, 2024 - 10:00 AM",
      },
      {
        sender: "hiring_manager",
        content:
          "Perfect! I'm sending you a challenge to build a simple feature using React, Node.js, and GraphQL. Focus on creating a clean and efficient API and a user-friendly frontend interface. Let me know when you're ready to start.",
        timestamp: "March 12, 2024 - 3:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I'm ready to start. Should I focus on specific API features, or are there particular frontend elements you want me to implement?",
        timestamp: "March 12, 2024 - 3:30 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Focus on creating a clean and efficient API and a user-friendly frontend interface. If you see opportunities to improve either, feel free to suggest them!",
        timestamp: "March 12, 2024 - 4:00 PM",
      },
      {
        sender: "candidate",
        content:
          "I've submitted my solution. I focused on creating a clean GraphQL API and a responsive frontend interface using React. I've also included comprehensive documentation and testing.",
        timestamp: "March 14, 2024 - 7:00 PM",
      },
      {
        sender: "hiring_manager",
        content:
          "Great work! The API and frontend interface are both solid and perform well. Let's schedule a call to discuss your approach and next steps. Are you available next week?",
        timestamp: "March 15, 2024 - 1:00 PM",
      },
      {
        sender: "candidate",
        content: "I'm available next Monday or Tuesday. Looking forward to it!",
        timestamp: "March 15, 2024 - 1:30 PM",
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
      "David Kim": "cand-6",
      "Maria Santos": "cand-7",
      "Ahmed Hassan": "cand-8",
      "Lisa Anderson": "cand-9",
      "Carlos Mendoza": "cand-10",
      "Yuki Tanaka": "cand-11",
      "Omar Ibrahim": "cand-12",
      "Sophie Laurent": "cand-13",
      "Raj Patel": "cand-14",
      "Anna Kowalski": "cand-15",
      "Marcus Johnson": "cand-16",
      "Mei Lin": "cand-17",
      "Diego Fernandez": "cand-18",
      "Fatima Al-Rashid": "cand-19",
      "Thomas O'Brien": "cand-20",
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
      experience: "4 years",
      personality: "Friendly, eager to learn, positive attitude, growth-focused",
      skills: ["React", "Node.js", "MongoDB", "TypeScript", "E-commerce"],
      background: "Built polished e-commerce projects, loves learning new technologies, values code quality",
    },
    "cand-3": {
      name: "Priya Sharma",
      title: "Software Engineer",
      experience: "5 years",
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
    "cand-6": {
      name: "David Kim",
      title: "DevOps Engineer",
      experience: "5 years",
      personality: "Systematic, automation-focused, reliability-driven, proactive",
      skills: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD"],
      background:
        "Specializes in cloud infrastructure and automation, improved deployment frequency by 300%, strong monitoring expertise",
    },
    "cand-7": {
      name: "Maria Santos",
      title: "Mobile Developer",
      experience: "4 years",
      personality: "Detail-oriented, user-focused, enthusiastic about mobile UX",
      skills: ["React Native", "Swift", "iOS", "Android", "Mobile UI/UX"],
      background:
        "Expert in cross-platform mobile development, published multiple apps, strong focus on performance and user experience",
    },
    "cand-8": {
      name: "Ahmed Hassan",
      title: "Backend Engineer",
      experience: "6 years",
      personality: "Analytical, performance-driven, architecture-focused, methodical",
      skills: ["Java", "Spring Boot", "Microservices", "Kafka", "System Design"],
      background:
        "Expert in distributed systems and high-performance APIs, handles 10M+ requests/day, strong system design skills",
    },
    "cand-9": {
      name: "Lisa Anderson",
      title: "Frontend Engineer",
      experience: "3 years",
      personality: "Creative, accessibility-focused, detail-oriented, user-centric",
      skills: ["React", "TypeScript", "Next.js", "TailwindCSS", "Accessibility"],
      background:
        "Passionate about creating accessible web applications, WCAG 2.1 AA compliant implementations, strong design sense",
    },
    "cand-10": {
      name: "Carlos Mendoza",
      title: "Full-Stack Developer",
      experience: "5 years",
      personality: "Versatile, communicative, problem-solver, team-oriented",
      skills: ["React", "Node.js", "TypeScript", "MongoDB", "GraphQL"],
      background:
        "Balanced full-stack skills, strong communication abilities, experience with modern web technologies and GraphQL",
    },
    "cand-11": {
      name: "Yuki Tanaka",
      title: "Senior Software Engineer",
      experience: "8 years",
      personality: "Leadership-oriented, mentoring-focused, quality-driven, strategic",
      skills: ["Java", "Spring Boot", "Microservices", "AWS", "Leadership"],
      background:
        "Senior engineer with extensive enterprise experience, mentors junior developers, strong system architecture skills",
    },
    "cand-12": {
      name: "Omar Ibrahim",
      title: "Data Engineer",
      experience: "4 years",
      personality: "Analytical, data-driven, detail-oriented, curious",
      skills: ["Python", "SQL", "Apache Spark", "Airflow", "ETL"],
      background: "Specializes in building data pipelines and analytics platforms, turns data into actionable insights",
    },
    "cand-13": {
      name: "Sophie Laurent",
      title: "UI/UX Engineer",
      experience: "5 years",
      personality: "Creative, user-centered, design-focused, empathetic",
      skills: ["React", "TypeScript", "Figma", "UI/UX Design", "Design Systems"],
      background:
        "Perfect blend of design and development skills, creates intuitive interfaces, strong advocate for user-centered design",
    },
    "cand-14": {
      name: "Raj Patel",
      title: "Backend Developer",
      experience: "6 years",
      personality: "Methodical, quality-focused, test-driven, reliable",
      skills: ["Python", "Django", "PostgreSQL", "Redis", "REST APIs"],
      background: "Strong expertise in Python and Django, builds clean RESTful APIs, comprehensive testing approach",
    },
    "cand-15": {
      name: "Anna Kowalski",
      title: "Full-Stack Developer",
      experience: "4 years",
      personality: "Collaborative, quality-conscious, detail-oriented, team player",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Next.js"],
      background:
        "Builds user-friendly web applications, strong focus on code quality and best practices, excellent team collaboration",
    },
    "cand-16": {
      name: "Marcus Johnson",
      title: "Cloud Architect",
      experience: "9 years",
      personality: "Strategic, security-conscious, cost-aware, leadership-oriented",
      skills: ["AWS", "Azure", "Terraform", "Kubernetes", "Architecture"],
      background:
        "Extensive cloud architecture experience, expert in security and cost optimization, strong leadership skills",
    },
    "cand-17": {
      name: "Mei Lin",
      title: "Frontend Developer",
      experience: "3 years",
      personality: "Eager to learn, collaborative, responsive design-focused, growth-minded",
      skills: ["React", "Vue.js", "JavaScript", "TypeScript", "Responsive Design"],
      background: "Creates responsive, accessible web applications, eager to learn and grow, strong fundamentals",
    },
    "cand-18": {
      name: "Diego Fernandez",
      title: "Security Engineer",
      experience: "7 years",
      personality: "Security-focused, analytical, proactive, compliance-aware",
      skills: ["Security", "Penetration Testing", "OWASP", "Python", "Compliance"],
      background:
        "Specializes in application security and penetration testing, identifies and mitigates vulnerabilities, strong compliance knowledge",
    },
    "cand-19": {
      name: "Fatima Al-Rashid",
      title: "Machine Learning Engineer",
      experience: "5 years",
      personality: "Analytical, research-oriented, problem-solver, innovative",
      skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "NLP"],
      background: "Builds and deploys ML models, applies AI to real-world problems, strong data science background",
    },
    "cand-20": {
      name: "Thomas O'Brien",
      title: "Full-Stack Developer",
      experience: "6 years",
      personality: "Communicative, quality-driven, team-oriented, reliable",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "GraphQL"],
      background:
        "Delivers high-quality web applications, strong communicator, excellent problem-solving skills, production-ready code",
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
      "David Kim": "cand-6",
      "Maria Santos": "cand-7",
      "Ahmed Hassan": "cand-8",
      "Lisa Anderson": "cand-9",
      "Carlos Mendoza": "cand-10",
      "Yuki Tanaka": "cand-11",
      "Omar Ibrahim": "cand-12",
      "Sophie Laurent": "cand-13",
      "Raj Patel": "cand-14",
      "Anna Kowalski": "cand-15",
      "Marcus Johnson": "cand-16",
      "Mei Lin": "cand-17",
      "Diego Fernandez": "cand-18",
      "Fatima Al-Rashid": "cand-19",
      "Thomas O'Brien": "cand-20",
    }
    const id = nameToId[candidateName]
    if (id) {
      profile = candidateProfiles[id]
    }
  }

  return profile
}
