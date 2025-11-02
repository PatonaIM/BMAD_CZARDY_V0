"use client"

import {
  Github,
  GitBranch,
  Plus,
  Loader2,
  Download,
  CheckCircle2,
  FolderOpen,
  Folder,
  FileCode,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Send,
  Save,
  Clock,
  MessageSquare,
  Briefcase,
  FileText,
  MapPin,
  DollarSign,
} from "lucide-react"
import { useState, useEffect } from "react"
import type { WorkspaceContent, JobListing } from "@/types/workspace"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { JobView } from "@/components/job-view"

// Mock getCurrentUser function - replace with actual implementation if needed
const getCurrentUser = () => ({
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "candidate", // or "hiring_manager", "recruiter", etc.
  profile: {},
  company: {},
})

interface WorkspacePaneProps {
  isOpen: boolean
  onClose: () => void
  content: WorkspaceContent
  onProfileSave?: () => void // Added callback for profile save
  onUpgradePlan?: () => void // Added onUpgradePlan prop
  onHiringManagerStepChange?: (step: number) => void
  onViewJob?: (job: JobListing) => void // Added callback for viewing job details
  onBackToJobBoard?: () => void // Added onBackToJobBoard prop
  activeWorkspace?: string // Added activeWorkspace prop for context
  onApplyForJob?: (job: JobListing) => void // Added prop
  // Added onOpenWorkspace prop
  onOpenWorkspace?: (workspaceType: WorkspaceContent["type"], data?: any) => void
  // Added showApplicationStatus and onToggleApplicationView props
  showApplicationStatus?: boolean
  onToggleApplicationView?: (show: boolean) => void
  onRequestSubmit?: () => void
  onConfirmSubmit?: () => void
  onSubmissionComplete?: () => void
  // </CHANGE>
}

const mockJobListings: JobListing[] = [
  {
    id: "1",
    title: "Senior Full-Stack Developer",
    company: "Teamified",
    companyWebsite: "https://teamified.com",
    location: "Manila, Philippines",
    type: "Full-time",
    salary: "$45k - $65k",
    posted: "2 days ago",
    description: "We're looking for an experienced full-stack developer to join our growing team in Manila.",
    requirements: ["5+ years experience", "React & Node.js", "TypeScript", "AWS"],
    applied: false,
    saved: true,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/teamified-logo-100x100%20%282%29-dQXWtYPZnlTH9UQP75JXSGSEbgNnFd.png",
    status: "open",
    skillMatch: 88,
    jobSummary:
      "• Lead the development of scalable web applications using modern technologies\n• Collaborate with product and design teams to deliver exceptional user experiences\n• Mentor junior developers and contribute to technical decision-making\n• Optimize application performance and ensure code quality through best practices\n• Participate in agile ceremonies and contribute to sprint planning",
    aboutClient:
      "Teamified is a fast-growing HR tech company revolutionizing how businesses manage their workforce across the Asia-Pacific region. Founded in 2020, we've grown to serve over 500 enterprise clients and process millions of employee interactions monthly. Our platform combines cutting-edge AI technology with intuitive design to streamline hiring, onboarding, and team management processes. We're backed by leading venture capital firms and have recently closed our Series B funding round. Our diverse team of 150+ professionals spans across Manila, Singapore, and Sydney, working together to build the future of work. We pride ourselves on our innovative culture, commitment to work-life balance, and dedication to helping businesses unlock their full potential. Join us in our mission to make workforce management effortless and empower organizations to focus on what truly matters - their people.",
    qualifications: [
      "5+ years of professional software development experience",
      "Strong proficiency in React, Node.js, and TypeScript",
      "Experience with AWS cloud services and infrastructure",
      "Solid understanding of RESTful APIs and microservices architecture",
      "Experience with SQL and NoSQL databases",
      "Strong problem-solving and communication skills",
    ],
    responsibilities: [
      "Design and develop scalable full-stack applications",
      "Collaborate with cross-functional teams to define and implement new features",
      "Write clean, maintainable, and well-documented code",
      "Participate in code reviews and provide constructive feedback",
      "Mentor junior developers and contribute to team knowledge sharing",
      "Optimize application performance and ensure high availability",
    ],
    benefits: [
      "Competitive salary and performance bonuses",
      "Health insurance coverage",
      "Flexible work arrangements",
      "Professional development budget",
      "Annual team retreats",
      "Modern office equipment",
    ],
    department: "Engineering",
    reportingTo: "Engineering Manager",
    teamSize: "8-10 engineers",
    workArrangement: "Hybrid (3 days office, 2 days remote)",
    applicationDeadline: "March 15, 2025",
    hiringManager: "Sarah Chen",
    openings: 2,
  },
  {
    id: "2",
    title: "AI Engineer",
    company: "Archa",
    companyWebsite: "https://archa.ai",
    location: "Bangalore, India",
    type: "Full-time",
    salary: "$35k - $55k",
    posted: "1 week ago",
    description: "Join our AI team to build cutting-edge machine learning solutions.",
    requirements: ["Python", "TensorFlow/PyTorch", "ML algorithms", "3+ years experience"],
    applied: true,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/archa%20logo-8CqoDVeRki0ggWWe4b6klV7L1rpAyu.png",
    status: "draft",
    skillMatch: 75,
    jobSummary:
      "• Design and implement machine learning models for production systems\n• Work with large datasets to train and optimize AI algorithms\n• Collaborate with engineering teams to integrate ML solutions into products\n• Research and evaluate new AI technologies and methodologies\n• Monitor model performance and implement improvements",
    aboutClient:
      "Archa is an innovative AI company at the forefront of developing intelligent solutions for enterprise clients worldwide. Since our inception in 2018, we've been pioneering advanced machine learning and natural language processing technologies that transform how businesses operate. Our team of world-class researchers and engineers has published over 50 papers in top-tier AI conferences and holds multiple patents in the field. We work with Fortune 500 companies across finance, healthcare, and technology sectors to solve their complex challenges. With offices in Bangalore, San Francisco, and London, we foster a culture of continuous learning and innovation. Our commitment to ethical AI development and responsible technology deployment sets us apart in the industry. We offer our team members the opportunity to work on cutting-edge projects that push the boundaries of what's possible with artificial intelligence.",
    benefits: [
      "Competitive compensation with equity options",
      "Comprehensive health and wellness benefits",
      "Flexible remote work policy",
      "Learning and development stipend",
      "Conference attendance opportunities",
      "Cutting-edge hardware and tools",
    ],
  },
  {
    id: "3",
    title: "Product Manager",
    company: "Volaro Group",
    companyWebsite: "https://volaro.com",
    location: "Sydney, Australia",
    type: "Full-time",
    salary: "$90k - $120k",
    posted: "3 days ago",
    description: "Lead product strategy and execution for our flagship product in Sydney.",
    requirements: ["5+ years PM experience", "Agile/Scrum", "Data-driven", "B2B SaaS"],
    saved: true,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
    status: "open",
    skillMatch: 82,
    jobSummary:
      "• Define and execute product roadmap aligned with business objectives\n• Conduct market research and competitive analysis to identify opportunities\n• Work closely with engineering, design, and sales teams to deliver features\n• Analyze product metrics and user feedback to drive continuous improvement\n• Present product vision and strategy to stakeholders and leadership",
    aboutClient:
      "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a strong presence across Australia, New Zealand, and Southeast Asia. Established in 2015, we've grown from a small startup to a publicly-traded company serving over 2,000 enterprise customers. Our comprehensive suite of business management tools helps organizations streamline operations, improve productivity, and drive growth. We're committed to innovation and customer success, investing heavily in R&D and maintaining a customer satisfaction rate of over 95%. Our Sydney headquarters houses our product development, sales, and customer success teams, creating a collaborative environment where ideas flourish. We've been recognized as one of Australia's fastest-growing tech companies for three consecutive years. Join us to be part of a dynamic team that's shaping the future of enterprise software.",
    benefits: [
      "Excellent salary package with performance bonuses",
      "Premium health insurance for you and family",
      "Generous parental leave policy",
      "Stock options and equity participation",
      "Professional development and training",
      "Modern Sydney office with amenities",
    ],
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "Zai",
    companyWebsite: "https://hellozai.com",
    location: "Colombo, Sri Lanka",
    type: "Full-time",
    salary: "$30k - $45k",
    posted: "5 days ago",
    description: "Build and maintain our cloud infrastructure and CI/CD pipelines.",
    requirements: ["Kubernetes", "Docker", "AWS/GCP", "Terraform", "4+ years experience"],
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hellozai_logo-XUIeE9BgHN74vNrb0ad0ZucglbjTyu.jpg",
    status: "closed",
    skillMatch: 70,
    jobSummary:
      "• Design and maintain scalable cloud infrastructure on AWS/GCP\n• Implement and optimize CI/CD pipelines for automated deployments\n• Monitor system performance and ensure high availability\n• Automate infrastructure provisioning using Infrastructure as Code\n• Collaborate with development teams to improve deployment processes",
    aboutClient:
      "Zai is a fintech company revolutionizing payment solutions across Asia, with a mission to make financial services accessible to everyone. Founded in 2019, we've rapidly grown to process over $2 billion in transactions annually and serve millions of users across 12 countries. Our innovative payment platform combines security, speed, and simplicity to deliver seamless financial experiences. We're backed by prominent investors including Sequoia Capital and have recently expanded our operations to Sri Lanka, establishing a world-class engineering center in Colombo. Our team of 200+ professionals is passionate about leveraging technology to solve real-world financial challenges. We maintain the highest standards of security and compliance, holding licenses from multiple regulatory authorities. Join us in our journey to democratize financial services and build the payment infrastructure of tomorrow.",
    benefits: [
      "Competitive salary with annual increments",
      "Health and life insurance coverage",
      "Work from home flexibility",
      "Annual performance bonuses",
      "Training and certification support",
      "Team building activities and events",
    ],
  },
  {
    id: "5",
    title: "Frontend Developer",
    company: "Thriday",
    companyWebsite: "https://thriday.com.au",
    location: "Cebu, Philippines",
    type: "Full-time",
    salary: "$35k - $50k",
    posted: "1 day ago",
    description: "Create beautiful and responsive user interfaces for our web applications.",
    requirements: ["React", "TypeScript", "CSS/Tailwind", "3+ years experience"],
    applied: false,
    saved: true,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thriday-Whwv76tg1bImcbvRGg7R9C96O7vtcy.png",
    status: "open",
    skillMatch: 92,
    jobSummary:
      "• Build responsive and accessible user interfaces using React and TypeScript\n• Collaborate with designers to implement pixel-perfect designs\n• Optimize frontend performance and ensure cross-browser compatibility\n• Write reusable components and maintain component libraries\n• Participate in code reviews and contribute to frontend architecture decisions",
    aboutClient:
      "Thriday is an Australian fintech startup transforming how small businesses manage their finances through intelligent automation. Since launching in 2021, we've helped over 10,000 small business owners save countless hours on bookkeeping and accounting tasks. Our AI-powered platform automatically categorizes transactions, generates invoices, and prepares financial reports, making financial management effortless. We're a fully remote-first company with team members across Australia, Philippines, and India, united by our passion for empowering entrepreneurs. Our product has won multiple awards including 'Best Fintech Innovation' at the Australian Fintech Awards. We're backed by leading Australian VCs and are experiencing rapid growth, doubling our user base every quarter. Join our talented team and help us build intuitive financial tools that make a real difference in people's lives.",
    benefits: [
      "Competitive salary and quarterly bonuses",
      "HMO coverage for you and dependents",
      "Fully remote work setup",
      "Internet and equipment allowance",
      "Learning and development budget",
      "Flexible working hours",
    ],
  },
  {
    id: "6",
    title: "Data Scientist",
    company: "Fortify",
    companyWebsite: "https://fortifytech.io",
    location: "Mumbai, India",
    type: "Full-time",
    salary: "$40k - $60k",
    posted: "4 days ago",
    description: "Analyze complex datasets and build predictive models to drive business insights.",
    requirements: ["Python", "SQL", "Machine Learning", "Statistics", "4+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fortify_technology_logo-L7WAl4ItfhWAMTrSMbAHGSjerLxjxP.jpeg",
    status: "draft",
    skillMatch: 78,
    jobSummary:
      "• Analyze large datasets to extract actionable insights and identify trends\n• Develop and deploy machine learning models for predictive analytics\n• Collaborate with stakeholders to understand data needs and define metrics\n• Build data pipelines and ensure data quality and integrity\n• Communicate findings and recommendations through visualizations and reports",
    aboutClient:
      "Fortify is a data analytics firm empowering businesses with data-driven decision-making, operating primarily in India and Southeast Asia. Since 2017, we have been helping organizations harness the power of their data to uncover hidden patterns, optimize operations, and gain a competitive edge. Our expertise spans data engineering, business intelligence, machine learning, and advanced analytics. We partner with companies across various sectors, including e-commerce, finance, and healthcare, to deliver bespoke data solutions. Our team of 100+ data scientists and engineers is committed to delivering tangible business value through data. We believe in fostering a culture of curiosity and continuous learning, encouraging our team to explore new technologies and methodologies. Join Fortify to work on challenging data problems and make a significant impact on our clients' success.",
    benefits: [
      "Attractive salary and stock options",
      "Comprehensive health and dental insurance",
      "Remote work options with flexible hours",
      "Annual company retreats and team events",
      "Access to cutting-edge tools and technologies",
    ],
  },
  {
    id: "7",
    title: "Backend Developer",
    company: "Archa",
    companyWebsite: "https://archa.ai",
    location: "Melbourne, Australia",
    type: "Full-time",
    salary: "$85k - $110k",
    posted: "1 week ago",
    description: "Design and implement scalable backend services and APIs.",
    requirements: ["Node.js or Java", "Microservices", "Databases", "5+ years experience"],
    applied: true,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/archa%20logo-8CqoDVeRki0ggWWe4b6klV7L1rpAyu.png",
    status: "open",
    skillMatch: 85,
    jobSummary:
      "• Design and develop robust and scalable backend services and APIs\n• Implement microservices architecture and ensure seamless integration\n• Manage and optimize database performance and integrity\n• Write clean, efficient, and well-documented code\n• Collaborate with frontend teams to define API contracts",
    aboutClient:
      "Archa is an innovative AI company at the forefront of developing intelligent solutions for enterprise clients worldwide. Since our inception in 2018, we've been pioneering advanced machine learning and natural language processing technologies that transform how businesses operate. Our team of world-class researchers and engineers has published over 50 papers in top-tier AI conferences and holds multiple patents. We work with Fortune 500 companies across finance, healthcare, and technology sectors to solve their complex challenges. With offices in Bangalore, San Francisco, and London, we foster a culture of continuous learning and innovation. Our commitment to ethical AI development and responsible technology deployment sets us apart in the industry. We offer our team members the opportunity to work on cutting-edge projects that push the boundaries of what's possible with artificial intelligence.",
    benefits: [
      "Highly competitive salary and performance bonuses",
      "Full family medical, dental, and vision coverage",
      "Flexible work hours and remote options",
      "Generous annual leave and paid holidays",
      "Opportunities for advanced technical training",
      "Modern office space with excellent amenities",
    ],
  },
  {
    id: "8",
    title: "QA Engineer",
    company: "Teamified",
    companyWebsite: "https://teamified.com",
    location: "Remote (Philippines)",
    type: "Full-time",
    salary: "$30k - $45k",
    posted: "2 days ago",
    description: "Ensure software quality through comprehensive testing and automation.",
    requirements: ["Test automation", "Selenium/Cypress", "API testing", "3+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/teamified-logo-100x100%20%282%29-dQXWtYPZnlTH9UQP75JXSGSEbgNnFd.png",
    status: "closed",
    skillMatch: 72,
    jobSummary:
      "• Develop and execute comprehensive test plans and test cases\n• Perform manual and automated testing for web and mobile applications\n• Identify, document, and track bugs through to resolution\n• Collaborate with development teams to ensure high-quality releases\n• Contribute to the improvement of QA processes and methodologies",
    aboutClient:
      "Teamified is a fast-growing HR tech company revolutionizing how businesses manage their workforce across the Asia-Pacific region. Founded in 2020, we've grown to serve over 500 enterprise clients and process millions of employee interactions monthly. Our platform combines cutting-edge AI technology with intuitive design, to streamline hiring, onboarding, and team management processes. We're backed by leading venture capital firms and have recently closed our Series B funding round. Our diverse team of 150+ professionals spans across Manila, Singapore, and Sydney, working together to build the future of work. We pride ourselves on our innovative culture, commitment to work-life balance, and dedication to helping businesses unlock their full potential. Join us in our mission to make workforce management effortless and empower organizations to focus on what truly matters - their people.",
    benefits: [
      "Competitive salary and regular performance reviews",
      "Comprehensive health benefits package",
      "Fully remote work environment",
      "Opportunities for professional development and training",
      "Team collaboration and knowledge sharing sessions",
      "Modern tools and technologies for testing",
    ],
  },
  {
    id: "9",
    title: "Mobile Developer (iOS)",
    company: "Zai",
    companyWebsite: "https://hellozai.com",
    location: "Pune, India",
    type: "Full-time",
    salary: "$38k - $55k",
    posted: "6 days ago",
    description: "Build native iOS applications with cutting-edge features.",
    requirements: ["Swift", "iOS SDK", "UIKit/SwiftUI", "4+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hellozai_logo-XUIeE9BgHN74vNrb0ad0ZucglbjTyu.jpg",
    status: "open",
    skillMatch: 80,
    jobSummary:
      "• Develop and maintain native iOS applications using Swift\n• Implement user interfaces with UIKit and SwiftUI\n• Integrate with backend APIs and services\n• Optimize application performance and ensure a smooth user experience\n• Collaborate with designers and product managers on new features",
    aboutClient:
      "Zai is a fintech company revolutionizing payment solutions across Asia, with a mission to make financial services accessible to everyone. Founded in 2019, we've rapidly grown to process over $2 billion in transactions annually and serve millions of users across 12 countries. Our innovative payment platform combines security, speed, and simplicity to deliver seamless financial experiences. We're backed by prominent investors including Sequoia Capital and have recently expanded our operations to Sri Lanka, establishing a world-class engineering center in Colombo. Our team of 200+ professionals is passionate about leveraging technology to solve real-world financial challenges. We maintain the highest standards of security and compliance, holding licenses from multiple regulatory authorities. Join us in our journey to democratize financial services and build the payment infrastructure of tomorrow.",
    benefits: [
      "Competitive salary and annual bonuses",
      "Excellent health insurance plan",
      "Flexible work arrangements",
      "Access to the latest Apple hardware and software",
      "Opportunities for career growth and specialization",
      "Company-sponsored training and conferences",
    ],
  },
  {
    id: "10",
    title: "UX/UI Designer",
    company: "Volaro Group",
    companyWebsite: "https://volaro.com",
    location: "Brisbane, Australia",
    type: "Full-time",
    salary: "$70k - $95k",
    posted: "3 days ago",
    description: "Create intuitive and visually appealing user experiences.",
    requirements: ["Figma", "User research", "Prototyping", "4+ years experience"],
    applied: false,
    saved: true,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
    status: "draft",
    skillMatch: 86,
    jobSummary:
      "• Design intuitive and engaging user interfaces for web and mobile applications\n• Conduct user research and usability testing to inform design decisions\n• Create wireframes, mockups, and interactive prototypes using Figma\n• Develop and maintain design systems and style guides\n• Collaborate with product and engineering teams to ensure design feasibility",
    aboutClient:
      "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a strong presence across Australia, New Zealand, and Southeast Asia. Established in 2015, we've grown from a small startup to a publicly-traded company serving over 2,000 enterprise customers. Our comprehensive suite of business management tools helps organizations streamline operations, improve productivity, and drive growth. We're committed to innovation and customer success, investing heavily in R&D and maintaining a customer satisfaction rate of over 95%. Our Sydney headquarters houses our product development, sales, and customer success teams, creating a collaborative environment where ideas flourish. We've been recognized as one of Australia's fastest-growing tech companies for three consecutive years. Join us to be part of a dynamic team that's shaping the future of enterprise software.",
    benefits: [
      "Competitive salary and annual performance incentives",
      "Comprehensive health and wellness benefits",
      "Flexible work arrangements",
      "Professional development opportunities and workshops",
      "Access to the latest design software and tools",
      "Collaborative and creative work environment",
    ],
  },
  {
    id: "11",
    title: "Solutions Architect",
    company: "Fortify",
    companyWebsite: "https://fortifytech.io",
    location: "Galle, Sri Lanka",
    type: "Full-time",
    salary: "$50k - $70k",
    posted: "1 week ago",
    description: "Design and implement enterprise-level cloud solutions.",
    requirements: ["AWS/Azure", "System design", "Architecture patterns", "7+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fortify_technology_logo-L7WAl4ItfhWAMTrSMbAHGSjerLxjxP.jpeg",
    status: "open",
    skillMatch: 89,
    jobSummary:
      "• Design and architect scalable and resilient cloud-based solutions on AWS/Azure\n• Define technical standards and best practices for cloud adoption\n• Collaborate with development teams to ensure solutions meet business requirements\n• Provide technical leadership and guidance on cloud technologies\n• Evaluate and recommend new cloud services and tools",
    aboutClient:
      "Fortify is a data analytics firm empowering businesses with data-driven decision-making, operating primarily in India and Southeast Asia. Since 2017, we have been helping organizations harness the power of their data to uncover hidden patterns, optimize operations, and gain a competitive edge. Our expertise spans data engineering, business intelligence, machine learning, and advanced analytics. We partner with companies across various sectors, including e-commerce, finance, and healthcare, to deliver bespoke data solutions. Our team of 100+ data scientists and engineers is committed to delivering tangible business value through data. We believe in fostering a culture of curiosity and continuous learning, encouraging our team to explore new technologies and methodologies. Join Fortify to work on challenging data problems and make a significant impact on our clients' success.",
    benefits: [
      "Excellent salary package and performance bonuses",
      "Comprehensive health, dental, and vision insurance",
      "Flexible remote and hybrid work options",
      "Professional certification and training support",
      "Opportunities to work on challenging and innovative projects",
      "Generous paid time off",
    ],
  },
  {
    id: "12",
    title: "Scrum Master",
    company: "Thriday",
    companyWebsite: "https://thriday.com.au",
    location: "Makati, Philippines",
    type: "Full-time",
    salary: "$40k - $55k",
    posted: "4 days ago",
    description: "Facilitate agile processes and remove impediments for development teams.",
    requirements: ["Scrum certification", "Agile methodologies", "Team facilitation", "3+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thriday-Whwv76tg1bImcbvRGg7R9C96O7vtcy.png",
    status: "closed",
    skillMatch: 77,
    jobSummary:
      "• Facilitate Scrum ceremonies including sprint planning, daily stand-ups, sprint reviews, and retrospectives\n• Coach and mentor the development team on Agile principles and practices\n• Remove impediments and obstacles that hinder team progress\n• Foster a collaborative and self-organizing team environment\n• Track team progress and report on key agile metrics",
    aboutClient:
      "Thriday is an Australian fintech startup transforming how small businesses manage their finances through intelligent automation. Since launching in 2021, we've helped over 10,000 small business owners save countless hours on bookkeeping and accounting tasks. Our AI-powered platform automatically categorizes transactions, generates invoices, and prepares financial reports, making financial management effortless. We're a fully remote-first company with team members across Australia, Philippines, and India, united by our passion for empowering entrepreneurs. Our product has won multiple awards including 'Best Fintech Innovation' at the Australian Fintech Awards. We're backed by leading Australian VCs and are experiencing rapid growth, doubling our user base every quarter. Join our talented team and help us build intuitive financial tools that make a real difference in people's lives.",
    benefits: [
      "Competitive salary and performance incentives",
      "Comprehensive health and wellness benefits",
      "Flexible work schedule and remote options",
      "Opportunities for professional development and certifications",
      "Supportive team environment and collaborative culture",
      "Annual performance bonuses",
    ],
  },
  {
    id: "13",
    title: "Security Engineer",
    company: "Archa",
    companyWebsite: "https://archa.ai",
    location: "Hyderabad, India",
    type: "Full-time",
    salary: "$45k - $65k",
    posted: "2 days ago",
    description: "Protect our systems and data through robust security measures.",
    requirements: ["Security protocols", "Penetration testing", "SIEM tools", "5+ years experience"],
    applied: true,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/archa%20logo-8CqoDVeRki0ggWWe4b6klV7L1rpAyu.png",
    status: "open",
    skillMatch: 83,
    jobSummary:
      "• Implement and maintain security controls to protect systems and data\n• Conduct vulnerability assessments and penetration testing\n• Monitor security alerts and respond to incidents\n• Develop and enforce security policies and procedures\n• Stay up-to-date with the latest security threats and technologies",
    aboutClient:
      "Archa is an innovative AI company at the forefront of developing intelligent solutions for enterprise clients worldwide. Since our inception in 2018, we've been pioneering advanced machine learning and natural language processing technologies that transform how businesses operate. Our team of world-class researchers and engineers has published over 50 papers in top-tier AI conferences and holds multiple patents. We work with Fortune 500 companies across finance, healthcare, and technology sectors to solve their complex challenges. With offices in Bangalore, San Francisco, and London, we foster a culture of continuous learning and innovation. Our commitment to ethical AI development and responsible technology deployment sets us apart in the industry. We offer our team members the opportunity to work on cutting-edge projects that push the boundaries of what's possible with artificial intelligence.",
    benefits: [
      "Competitive salary and regular performance reviews",
      "Comprehensive health, dental, and vision insurance",
      "Flexible work hours and remote options",
      "Professional development budget for certifications and training",
      "Opportunities to work with advanced security technologies",
      "Generous paid time off",
    ],
  },
  {
    id: "14",
    title: "Technical Writer",
    company: "Teamified",
    companyWebsite: "https://teamified.com",
    location: "Remote (Australia)",
    type: "Contract",
    salary: "$60k - $80k",
    posted: "5 days ago",
    description: "Create clear and comprehensive technical documentation.",
    requirements: ["Technical writing", "API documentation", "Markdown", "3+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/teamified-logo-100x100%20%282%29-dQXWtYPZnlTH9UQP75JXSGSEbgNnFd.png",
    status: "draft",
    skillMatch: 74,
    jobSummary:
      "• Create and maintain technical documentation, including user guides, API documentation, and release notes\n• Collaborate with engineering and product teams to understand product features and requirements\n• Ensure documentation is accurate, clear, and concise\n• Manage documentation projects and timelines\n• Adhere to company style guides and quality standards",
    aboutClient:
      "Teamified is a fast-growing HR tech company revolutionizing how businesses manage their workforce across the Asia-Pacific region. Founded in 2020, we've grown to serve over 500 enterprise clients and process millions of employee interactions monthly. Our platform combines cutting-edge AI technology with intuitive design to streamline hiring, onboarding, and team management processes. We're backed by leading venture capital firms and have recently closed our Series B funding round. Our diverse team of 150+ professionals spans across Manila, Singapore, and Sydney, working together to build the future of work. We pride ourselves on our innovative culture, commitment to work-life balance, and dedication to helping businesses unlock their full potential. Join us in our mission to make workforce management effortless and empower organizations to focus on what truly matters - their people.",
    benefits: [
      "Competitive contract rate",
      "Flexible remote working arrangement",
      "Opportunity to work with a leading HR tech company",
      "Exposure to diverse technical projects",
      "Support for professional development",
    ],
  },
  {
    id: "15",
    title: "Business Analyst",
    company: "Zai",
    companyWebsite: "https://hellozai.com",
    location: "Davao, Philippines",
    type: "Full-time",
    salary: "$35k - $50k",
    posted: "1 week ago",
    description: "Analyze business needs and translate them into technical requirements.",
    requirements: ["Business analysis", "Requirements gathering", "SQL", "3+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hellozai_logo-XUIeE9BgHN74vNrb0ad0ZucglbjTyu.jpg",
    status: "open",
    skillMatch: 84,
    jobSummary:
      "• Analyze business needs and define technical requirements\n• Collaborate with stakeholders to gather and prioritize requirements\n• Develop and maintain project plans and timelines\n• Conduct data analysis to support decision-making\n• Communicate technical requirements and project status to non-technical teams",
    aboutClient:
      "Zai is a fintech company revolutionizing payment solutions across Asia, with a mission to make financial services accessible to everyone. Founded in 2019, we've rapidly grown to process over $2 billion in transactions annually and serve millions of users across 12 countries. Our innovative payment platform combines security, speed, and simplicity to deliver seamless financial experiences. We're backed by prominent investors including Sequoia Capital and have recently expanded our operations to Sri Lanka, establishing a world-class engineering center in Colombo. Our team of 200+ professionals is passionate about leveraging technology to solve real-world financial challenges. We maintain the highest standards of security and compliance, holding licenses from multiple regulatory authorities. Join us in our journey to democratize financial services and build the payment infrastructure of tomorrow.",
    benefits: [
      "Competitive salary with annual increments",
      "Health and life insurance coverage",
      "Flexible work arrangements",
      "Professional development budget",
      "Annual team retreats",
      "Modern office equipment",
    ],
  },
  {
    id: "16",
    title: "Engineering Manager",
    company: "Teamified",
    companyWebsite: "https://teamified.com",
    location: "Adelaide, Australia",
    type: "Full-time",
    salary: "$110k - $145k",
    posted: "1 week ago",
    description: "Lead and mentor a team of software engineers to deliver high-quality products.",
    requirements: ["7+ years engineering experience", "3+ years management", "Technical leadership", "Agile/Scrum"],
    applied: true,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/teamified-logo-100x100%20%282%29-dQXWtYPZnlTH9UQP75JXSGSEbgNnFd.png",
    status: "closed",
    skillMatch: 93,
    jobSummary:
      "• Lead and mentor a team of 8-10 software engineers to deliver high-quality products\n• Define technical roadmap and architecture decisions\n• Collaborate with product and design teams on feature planning\n• Conduct performance reviews and support career development\n• Foster a culture of innovation and continuous improvement",
    aboutClient:
      "Teamified is a fast-growing HR tech company revolutionizing how businesses manage their workforce across the Asia-Pacific region. Founded in 2020, we've grown to serve over 500 enterprise clients and process millions of employee interactions monthly. Our platform combines cutting-edge AI technology with intuitive design to streamline hiring, onboarding, and team management processes. We're backed by leading venture capital firms and have recently closed our Series B funding round. Our diverse team of 150+ professionals spans across Manila, Singapore, and Sydney, working together to build the future of work. We pride ourselves on our innovative culture, commitment to work-life balance, and dedication to helping businesses unlock their full potential. Join us in our mission to make workforce management effortless and empower organizations to focus on what truly matters - their people.",
    qualifications: [
      "7+ years of professional software development experience",
      "3+ years of engineering management experience",
      "Strong technical background in modern web technologies",
      "Proven track record of building and leading high-performing teams",
      "Excellent communication and leadership skills",
      "Experience with Agile/Scrum methodologies",
    ],
    responsibilities: [
      "Lead and mentor a team of software engineers",
      "Define technical strategy and architecture decisions",
      "Collaborate with stakeholders on product roadmap",
      "Conduct performance reviews and support career development",
      "Foster a culture of innovation and continuous improvement",
      "Ensure delivery of high-quality software products",
    ],
    benefits: [
      "Competitive salary and performance bonuses",
      "Health insurance coverage",
      "Flexible work arrangements",
      "Professional development budget",
      "Annual team retreats",
      "Modern office equipment",
    ],
    department: "Engineering",
    reportingTo: "VP of Engineering",
    teamSize: "8-10 engineers",
    workArrangement: "Hybrid (3 days office, 2 days remote)",
    applicationDeadline: "March 20, 2025",
    hiringManager: "David Thompson",
    openings: 1,
  },
]

interface FileNode {
  name: string
  type: "file" | "folder"
  children?: FileNode[]
  path: string
}

const mockFileStructure: FileNode[] = [
  {
    name: "app",
    type: "folder",
    path: "app",
    children: [
      { name: "main.py", type: "file", path: "app/main.py" },
      { name: "__init__.py", type: "file", path: "app/__init__.py" },
      {
        name: "routers",
        type: "folder",
        path: "app/routers",
        children: [
          { name: "users.py", type: "file", path: "app/routers/users.py" },
          { name: "items.py", type: "file", path: "app/routers/items.py" },
          { name: "__init__.py", type: "file", path: "app/routers/__init__.py" },
        ],
      },
      {
        name: "models",
        type: "folder",
        path: "app/models",
        children: [
          { name: "user.py", type: "file", path: "app/models/user.py" },
          { name: "item.py", type: "file", path: "app/models/item.py" },
          { name: "__init__.py", type: "file", path: "app/models/__init__.py" },
        ],
      },
      {
        name: "schemas",
        type: "folder",
        path: "app/schemas",
        children: [
          { name: "user.py", type: "file", path: "app/schemas/user.py" },
          { name: "item.py", type: "file", path: "app/schemas/item.py" },
          { name: "__init__.py", type: "file", path: "app/schemas/__init__.py" },
        ],
      },
      { name: "database.py", type: "file", path: "app/database.py" },
      { name: "config.py", type: "file", path: "app/config.py" },
    ],
  },
  {
    name: "tests",
    type: "folder",
    path: "tests",
    children: [
      { name: "test_main.py", type: "file", path: "tests/test_main.py" },
      { name: "test_users.py", type: "file", path: "tests/test_users.py" },
      { name: "__init__.py", type: "file", path: "tests/__init__.py" },
    ],
  },
  { name: "requirements.txt", type: "file", path: "requirements.txt" },
  { name: ".env.example", type: "file", path: ".env.example" },
  { name: "README.md", type: "file", path: "README.md" },
]

export function WorkspacePane({
  isOpen,
  onClose,
  content,
  onProfileSave,
  onUpgradePlan,
  onHiringManagerStepChange,
  onViewJob,
  onBackToJobBoard,
  onApplyForJob,
  onRequestSubmit,
  onConfirmSubmit,
  onSubmissionComplete,
}: WorkspacePaneProps) {
  console.log("[v0] WorkspacePane rendered with content.type:", content.type)

  const [isGithubOpen, setIsGithubOpen] = useState(false)
  const [githubConnected, setGithubConnected] = useState(true)
  const [githubRepo, setGithubRepo] = useState("jonesy02/coding-challenge.git")
  const [activeBranch, setActiveBranch] = useState("main")
  const [isPulling, setIsPulling] = useState(false)
  const [isPushing, setIsPushing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState("Just now")

  const [selectedFile, setSelectedFile] = useState("app/main.py")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["app", "app/routers"]))
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  // ADDED: Submission flow states
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false)
  const [submissionComplete, setSubmissionComplete] = useState(false)

  const [showApplicationStatusLocal, setShowApplicationStatusLocal] = useState(false)

  const [fileContents, setFileContents] = useState<Record<string, string>>({
    "app/main.py": `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, items
from app.database import engine
from app.models import user, item

# Create database tables
user.Base.metadata.create_all(bind=engine)
item.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FastAPI Application",
    description="A sample FastAPI application with user and item management",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(items.router, prefix="/api/items", tags=["items"])

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Application"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}`,

    "app/config.py": `from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "FastAPI Application"
    database_url: str = "sqlite:///./app.db"
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()`,

    "app/database.py": `from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()`,

    "app/routers/users.py": `from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import user as user_schema
from app.models import user as user_model

router = APIRouter()

@router.get("/", response_model=list[user_schema.User])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(user_model.User).offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=user_schema.User)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = user_model.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=user_schema.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user`,

    "app/routers/items.py": `from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import item as item_schema
from app.models import item as item_model

router = APIRouter()

@router.get("/", response_model=list[item_schema.Item])
def get_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(item_model.Item).offset(skip).limit(limit).all()
    return items

@router.post("/", response_model=item_schema.Item)
def create_item(item: item_schema.ItemCreate, db: Session = Depends(get_db)):
    db_item = item_model.Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item`,

    "requirements.txt": `fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pydantic==2.5.3
pydantic-settings==2.1.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4`,

    ".env.example": `APP_NAME=FastAPI Application
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30`,

    "README.md": `# FastAPI Application

A sample FastAPI application with user and item management.

## Setup

1. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Copy .env.example to .env and update values:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Run the application:
\`\`\`bash
uvicorn app.main:app --reload
\`\`\`

## API Documentation

Visit http://localhost:8000/docs for interactive API documentation.`,
  })

  // Auto-save functionality with debounce
  useEffect(() => {
    if (!fileContents[selectedFile]) return

    const timer = setTimeout(() => {
      setIsSaving(true)
      setTimeout(() => {
        setIsSaving(false)
        setLastSaved(new Date())
      }, 1000)
    }, 1000)

    return () => clearTimeout(timer)
  }, [fileContents, selectedFile])

  const handleCodeChange = (value: string) => {
    setFileContents((prev) => ({
      ...prev,
      [selectedFile]: value,
    }))
  }

  const handleDownload = () => {
    const blob = new Blob([fileContents[selectedFile] || ""], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = selectedFile
    a.click()
    URL.revokeObjectURL(url)
  }

  // Mock pull changes function
  const handlePullChanges = () => {
    setIsPulling(true)
    setTimeout(() => {
      setIsPulling(false)
      setLastSyncTime("Just now")
      console.log("[v0] Pulled changes from GitHub")
    }, 2000)
  }

  // Mock push changes function
  const handlePushChanges = () => {
    setIsPushing(true)
    setTimeout(() => {
      setIsPushing(false)
      setLastSyncTime("Just now")
      console.log("[v0] Pushed changes to GitHub")
    }, 2000)
  }

  const handleSubmitChallenge = () => {
    if (onRequestSubmit) {
      onRequestSubmit()
    }
  }

  const handleToggleApplicationView = (show: boolean) => {
    console.log("[v0] handleToggleApplicationView called with:", show)
    setShowApplicationStatusLocal(show)
  }

  // </CHANGE>
  const handleViewJobDetails = (job: JobListing) => {
    if (onViewJob) {
      onViewJob(job)
    }
  }

  const handleApplyForJob = (job: JobListing) => {
    console.log("[v0] handleApplyForJob called for:", job.title)
    if (onApplyForJob) {
      onApplyForJob(job)
    }
    setShowApplicationStatusLocal(true)
    // Open the job view to show application status
    if (onViewJob) {
      onViewJob(job)
    }
  }

  useEffect(() => {
    const handleConfirmSubmission = () => {
      setIsSubmittingChallenge(true)

      // Simulate submission process (2-3 seconds)
      setTimeout(() => {
        setIsSubmittingChallenge(false)
        setSubmissionComplete(true)

        setTimeout(() => {
          onClose()
          // Notify chat to show follow-up message
          if (onSubmissionComplete) {
            onSubmissionComplete()
          }
        }, 3000)
        // </CHANGE>
      }, 2500)
    }

    window.addEventListener("confirm-challenge-submission", handleConfirmSubmission)
    return () => window.removeEventListener("confirm-challenge-submission", handleConfirmSubmission)
  }, [onClose, onSubmissionComplete]) // <-- Added onSubmissionComplete to dependency array

  const handleSaveAsDraft = () => {
    setIsSavingDraft(true)
    setTimeout(() => {
      setIsSavingDraft(false)
      console.log("[v0] Draft saved successfully")
      // Show success toast or notification
    }, 1500)
  }

  const handleRequestExtension = () => {
    console.log("[v0] Request extension clicked")
    // Open extension request dialog
  }

  const handleAskQuestion = () => {
    console.log("[v0] Ask question clicked")
    // Open question dialog or chat
  }

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const FileTreeNode = ({ node, depth = 0 }: { node: FileNode; depth?: number }) => {
    const isExpanded = expandedFolders.has(node.path)
    const isSelected = node.type === "file" && node.path === selectedFile
    const paddingLeft = `${depth * 12 + 12}px`

    if (node.type === "folder") {
      return (
        <>
          <button
            onClick={() => toggleFolder(node.path)}
            className="w-full flex items-center gap-2 py-1.5 rounded-lg text-sm transition-colors hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            style={{ paddingLeft }}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
            <span>{node.name}</span>
          </button>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child) => (
                <FileTreeNode key={child.path} node={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </>
      )
    }

    return (
      <button
        onClick={() => setSelectedFile(node.path)}
        className={`w-full flex items-center gap-2 py-1.5 rounded-lg text-sm transition-colors ${
          isSelected
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
        }`}
        style={{ paddingLeft }}
      >
        <FileCode className="w-4 h-4" />
        <span>{node.name}</span>
      </button>
    )
  }

  // ADDED: Show submission loading state
  if (isSubmittingChallenge) {
    return (
      <div className="flex flex-col h-full border-l items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-muted border-t-[#A16AE8] border-r-[#8096FD] animate-spin" />
          </div>
          {/* </CHANGE> */}
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">Submitting Your Challenge...</h3>
            <p className="text-muted-foreground">Please wait while we process your submission</p>
          </div>
        </div>
      </div>
    )
  }

  // ADDED: Show submission success state
  if (submissionComplete) {
    return (
      <div className="flex flex-col h-full border-l items-center justify-center bg-background">
        <div className="text-center space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-green-600">Take Home Challenge Submitted!</h3>
            <p className="text-muted-foreground">Your submission has been sent to the hiring manager</p>
          </div>
        </div>
      </div>
    )
  }

  // Start
  if (content.type === "challenge-loading") {
    return (
      <div className="flex flex-col h-full border-l items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-muted border-t-[#A16AE8] border-r-[#8096FD] animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">Loading Take Home Challenge...</h3>
            <p className="text-muted-foreground">Preparing your coding environment</p>
          </div>
        </div>
      </div>
    )
  }
  // </CHANGE> End

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full border-l">
        {content.title && (
          <div className="flex items-center px-6 py-4 border-b">
            {content.type === "job-view" && (
              <button
                onClick={onBackToJobBoard}
                className="flex items-center gap-1 px-2 py-1 mr-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Back to job board"
              >
                <span className="text-lg font-semibold">←</span>
              </button>
            )}
            <h2 className="text-lg font-semibold">{content.title}</h2>

            <div className="flex items-center gap-1.5 ml-auto">
              {content.type === "code" && (
                <>
                  {/* Save as Draft Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveAsDraft}
                    disabled={isSavingDraft || isSubmitting || isSubmittingChallenge}
                    className="gap-2 bg-transparent"
                  >
                    {isSavingDraft ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save as Draft
                      </>
                    )}
                  </Button>

                  {/* Submit Challenge Button */}
                  <Button
                    size="sm"
                    onClick={handleSubmitChallenge}
                    disabled={isSubmitting || isSavingDraft || isSubmittingChallenge}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Challenge
                      </>
                    )}
                  </Button>

                  {/* Additional Options Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <MoreVertical className="w-4 h-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleRequestExtension}>
                        <Clock className="w-4 h-4 mr-2" />
                        Request Extension
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleAskQuestion}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask Question
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => console.log("Withdraw submission")}>
                        <span>Withdraw Submission</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                aria-label="Close workspace"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {/* </CHANGE> */}
          </div>
        )}

        {content.type === "code" && (
          <div className="flex h-full gap-4 p-6">
            {/* File Explorer Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">File Explorer</h3>
                <Popover open={isGithubOpen} onOpenChange={setIsGithubOpen}>
                  <PopoverTrigger asChild>
                    <button className="p-1.5 rounded-lg hover:bg-accent transition-colors" aria-label="GitHub">
                      <Github className="w-4 h-4 text-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-4">
                      {/* Connection Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm font-medium">Connected to GitHub</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{lastSyncTime}</span>
                      </div>

                      {/* Repository */}
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Repository</label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-background border rounded-md">
                          <Github className="w-4 h-4 text-muted-foreground" />
                          <Input
                            value={githubRepo}
                            onChange={(e) => setGithubRepo(e.target.value)}
                            className="border-0 p-0 h-auto focus-visible:ring-0 text-sm"
                            autoFocus={false}
                            tabIndex={-1}
                          />
                        </div>
                      </div>

                      {/* Active Branch */}
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Active Branch</label>
                        <div className="flex items-center gap-2">
                          <Select value={activeBranch} onValueChange={setActiveBranch}>
                            <SelectTrigger className="flex-1">
                              <div className="flex items-center gap-2">
                                <GitBranch className="w-4 h-4" />
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="main">main</SelectItem>
                              <SelectItem value="develop">develop</SelectItem>
                              <SelectItem value="feature/github-integration">feature/github-integration</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="outline" className="h-9 w-9 bg-transparent">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={handlePullChanges}
                          disabled={isPulling || isPushing}
                        >
                          {isPulling ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Pulling...
                            </>
                          ) : (
                            "Pull Changes"
                          )}
                        </Button>
                        <Button className="flex-1" onClick={handlePushChanges} disabled={isPulling || isPushing}>
                          {isPushing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Pushing...
                            </>
                          ) : (
                            "Push Changes"
                          )}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-0.5">
                {mockFileStructure.map((node) => (
                  <FileTreeNode key={node.path} node={node} />
                ))}
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Editor Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">{selectedFile}</h3>
                <div className="flex items-center gap-3">
                  {/* Auto-save Status */}
                  {isSaving ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Saving</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : lastSaved ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Auto-Saved</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : null}

                  {/* Download Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleDownload}
                        className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                        aria-label="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Code Textarea */}
              <textarea
                value={fileContents[selectedFile] || ""}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="flex-1 w-full p-4 bg-muted/30 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {content.type === "job-view" && content.job && (
          <JobView
            job={content.job}
            onApplyForJob={handleApplyForJob}
            onBack={onBackToJobBoard}
            showApplicationStatus={showApplicationStatusLocal}
            onToggleApplicationView={handleToggleApplicationView}
          />
        )}
        {/* </CHANGE> */}

        {content.type === "job-board" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Applied Jobs Section */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="text-xl font-semibold">Applied Jobs</h3>
                  <span className="px-2.5 py-0.5 bg-[#A16AE8] text-white text-sm font-medium rounded-full">
                    {mockJobListings.filter((j) => j.applied).length}
                  </span>
                </div>
                {mockJobListings.filter((j) => j.applied).length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-lg">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">You haven't applied to any jobs yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {mockJobListings
                      .filter((j) => j.applied)
                      .map((job) => {
                        const fitLevel =
                          job.skillMatch && job.skillMatch >= 90
                            ? "STRONG FIT"
                            : job.skillMatch && job.skillMatch >= 80
                              ? "GOOD FIT"
                              : "MODERATE FIT"
                        const fitColor =
                          fitLevel === "STRONG FIT"
                            ? "text-green-500"
                            : fitLevel === "GOOD FIT"
                              ? "text-orange-500"
                              : "text-yellow-500"

                        return (
                          <div
                            key={job.id}
                            className="relative p-6 border border-border rounded-lg hover:border-[#A16AE8] transition-all bg-card/50 backdrop-blur cursor-pointer"
                            onClick={() => onViewJob?.(job)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-lg">{job.title}</h4>
                                  <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs font-medium rounded">
                                    Open
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{job.company}</p>
                                <div className="flex flex-col gap-1.5 text-sm text-muted-foreground mb-3">
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    <span>{job.location}</span>
                                    <span className="mx-1">•</span>
                                    <Briefcase className="w-4 h-4" />
                                    <span>{job.type}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <DollarSign className="w-4 h-4" />
                                    <span>{job.salary}</span>
                                    <span className="mx-1">•</span>
                                    <Clock className="w-4 h-4" />
                                    <span>1 week ago</span>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                  {job.description || "Design and implement scalable backend services and APIs."}
                                </p>
                              </div>
                              <div className="flex flex-col items-center gap-2 ml-4 flex-shrink-0">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                  {job.logo ? (
                                    <img
                                      src={job.logo || "/placeholder.svg"}
                                      alt={`${job.company} logo`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = "none"
                                        const fallback = target.nextElementSibling as HTMLElement
                                        if (fallback) fallback.style.display = "flex"
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground"
                                    style={{ display: job.logo ? "none" : "flex" }}
                                  >
                                    {job.company.charAt(0)}
                                  </div>
                                </div>
                                {job.skillMatch && (
                                  <div className="flex flex-col items-center">
                                    <div className={`text-3xl font-bold ${fitColor}`} style={{ lineHeight: "1" }}>
                                      {job.skillMatch}%
                                    </div>
                                    <div
                                      className={`text-[10px] font-semibold ${fitColor} mt-1`}
                                      style={{ lineHeight: "1" }}
                                    >
                                      {fitLevel}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewJob?.(job)
                              }}
                              className="w-full py-2.5 bg-[#A16AE8] hover:bg-[#8f5cd4] text-white font-medium rounded-lg transition-colors"
                            >
                              View Application
                            </button>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Saved Jobs Section */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="text-xl font-semibold">Saved Jobs</h3>
                  <span className="px-2.5 py-0.5 bg-[#A16AE8] text-white text-sm font-medium rounded-full">
                    {mockJobListings.filter((j) => j.saved && !j.applied).length}
                  </span>
                </div>
                {mockJobListings.filter((j) => j.saved && !j.applied).length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-lg">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">You haven't saved any jobs yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {mockJobListings
                      .filter((j) => j.saved && !j.applied)
                      .map((job) => {
                        const fitLevel =
                          job.skillMatch && job.skillMatch >= 90
                            ? "STRONG FIT"
                            : job.skillMatch && job.skillMatch >= 80
                              ? "GOOD FIT"
                              : "MODERATE FIT"
                        const fitColor =
                          fitLevel === "STRONG FIT"
                            ? "text-green-500"
                            : fitLevel === "GOOD FIT"
                              ? "text-orange-500"
                              : "text-yellow-500"

                        return (
                          <div
                            key={job.id}
                            className="relative p-6 border border-border rounded-lg hover:border-[#A16AE8] transition-all bg-card/50 backdrop-blur cursor-pointer"
                            onClick={() => onViewJob?.(job)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-lg">{job.title}</h4>
                                  <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs font-medium rounded">
                                    Open
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{job.company}</p>
                                <div className="flex flex-col gap-1.5 text-sm text-muted-foreground mb-3">
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    <span>{job.location}</span>
                                    <span className="mx-1">•</span>
                                    <Briefcase className="w-4 h-4" />
                                    <span>{job.type}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <DollarSign className="w-4 h-4" />
                                    <span>{job.salary}</span>
                                    <span className="mx-1">•</span>
                                    <Clock className="w-4 h-4" />
                                    <span>2 days ago</span>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                  {job.description ||
                                    "We're looking for an experienced full-stack developer to join our growing..."}
                                </p>
                              </div>
                              <div className="flex flex-col items-center gap-2 ml-4 flex-shrink-0">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                  {job.logo ? (
                                    <img
                                      src={job.logo || "/placeholder.svg"}
                                      alt={`${job.company} logo`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = "none"
                                        const fallback = target.nextElementSibling as HTMLElement
                                        if (fallback) fallback.style.display = "flex"
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground"
                                    style={{ display: job.logo ? "none" : "flex" }}
                                  >
                                    {job.company.charAt(0)}
                                  </div>
                                </div>
                                {job.skillMatch && (
                                  <div className="flex flex-col items-center">
                                    <div className={`text-3xl font-bold ${fitColor}`} style={{ lineHeight: "1" }}>
                                      {job.skillMatch}%
                                    </div>
                                    <div
                                      className={`text-[10px] font-semibold ${fitColor} mt-1`}
                                      style={{ lineHeight: "1" }}
                                    >
                                      {fitLevel}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApplyForJob(job)
                              }}
                              className="w-full py-2.5 bg-[#A16AE8] hover:bg-[#8f5cd4] text-white font-medium rounded-lg transition-colors"
                            >
                              Submit Application
                            </button>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
