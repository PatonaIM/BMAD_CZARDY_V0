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
  ArrowLeft,
  ImageIcon,
  Play,
  Mail,
  Search,
  Star,
} from "lucide-react"
import { useState, useEffect, useMemo, type RefObject, useRef } from "react" // Added useRef and useImperativeHandle
import type { WorkspaceContent, JobListing, CandidateProfile } from "@/types/workspace"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { CandidateSwipe } from "@/components/candidate-swipe"
import { MatchSuccess } from "@/components/match-success"
import { mockCandidates, getRandomizedCandidates } from "@/lib/mock-candidates"
import { getCurrentUser } from "@/lib/auth"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet" // Added for candidate-chat
import { CandidateChat } from "@/components/candidate-chat" // Added for candidate-chat
import { CandidateProfileView } from "@/components/candidate-profile-view" // Added for candidate-profile-view
import { BrowseCandidates } from "@/components/browse-candidates" // Added for browse-candidates
import { CandidateProfileForm } from "@/components/candidate-profile-form-full"
import { HiringManagerProfileForm } from "@/components/hiring-manager-profile-form-full"
import { CandidatePricing } from "@/components/candidate-pricing-full"
import { PaymentSuccess } from "@/components/payment-success-full"
// IMPORTED: mockJobListings from "@/lib/mock-data"
import { mockJobListings } from "@/lib/mock-data"
import { mockHiringManagerJobs } from "@/lib/mock-hiring-manager-jobs"

// Mock getCurrentUser function - replace with actual implementation if needed
// const getCurrentUser = () => ({
//   id: "1",
//   name: "John Doe",
//   email: "john.doe@example.com",
//   role: "candidate", // or "hiring_manager", "recruiter", etc.
//   profile: {},
//   company: {},
// })

interface WorkspacePaneProps {
  isOpen: boolean
  onClose: () => void
  content: WorkspaceContent
  onProfileSave?: () => void // Added callback for profile save
  onUpgradePlan?: () => void // Added onUpgradePlan prop
  onHiringManagerStepChange?: (step: number) => void
  onViewJob?: (job: JobListing) => void // Added callback for viewing job details
  onBackToJobBoard?: () => void // Added onBackToJobBoard prop
  onApplyForJob?: (job: JobListing) => void // Added prop
  // ADDED: onOpenWorkspace prop
  onOpenWorkspace?: (content: WorkspaceContent) => void // Updated to accept WorkspaceContent
  // ADDED: showApplicationStatus and onToggleApplicationView props
  showApplicationStatus?: boolean
  onToggleApplicationView?: (show: boolean) => void
  onRequestSubmit?: () => void
  onConfirmSubmit?: () => void
  onSubmissionComplete?: () => void
  onSendMessage?: (message: string) => void
  onSendAIMessage?: (message: string, agentId?: string) => void
  // </CHANGE>
  // ADDED: onOpenCandidateChat prop
  onOpenCandidateChat?: (candidate: CandidateProfile, job?: JobListing) => void
  chatMainRef?: RefObject<any> // Added chatMainRef prop
  // ADDED: onIntroduceMatchedCandidate prop
  onIntroduceMatchedCandidate?: (
    candidate: CandidateProfile,
    hiringManagerName: string,
    position: string,
    company: string,
  ) => void
  // ADDED: onCloseWorkspace prop
  onCloseWorkspace?: () => void
  // ADDED: onClearMessages prop
  onClearMessages?: () => void // Added onClearMessages prop
  onJobBoardTabChange?: (tab: "applied" | "invited" | "saved" | "browse") => void
  // </CHANGE>
  jobBoardTab?: "applied" | "invited" | "saved" | "browse" // ADDED: prop to allow external control of the job board tab
}

// REMOVED: mockJobListings definition as it's now imported from "@/lib/mock-data"
// const mockJobListings: JobListing[] = [
//   {
//     id: "1",
//     title: "Senior Full-Stack Developer",
//     company: "Teamified",
//     companyWebsite: "https://teamified.com",
//     location: "Manila, Philippines",
//     type: "Full-time",
//     salary: "$45k - $65k",
//     posted: "2 days ago",
//     description: "We're looking for an experienced full-stack developer to join our growing team in Manila.",
//     requirements: ["5+ years experience", "React & Node.js", "TypeScript", "AWS"],
//     applied: false,
//     saved: true,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/teamified-logo-100x100-NwpwYu9vSkuPkpVvtw9Esz8i2xD0Q4.png",
//     status: "open",
//     skillMatch: 88,
//     jobSummary:
//       "• Lead the development of scalable web applications using modern technologies\n• Collaborate with product and design teams to deliver exceptional user experiences\n• Mentor junior developers and contribute to technical decision-making\n• Optimize application performance and ensure code quality through best practices\n• Participate in agile ceremonies and contribute to sprint planning",
//     aboutClient:
//       "Teamified is a leading HR technology company that helps businesses build and manage high-performing teams through innovative software solutions.",
//     qualifications: [
//       "5+ years of professional software development experience",
//       "Strong proficiency in React, Node.js, and TypeScript",
//       "Experience with AWS cloud services and infrastructure",
//       "Solid understanding of RESTful APIs and microservices architecture",
//       "Experience with SQL and NoSQL databases",
//       "Strong problem-solving and communication skills",
//     ],
//     responsibilities: [
//       "Design and develop scalable full-stack applications",
//       "Collaborate with cross-functional teams to define and implement new features",
//       "Write clean, maintainable, and well-documented code",
//       "Participate in code reviews and provide constructive feedback",
//       "Mentor junior developers and contribute to team knowledge sharing",
//       "Optimize application performance and ensure high availability",
//     ],
//     benefits: [
//       "Competitive salary and performance bonuses",
//       "Health insurance coverage",
//       "Flexible work arrangements",
//       "Professional development budget",
//       "Annual team retreats",
//       "Modern office equipment",
//     ],
//     department: "Engineering",
//     reportingTo: "Engineering Manager",
//     teamSize: "8-10 engineers",
//     workArrangement: "Hybrid (3 days office, 2 days remote)",
//     applicationDeadline: "March 15, 2025",
//     hiringManager: "Sarah Chen",
//     openings: 2,
//   },
//   {
//     id: "2",
//     title: "AI Engineer",
//     company: "Archa",
//     companyWebsite: "https://archa.io",
//     location: "Bangalore, India",
//     type: "Full-time",
//     salary: "$35k - $55k",
//     posted: "1 week ago",
//     description: "Join our AI team to build cutting-edge machine learning solutions.",
//     requirements: ["Python", "TensorFlow/PyTorch", "ML algorithms", "3+ years experience"],
//     applied: true,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/archa%20logo-8NVeEWIzgR0Y8aHBeqraSQWXy0mM3f.png",
//     status: "open",
//     skillMatch: 75,
//     applicationStage: "applied",
//     takeHomeChallengeCompleted: false,
//     aiInterviewCompleted: false,
//     finalReviewCompleted: false,
//     jobSummary:
//       "• Design and implement machine learning models for production systems\n• Work with large datasets to train and optimize AI algorithms\n• Collaborate with engineering teams to integrate ML solutions into products\n• Research and evaluate new AI technologies and methodologies\n• Monitor model performance and implement improvements",
//     aboutClient:
//       "Archa is a fast-growing AI startup focused on developing next-generation machine learning platforms for enterprises.",
//     benefits: [
//       "Competitive compensation with equity options",
//       "Comprehensive health and wellness benefits",
//       "Flexible remote work policy",
//       "Learning and development stipend",
//       "Conference attendance opportunities",
//       "Cutting-edge hardware and tools",
//     ],
//   },
//   {
//     id: "3",
//     title: "Product Manager",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Sydney, Australia",
//     type: "Full-time",
//     salary: "$90k - $120k",
//     posted: "3 days ago",
//     description: "Lead product strategy and execution for our flagship product in Sydney.",
//     requirements: ["5+ years PM experience", "Agile/Scrum", "Data-driven", "B2B SaaS"],
//     saved: true,
//     invited: true,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "open",
//     skillMatch: 82,
//     matchedCandidates: [], // No matched candidates yet
//     jobSummary:
//       "• Define and execute product roadmap aligned with business objectives\n• Conduct market research and competitive analysis to identify opportunities\n• Work closely with engineering, design, and sales teams to deliver features\n• Analyze product metrics and user feedback to drive continuous improvement\n• Present product vision and strategy to stakeholders and leadership",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a strong presence across Australia, New Zealand, and Southeast Asia. Established in 2015, we've grown from a small startup to a publicly-traded company serving over 2,000 enterprise customers. Our comprehensive suite of business management tools helps organizations streamline operations, improve productivity, and drive growth. We're committed to innovation and customer success, investing heavily in R&D and maintaining a customer satisfaction rate of over 95%. Our Sydney headquarters houses our product development, sales, and customer success teams, creating a collaborative environment where ideas flourish. We've been recognized as one of Australia's fastest-growing tech companies for three consecutive years. Join us to be part of a dynamic team that's shaping the future of enterprise software.",
//     benefits: [
//       "Excellent salary package with performance bonuses",
//       "Premium health insurance for you and family",
//       "Generous parental leave policy",
//       "Stock options and equity participation",
//       "Professional development and training",
//       "Modern Sydney office with amenities",
//     ],
//   },
//   {
//     id: "4",
//     title: "DevOps Engineer",
//     company: "Zai",
//     companyWebsite: "https://zai.com",
//     location: "Colombo, Sri Lanka",
//     type: "Full-time",
//     salary: "$30k - $45k",
//     posted: "5 days ago",
//     description: "Build and maintain our cloud infrastructure and CI/CD pipelines.",
//     requirements: ["Kubernetes", "Docker", "AWS/GCP", "Terraform", "4+ years experience"],
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mmp2tJXTgvXPeoADutH4SeeUExx52Q.png",
//     status: "closed",
//     skillMatch: 70,
//     jobSummary:
//       "• Design and maintain scalable cloud infrastructure on AWS/GCP\n• Implement and optimize CI/CD pipelines for automated deployments\n• Monitor system performance and ensure high availability\n• Automate infrastructure provisioning using Infrastructure as Code\n• Collaborate with development teams to improve deployment processes",
//     aboutClient:
//       "Zai is a rapidly growing software company specializing in cloud-native solutions and infrastructure management.",
//     benefits: [
//       "Competitive salary with annual increments",
//       "Health and life insurance coverage",
//       "Work from home flexibility",
//       "Annual performance bonuses",
//       "Training and certification support",
//       "Team building activities and events",
//     ],
//   },
//   {
//     id: "5",
//     title: "Frontend Developer",
//     company: "Thriday",
//     companyWebsite: "https://thriday.com.au",
//     location: "Cebu, Philippines",
//     type: "Full-time",
//     salary: "$35k - $50k",
//     posted: "1 day ago",
//     description: "Create beautiful and responsive user interfaces for our web applications.",
//     requirements: ["React", "TypeScript", "CSS/Tailwind", "3+ years experience"],
//     applied: false,
//     saved: true,
//     invited: true,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thriday-68gUuSiBQGK2cI3hLc8Y4qDoW2F3cq.png",
//     status: "open",
//     skillMatch: 92,
//     jobSummary:
//       "• Build responsive and accessible user interfaces using React and TypeScript\n• Collaborate with designers to implement pixel-perfect designs\n• Optimize frontend performance and ensure cross-browser compatibility\n• Write reusable components and maintain component libraries\n• Participate in code reviews and contribute to frontend architecture decisions",
//     aboutClient:
//       "Thriday is a FinTech startup revolutionizing personal finance management with user-friendly digital tools.",
//     benefits: [
//       "Competitive salary and quarterly bonuses",
//       "HMO coverage for you and dependents",
//       "Fully remote work setup",
//       "Internet and equipment allowance",
//       "Learning and development budget",
//       "Flexible working hours",
//     ],
//   },
//   {
//     id: "6",
//     title: "Data Scientist",
//     company: "Fortify",
//     companyWebsite: "https://fortify.com",
//     location: "Mumbai, India",
//     type: "Full-time",
//     salary: "$40k - $60k",
//     posted: "4 days ago",
//     description: "Analyze complex datasets and build predictive models to drive business insights.",
//     requirements: ["Python", "SQL", "Machine Learning", "Statistics", "4+ years experience"],
//     applied: false,
//     invited: true,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fortify_technology_logo-YLpzlGSivDsK2fFXLdnF7N0ewgUM3d.jpeg",
//     status: "draft",
//     skillMatch: 78,
//     jobSummary:
//       "• Analyze large datasets to extract actionable insights and identify trends\n• Develop and deploy machine learning models for predictive analytics\n• Collaborate with stakeholders to understand data needs and define metrics\n• Build data pipelines and ensure data quality and integrity\n• Communicate findings and recommendations through visualizations and reports",
//     aboutClient:
//       "Fortify is a cybersecurity firm dedicated to protecting businesses from evolving digital threats through advanced security solutions.",
//     benefits: [
//       "Attractive salary and stock options",
//       "Comprehensive health and dental insurance",
//       "Remote work options with flexible hours",
//       "Annual company retreats and team events",
//       "Access to cutting-edge tools and technologies",
//     ],
//   },
//   {
//     id: "7",
//     title: "Backend Developer",
//     company: "Archa",
//     companyWebsite: "https://archa.io",
//     location: "Melbourne, Australia",
//     type: "Full-time",
//     salary: "$85k - $110k",
//     posted: "1 week ago",
//     description: "Design and implement scalable backend services and APIs.",
//     requirements: ["Node.js or Java", "Microservices", "Databases", "5+ years experience"],
//     applied: true,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/archa%20logo-8NVeEWIzgR0Y8aHBeqraSQWXy0mM3f.png",
//     status: "open",
//     skillMatch: 85,
//     applicationStage: "take-home-challenge",
//     takeHomeChallengeCompleted: true,
//     aiInterviewCompleted: false,
//     finalReviewCompleted: false,
//     jobSummary:
//       "• Design and develop robust and scalable backend services and APIs\n• Implement microservices architecture and ensure seamless integration\n• Manage and optimize database performance and integrity\n• Write clean, efficient, and well-documented code\n• Collaborate with frontend teams to define API contracts",
//     aboutClient:
//       "Archa is a fast-growing AI startup focused on developing next-generation machine learning platforms for enterprises.",
//     benefits: [
//       "Highly competitive salary and performance bonuses",
//       "Full family medical, dental, and vision coverage",
//       "Flexible work hours and remote options",
//       "Generous annual leave and paid holidays",
//       "Opportunities for advanced technical training",
//       "Modern office space with excellent amenities",
//     ],
//   },
//   {
//     id: "8",
//     title: "QA Engineer",
//     company: "Teamified",
//     companyWebsite: "https://teamified.com",
//     location: "Remote (Philippines)",
//     type: "Full-time",
//     salary: "$30k - $45k",
//     posted: "2 days ago",
//     description: "Ensure software quality through comprehensive testing and automation.",
//     requirements: ["Test automation", "Selenium/Cypress", "API testing", "3+ years experience"],
//     applied: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/teamified-logo-100x100-NwpwYu9vSkuPkpVvtw9Esz8i2xD0Q4.png",
//     status: "closed",
//     skillMatch: 72,
//     jobSummary:
//       "• Develop and execute comprehensive test plans and test cases\n• Perform manual and automated testing for web and mobile applications\n• Identify, document, and track bugs through to resolution\n• Collaborate with development teams to ensure high-quality releases\n• Contribute to the improvement of QA processes and methodologies",
//     aboutClient:
//       "Teamified is a leading HR technology company that helps businesses build and manage high-performing teams through innovative software solutions.",
//     benefits: [
//       "Competitive salary and regular performance reviews",
//       "Comprehensive health benefits package",
//       "Fully remote work environment",
//       "Opportunities for professional development and training",
//       "Team collaboration and knowledge sharing sessions",
//       "Modern tools and technologies for testing",
//     ],
//   },
//   {
//     id: "9",
//     title: "Mobile Developer (iOS)",
//     company: "Zai",
//     companyWebsite: "https://zai.com",
//     location: "Pune, India",
//     type: "Full-time",
//     salary: "$38k - $55k",
//     posted: "6 days ago",
//     description: "Build native iOS applications with cutting-edge features.",
//     requirements: ["Swift", "iOS SDK", "UIKit/SwiftUI", "4+ years experience"],
//     applied: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mmp2tJXTgvXPeoADutH4SeeUExx52Q.png",
//     status: "open",
//     skillMatch: 80,
//     jobSummary:
//       "• Develop and maintain native iOS applications using Swift\n• Implement user interfaces with UIKit and SwiftUI\n• Integrate with backend APIs and services\n• Optimize application performance and ensure a smooth user experience\n• Collaborate with designers and product managers on new features",
//     aboutClient:
//       "Zai is a tech consultancy firm focused on delivering innovative mobile solutions across various industries.",
//     benefits: [
//       "Competitive salary and annual bonuses",
//       "Excellent health insurance plan",
//       "Flexible work arrangements",
//       "Access to the latest Apple hardware and software",
//       "Opportunities for career growth and specialization",
//       "Company-sponsored training and conferences",
//     ],
//   },
//   {
//     id: "10",
//     title: "UX/UI Designer",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Brisbane, Australia",
//     type: "Full-time",
//     salary: "$70k - $95k",
//     posted: "3 days ago",
//     description: "Create intuitive and visually appealing user experiences.",
//     requirements: ["Figma", "User research", "Prototyping", "4+ years experience"],
//     applied: false,
//     saved: true,
//     invited: true,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "draft",
//     skillMatch: 86,
//     jobSummary:
//       "• Design intuitive and engaging user interfaces for web and mobile applications\n• Conduct user research and usability testing to inform design decisions\n• Create wireframes, mockups, and interactive prototypes using Figma\n• Develop and maintain design systems and style guides\n• Collaborate with product and engineering teams to ensure design feasibility",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a presence across Australia, New Zealand, and Southeast Asia. Established in 2015, we've grown from a small startup to a publicly-traded company serving over 2,000 enterprise customers. Our comprehensive suite of business management tools helps organizations streamline operations, improve productivity, and drive growth. We're committed to innovation and customer success, investing heavily in R&D and maintaining a customer satisfaction rate of over 95%. Our Sydney headquarters houses our product development, sales, and customer success teams, creating a collaborative environment where ideas flourish. We've been recognized as one of Australia's fastest-growing tech companies for three consecutive years. Join us to be part of a dynamic team that's shaping the future of enterprise software.",
//     benefits: [
//       "Competitive salary and annual performance incentives",
//       "Comprehensive health and wellness benefits",
//       "Flexible work arrangements",
//       "Professional development opportunities and workshops",
//       "Access to the latest design software and tools",
//       "Collaborative and creative work environment",
//     ],
//   },
//   {
//     id: "11",
//     title: "Solutions Architect",
//     company: "Fortify",
//     companyWebsite: "https://fortify.com",
//     location: "Galle, Sri Lanka",
//     type: "Full-time",
//     salary: "$50k - $70k",
//     posted: "1 week ago",
//     description: "Design and implement enterprise-level cloud solutions.",
//     requirements: ["AWS/Azure", "System design", "Architecture patterns", "7+ years experience"],
//     applied: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fortify_technology_logo-YLpzlGSivDsK2fFXLdnF7N0ewgUM3d.jpeg",
//     status: "open",
//     skillMatch: 89,
//     jobSummary:
//       "• Design and architect scalable and resilient cloud-based solutions on AWS/Azure\n• Define technical standards and best practices for cloud adoption\n• Collaborate with development teams to ensure solutions meet business requirements\n• Provide technical leadership and guidance on cloud technologies\n• Evaluate and recommend new cloud services and tools",
//     aboutClient:
//       "Fortify is a cybersecurity firm dedicated to protecting businesses from evolving digital threats through advanced security solutions.",
//     benefits: [
//       "Excellent salary package and performance bonuses",
//       "Comprehensive health, dental, and vision insurance",
//       "Flexible remote and hybrid work options",
//       "Professional certification and training support",
//       "Opportunities to work on challenging and innovative projects",
//       "Generous paid time off",
//     ],
//   },
//   {
//     id: "12",
//     title: "Scrum Master",
//     company: "Thriday",
//     companyWebsite: "https://thriday.com.au",
//     location: "Makati, Philippines",
//     type: "Full-time",
//     salary: "$40k - $55k",
//     posted: "4 days ago",
//     description: "Facilitate agile processes and remove impediments for development teams.",
//     requirements: ["Scrum certification", "Agile methodologies", "Team facilitation", "3+ years experience"],
//     applied: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thriday-68gUuSiBQGK2cI3hLc8Y4qDoW2F3cq.png",
//     status: "closed",
//     skillMatch: 77,
//     jobSummary:
//       "• Facilitate Scrum ceremonies including sprint planning, daily stand-ups, sprint reviews, and retrospectives\n• Coach and mentor the development team on Agile principles and practices\n• Remove impediments and obstacles that hinder team progress\n• Foster a collaborative and self-organizing team environment\n• Track team progress and report on key agile metrics",
//     aboutClient:
//       "Thriday is a FinTech startup revolutionizing personal finance management with user-friendly digital tools.",
//     benefits: [
//       "Competitive salary and performance incentives",
//       "Comprehensive health and wellness benefits",
//       "Flexible work schedule and remote options",
//       "Opportunities for professional development and certifications",
//       "Supportive team environment and collaborative culture",
//       "Annual performance bonuses",
//     ],
//   },
//   {
//     id: "13",
//     title: "Security Engineer",
//     company: "Archa",
//     companyWebsite: "https://archa.io",
//     location: "Hyderabad, India",
//     type: "Full-time",
//     salary: "$45k - $65k",
//     posted: "2 days ago",
//     description: "Protect our systems and data through robust security measures.",
//     requirements: ["Security protocols", "Penetration testing", "SIEM tools", "5+ years experience"],
//     applied: true,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/archa%20logo-8NVeEWIzgR0Y8aHBeqraSQWXy0mM3f.png",
//     status: "open",
//     skillMatch: 83,
//     applicationStage: "ai-interview",
//     takeHomeChallengeCompleted: true,
//     aiInterviewCompleted: true,
//     finalReviewCompleted: false,
//     jobSummary:
//       "• Implement and maintain security controls to protect systems and data\n• Conduct vulnerability assessments and penetration testing\n• Monitor security alerts and respond to incidents\n• Develop and enforce security policies and procedures\n• Stay up-to-date with the latest security threats and technologies",
//     aboutClient:
//       "Archa is a fast-growing AI startup focused on developing next-generation machine learning platforms for enterprises.",
//     benefits: [
//       "Competitive salary and regular performance reviews",
//       "Comprehensive health, dental, and vision insurance",
//       "Flexible work hours and remote options",
//       "Professional development budget for certifications and training",
//       "Opportunities to work with advanced security technologies",
//       "Generous paid time off",
//     ],
//   },
//   {
//     id: "14",
//     title: "Technical Writer",
//     company: "Teamified",
//     companyWebsite: "https://teamified.com",
//     location: "Remote (Australia)",
//     type: "Contract",
//     salary: "$60k - $80k",
//     posted: "5 days ago",
//     description: "Create clear and comprehensive technical documentation.",
//     requirements: ["Technical writing", "API documentation", "Markdown", "3+ years experience"],
//     applied: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/teamified-logo-100x100-NwpwYu9vSkuPkpVvtw9Esz8i2xD0Q4.png",
//     status: "draft",
//     skillMatch: 74,
//     jobSummary:
//       "• Create and maintain technical documentation, including user guides, API documentation, and release notes\n• Collaborate with engineering and product teams to understand product features and requirements\n• Ensure documentation is accurate, clear, and concise\n• Manage documentation projects and timelines\n• Adhere to company style guides and quality standards",
//     aboutClient:
//       "Teamified is a leading HR technology company that helps businesses build and manage high-performing teams through innovative software solutions.",
//     benefits: [
//       "Competitive contract rate",
//       "Flexible remote working arrangement",
//       "Opportunity to work with a leading HR tech company",
//       "Exposure to diverse technical projects",
//       "Support for professional development",
//     ],
//   },
//   {
//     id: "15",
//     title: "Business Analyst",
//     company: "Zai",
//     companyWebsite: "https://zai.com",
//     location: "Davao, Philippines",
//     type: "Full-time",
//     salary: "$35k - $50k",
//     posted: "1 week ago",
//     description: "Analyze business needs and translate them into technical requirements.",
//     requirements: ["Business analysis", "Requirements gathering", "SQL", "3+ years experience"],
//     applied: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mmp2tJXTgvXPeoADutH4SeeUExx52Q.png",
//     status: "open",
//     skillMatch: 84,
//     jobSummary:
//       "• Analyze business needs and define technical requirements\n• Collaborate with stakeholders to gather and prioritize requirements\n• Develop and maintain project plans and timelines\n• Conduct data analysis to support decision-making\n• Communicate technical requirements and project status to non-technical teams",
//     aboutClient:
//       "Zai is a tech consultancy firm focused on delivering innovative mobile solutions across various industries.",
//     benefits: [
//       "Competitive salary with annual increments",
//       "Health and life insurance coverage",
//       "Flexible work arrangements",
//       "Professional development budget",
//       "Annual team retreats",
//       "Modern office equipment",
//     ],
//   },
//   {
//     id: "16",
//     title: "Engineering Manager",
//     company: "Teamified",
//     companyWebsite: "https://teamified.com",
//     location: "Adelaide, Australia",
//     type: "Full-time",
//     salary: "$110k - $145k",
//     posted: "1 week ago",
//     description: "Lead and mentor a team of software engineers to deliver high-quality products.",
//     requirements: ["7+ years engineering experience", "3+ years management", "Technical leadership", "Agile/Scrum"],
//     applied: true,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/teamified-logo-100x100-NwpwYu9vSkuPkpVvtw9Esz8i2xD0Q4.png",
//     status: "closed",
//     skillMatch: 93,
//     applicationStage: "offer",
//     takeHomeChallengeCompleted: true,
//     aiInterviewCompleted: true,
//     finalReviewCompleted: true,
//     jobSummary:
//       "• Lead and mentor a team of 8-10 software engineers to deliver high-quality products\n• Define technical roadmap and architecture decisions\n• Collaborate with product and design teams on feature planning\n• Conduct performance reviews and support career development\n• Foster a culture of innovation and continuous improvement",
//     aboutClient:
//       "Teamified is a leading HR technology company that helps businesses build and manage high-performing teams through innovative software solutions.",
//     qualifications: [
//       "7+ years of professional software development experience",
//       "3+ years of engineering management experience",
//       "Strong technical background in modern web technologies",
//       "Proven track record of building and leading high-performing teams",
//       "Excellent communication and leadership skills",
//       "Experience with Agile/Scrum methodologies",
//     ],
//     responsibilities: [
//       "Lead and mentor a software engineers",
//       "Define technical strategy and architecture decisions",
//       "Collaborate with stakeholders on product roadmap",
//       "Conduct performance reviews and support career development",
//       "Foster a culture of innovation and continuous improvement",
//       "Ensure delivery of high-quality software products",
//     ],
//     benefits: [
//       "Competitive salary and performance bonuses",
//       "Health insurance coverage",
//       "Flexible work arrangements",
//       "Professional development budget",
//       "Annual team retreats",
//       "Modern office equipment",
//     ],
//     department: "Engineering",
//     reportingTo: "VP of Engineering",
//     teamSize: "8-10 engineers",
//     workArrangement: "Hybrid (3 days office, 2 days remote)",
//     applicationDeadline: "March 20, 2025",
//     hiringManager: "David Thompson",
//     openings: 1,
//   },
//   {
//     id: "17",
//     title: "Senior Data Analyst",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Melbourne, Australia",
//     type: "Full-time",
//     salary: "$85k - $110k",
//     posted: "2 days ago",
//     description: "Analyze complex datasets to drive business insights and strategic decisions.",
//     requirements: ["SQL", "Python/R", "Data visualization", "5+ years experience"],
//     applied: false,
//     saved: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "open",
//     skillMatch: 88,
//     matchedCandidates: [
//       { ...mockCandidates[0], id: "match-17-1", skillMatch: 96 },
//       { ...mockCandidates[4], id: "match-17-2", skillMatch: 94 },
//       { ...mockCandidates[1], id: "match-17-3", skillMatch: 92 },
//       { ...mockCandidates[2], id: "match-17-4", skillMatch: 90 },
//       { ...mockCandidates[3], id: "match-17-5", skillMatch: 88 },
//       { ...mockCandidates[0], id: "match-17-6", name: "David Kim", skillMatch: 86 },
//       { ...mockCandidates[1], id: "match-17-7", name: "Lisa Anderson", skillMatch: 84 },
//       { ...mockCandidates[2], id: "match-17-8", name: "Robert Taylor", skillMatch: 82 },
//       { ...mockCandidates[3], id: "match-17-9", name: "Maria Garcia", skillMatch: 80 },
//       { ...mockCandidates[4], id: "match-17-10", name: "Thomas Brown", skillMatch: 78 },
//       { ...mockCandidates[0], id: "match-17-11", name: "Jennifer Lee", skillMatch: 76 },
//       { ...mockCandidates[1], id: "match-17-12", name: "Christopher White", skillMatch: 74 },
//       { ...mockCandidates[2], id: "match-17-13", name: "Amanda Martinez", skillMatch: 72 },
//       { ...mockCandidates[3], id: "match-17-14", name: "Daniel Harris", skillMatch: 70 },
//       { ...mockCandidates[4], id: "match-17-15", name: "Michelle Clark", skillMatch: 68 },
//       { ...mockCandidates[0], id: "match-17-16", name: "Kevin Lewis", skillMatch: 66 },
//       { ...mockCandidates[1], id: "match-17-17", name: "Rachel Walker", skillMatch: 64 },
//       { ...mockCandidates[2], id: "match-17-18", name: "Brian Hall", skillMatch: 62 },
//       { ...mockCandidates[3], id: "match-17-19", name: "Nicole Allen", skillMatch: 60 },
//       { ...mockCandidates[4], id: "match-17-20", name: "Steven Young", skillMatch: 58 },
//     ],
//     jobSummary:
//       "• Analyze large datasets to identify trends and business opportunities\n• Create dashboards and reports for stakeholders\n• Collaborate with product teams to define metrics and KPIs\n• Develop predictive models to support decision-making\n• Present findings to leadership and recommend actions",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a strong presence across Australia, New Zealand, and Southeast Asia.",
//     benefits: [
//       "Competitive salary package",
//       "Health and wellness benefits",
//       "Flexible work arrangements",
//       "Professional development opportunities",
//       "Stock options",
//       "Modern office facilities",
//     ],
//   },
//   {
//     id: "18",
//     title: "Customer Success Manager",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Sydney, Australia",
//     type: "Full-time",
//     salary: "$75k - $95k",
//     posted: "4 days ago",
//     description: "Build strong relationships with enterprise clients and ensure their success.",
//     requirements: ["B2B SaaS experience", "Account management", "Communication skills", "3+ years"],
//     applied: false,
//     saved: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "open",
//     skillMatch: 85,
//     matchedCandidates: [
//       { ...mockCandidates[4], id: "match-18-1", skillMatch: 93 },
//       { ...mockCandidates[0], id: "match-18-2", skillMatch: 89 },
//       { ...mockCandidates[1], id: "match-18-3", skillMatch: 85 },
//     ],
//     jobSummary:
//       "• Manage portfolio of enterprise customer accounts\n• Drive product adoption and customer satisfaction\n• Identify upsell and expansion opportunities\n• Conduct business reviews and success planning\n• Collaborate with sales and product teams",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a presence across Australia, New Zealand, and Southeast Asia.",
//     benefits: [
//       "Base salary plus commission",
//       "Health insurance coverage",
//       "Flexible work hours",
//       "Career growth opportunities",
//       "Team events and activities",
//       "Central office location",
//     ],
//   },
//   {
//     id: "19",
//     title: "Marketing Manager",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Sydney, Australia",
//     type: "Full-time",
//     salary: "$90k - $115k",
//     posted: "2 months ago",
//     description: "Lead marketing initiatives to drive brand awareness and lead generation.",
//     requirements: ["Digital marketing", "Content strategy", "Analytics", "5+ years experience"],
//     applied: false,
//     saved: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "open", // Changed from "closed" to "open" to make available for browsing
//     skillMatch: 78,
//     jobSummary:
//       "• Develop and execute comprehensive marketing strategies\n• Manage digital marketing campaigns across multiple channels\n• Analyze campaign performance and optimize ROI\n• Collaborate with sales team on lead generation\n• Build and manage marketing team",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a presence across Australia, New Zealand, and Southeast Asia.",
//     benefits: [
//       "Competitive salary and bonuses",
//       "Health and dental insurance",
//       "Work from home flexibility",
//       "Professional development budget",
//       "Stock options",
//       "Team building events",
//     ],
//   },
//   {
//     id: "20",
//     title: "Sales Development Representative",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Brisbane, Australia",
//     type: "Full-time",
//     salary: "$60k - $75k",
//     posted: "3 months ago",
//     description: "Generate qualified leads and support the sales pipeline.",
//     requirements: ["Sales experience", "Communication skills", "CRM proficiency", "2+ years"],
//     applied: false,
//     saved: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "open", // Changed from "closed" to "open" to make available for browsing
//     skillMatch: 72,
//     jobSummary:
//       "• Prospect and qualify leads through outbound activities\n• Schedule meetings for account executives\n• Maintain accurate records in CRM system\n• Meet monthly quota for qualified opportunities\n• Collaborate with marketing on campaigns",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a presence across Australia, New Zealand, and Southeast Asia.",
//     benefits: [
//       "Base salary plus commission",
//       "Health insurance",
//       "Career advancement opportunities",
//       "Sales training and coaching",
//       "Team incentives",
//       "Modern office environment",
//     ],
//   },
//   {
//     id: "21",
//     title: "HR Business Partner",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Melbourne, Australia",
//     type: "Full-time",
//     salary: "$80k - $100k",
//     posted: "1 month ago",
//     description: "Partner with business leaders on talent strategy and organizational development.",
//     requirements: ["HR experience", "Employee relations", "Talent management", "5+ years"],
//     applied: false,
//     saved: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "open", // Changed from "closed" to "open" to make available for browsing
//     skillMatch: 80,
//     jobSummary:
//       "• Provide strategic HR guidance to business leaders\n• Manage employee relations and performance issues\n• Lead talent acquisition and retention initiatives\n• Develop and implement HR policies and programs\n• Support organizational change and development",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a presence across Australia, New Zealand, and Southeast Asia.",
//     benefits: [
//       "Competitive salary package",
//       "Comprehensive health benefits",
//       "Flexible work arrangements",
//       "Professional development",
//       "Generous leave policies",
//       "Employee wellness programs",
//     ],
//   },
//   {
//     id: "22",
//     title: "Financial Analyst",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Sydney, Australia",
//     type: "Full-time",
//     salary: "$70k - $90k",
//     posted: "6 weeks ago",
//     description: "Support financial planning, analysis, and reporting activities.",
//     requirements: ["Financial modeling", "Excel", "Accounting knowledge", "3+ years experience"],
//     applied: false,
//     saved: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "open", // Changed from "closed" to "open" to make available for browsing
//     skillMatch: 75,
//     jobSummary:
//       "• Prepare financial reports and analysis for management\n• Support budgeting and forecasting processes\n• Analyze financial performance and variances\n• Develop financial models for business decisions\n• Collaborate with accounting team on month-end close",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a presence across Australia, New Zealand, and Southeast Asia.",
//     benefits: [
//       "Competitive salary",
//       "Health insurance coverage",
//       "Professional certifications support",
//       "Flexible working hours",
//       "Career progression opportunities",
//       "Annual performance bonuses",
//     ],
//   },
//   {
//     id: "23",
//     title: "Content Writer",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Remote",
//     type: "Full-time",
//     salary: "$55k - $70k",
//     posted: "2 months ago",
//     description: "Create engaging content for blog, website, and marketing materials.",
//     requirements: ["Writing skills", "SEO knowledge", "Content strategy", "3+ years experience"],
//     applied: false,
//     saved: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "open", // Changed from "closed" to "open" to make available for browsing
//     skillMatch: 82,
//     jobSummary:
//       "• Write blog posts, case studies, and whitepapers\n• Optimize content for SEO and user engagement\n• Collaborate with marketing team on content strategy\n• Edit and proofread content from other team members\n• Maintain brand voice and style guidelines",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a presence across Australia, New Zealand, and Southeast Asia.",
//     benefits: [
//       "Competitive salary",
//       "Remote work flexibility",
//       "Health insurance",
//       "Professional development",
//       "Creative work environment",
//       "Flexible hours",
//     ],
//   },
//   {
//     id: "24",
//     title: "IT Support Specialist",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Brisbane, Australia",
//     type: "Full-time",
//     salary: "$55k - $70k",
//     posted: "5 weeks ago",
//     description: "Provide technical support to employees and maintain IT infrastructure.",
//     requirements: ["IT support experience", "Troubleshooting", "Windows/Mac", "2+ years"],
//     applied: false,
//     saved: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "open", // Changed from "closed" to "open" to make available for browsing
//     skillMatch: 70,
//     jobSummary:
//       "• Provide first and second-level technical support\n• Troubleshoot hardware and software issues\n• Manage user accounts and access permissions\n• Maintain IT equipment inventory\n• Document support procedures and solutions",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a presence across Australia, New Zealand, and Southeast Asia.",
//     benefits: [
//       "Competitive salary",
//       "Health insurance",
//       "Training and certifications",
//       "Work-life balance",
//       "Team environment",
//       "Career growth opportunities",
//     ],
//   },
//   {
//     id: "25",
//     title: "Business Analyst",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Melbourne, Australia",
//     type: "Full-time",
//     salary: "$75k - $95k",
//     posted: "3 months ago",
//     description: "Bridge business needs and technical solutions through analysis and documentation.",
//     requirements: ["Requirements gathering", "Process mapping", "Stakeholder management", "4+ years"],
//     applied: false,
//     saved: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "open", // Changed from "closed" to "open" to make available for browsing
//     skillMatch: 84,
//     jobSummary:
//       "• Gather and document business requirements\n• Analyze business processes and identify improvements\n• Create functional specifications for development teams\n• Facilitate workshops with stakeholders\n• Support UAT and implementation activities",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a presence across Australia, New Zealand, and Southeast Asia.",
//     benefits: [
//       "Competitive salary package",
//       "Health and wellness benefits",
//       "Flexible work options",
//       "Professional development",
//       "Collaborative culture",
//       "Modern office facilities",
//     ],
//   },
//   {
//     id: "26",
//     title: "Legal Counsel",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Sydney, Australia",
//     type: "Full-time",
//     salary: "$110k - $140k",
//     posted: "4 months ago",
//     description: "Provide legal advice and support for commercial contracts and compliance.",
//     requirements: ["Law degree", "Commercial law", "Contract negotiation", "5+ years experience"],
//     applied: false,
//     saved: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "open", // Changed from "closed" to "open" to make available for browsing
//     skillMatch: 90,
//     jobSummary:
//       "• Review and negotiate commercial contracts\n• Provide legal advice on business matters\n• Ensure compliance with regulations\n• Manage intellectual property portfolio\n• Support M&A and corporate transactions",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a presence across Australia, New Zealand, and Southeast Asia.",
//     benefits: [
//       "Excellent salary package",
//       "Premium health insurance",
//       "Professional development",
//       "Flexible work arrangements",
//       "Stock options",
//       "Supportive team environment",
//     ],
//   },
//   {
//     id: "27",
//     title: "Operations Manager",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Brisbane, Australia",
//     type: "Full-time",
//     salary: "$85k - $110k",
//     posted: "2 months ago",
//     description: "Oversee daily operations and drive process improvements.",
//     requirements: ["Operations management", "Process optimization", "Team leadership", "6+ years"],
//     applied: false,
//     saved: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "open", // Changed from "closed" to "open" to make available for browsing
//     skillMatch: 87,
//     jobSummary:
//       "• Manage day-to-day operations and workflows\n• Identify and implement process improvements\n• Lead operations team and support their development\n• Monitor KPIs and operational metrics\n• Collaborate with other departments on initiatives",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a presence across Australia, New Zealand, and Southeast Asia.",
//     benefits: [
//       "Competitive salary and bonuses",
//       "Health insurance coverage",
//       "Flexible work arrangements",
//       "Leadership development programs",
//       "Team building activities",
//       "Modern office environment",
//     ],
//   },
//   {
//     id: "28",
//     title: "Graphic Designer",
//     company: "Volaro Group",
//     companyWebsite: "https://volaro.com",
//     location: "Melbourne, Australia",
//     type: "Full-time",
//     salary: "$60k - $80k",
//     posted: "6 weeks ago",
//     description: "Create visual designs for marketing materials and digital products.",
//     requirements: ["Adobe Creative Suite", "Brand design", "Digital design", "3+ years experience"],
//     applied: false,
//     saved: false,
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-2prnJRSB6Fg6rRS6ksnWN8hBwzIJFJ.jpeg",
//     status: "open", // Changed from "closed" to "open" to make available for browsing
//     skillMatch: 79,
//     jobSummary:
//       "• Design marketing collateral and digital assets\n• Create visual content for social media and website\n• Maintain brand consistency across all materials\n• Collaborate with marketing team on campaigns\n• Support product team with UI design assets",
//     aboutClient:
//       "Volaro Group is a leading B2B SaaS company providing enterprise solutions to businesses worldwide, with a presence across Australia, New Zealand, and Southeast Asia.",
//     benefits: [
//       "Competitive salary",
//       "Health insurance",
//       "Creative work environment",
//       "Latest design tools and software",
//       "Professional development",
//       "Flexible working hours",
//     ],
//   },
//   {
//     id: "29",
//     title: "Cloud Solutions Architect",
//     company: "Archa",
//     companyWebsite: "https://archa.io",
//     location: "Singapore",
//     type: "Full-time",
//     salary: "$95k - $130k",
//     posted: "1 week ago",
//     description: "Design and implement enterprise cloud solutions on AWS and Azure.",
//     requirements: ["AWS/Azure", "Cloud architecture", "Microservices", "7+ years experience"],
//     applied: false,
//     saved: false, // Changed from true to false to make available for browsing
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/archa%20logo-8NVeEWIzgR0Y8aHBeqraSQWXy0mM3f.png",
//     status: "open",
//     skillMatch: 91,
//     jobSummary:
//       "• Design scalable cloud architectures for enterprise clients\n• Lead cloud migration projects and implementations\n• Provide technical guidance on cloud best practices\n• Optimize cloud infrastructure for cost and performance\n• Mentor development teams on cloud technologies",
//     aboutClient:
//       "Archa is a fast-growing AI startup focused on developing next-generation machine learning platforms for enterprises.",
//     benefits: [
//       "Excellent salary package with bonuses",
//       "Comprehensive health insurance",
//       "Remote work flexibility",
//       "Professional certifications support",
//       "Stock options",
//       "Annual team retreats",
//     ],
//   },
//   {
//     id: "30",
//     title: "Senior React Developer",
//     company: "Thriday",
//     companyWebsite: "https://thriday.com.au",
//     location: "Remote (Asia Pacific)",
//     type: "Full-time",
//     salary: "$55k - $75k",
//     posted: "3 days ago",
//     description: "Build modern web applications using React and TypeScript.",
//     requirements: ["React", "TypeScript", "Next.js", "5+ years experience"],
//     applied: false,
//     saved: false, // Changed from true to false to make available for browsing
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thriday-68gUuSiBQGK2cI3hLc8Y4qDoW2F3cq.png",
//     status: "open",
//     skillMatch: 94,
//     jobSummary:
//       "• Develop high-quality React applications with TypeScript\n• Build reusable component libraries and design systems\n• Optimize application performance and user experience\n• Collaborate with designers and backend developers\n• Mentor junior developers and conduct code reviews",
//     aboutClient:
//       "Thriday is a FinTech startup revolutionizing personal finance management with user-friendly digital tools.",
//     benefits: [
//       "Competitive salary",
//       "Fully remote position",
//       "Flexible working hours",
//       "Health insurance coverage",
//       "Learning and development budget",
//       "Modern tech stack",
//     ],
//   },
//   {
//     id: "31",
//     title: "Machine Learning Engineer",
//     company: "Fortify",
//     companyWebsite: "https://fortify.com",
//     location: "Bangalore, India",
//     type: "Full-time",
//     salary: "$50k - $70k",
//     posted: "5 days ago",
//     description: "Develop and deploy ML models for cybersecurity applications.",
//     requirements: ["Python", "TensorFlow/PyTorch", "ML algorithms", "4+ years experience"],
//     applied: false,
//     saved: false, // Changed from true to false to make available for browsing
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fortify_technology_logo-YLpzlGSivDsK2fFXLdnF7N0ewgUM3d.jpeg",
//     status: "open",
//     skillMatch: 87,
//     jobSummary:
//       "• Design and implement ML models for threat detection\n• Train and optimize models using large security datasets\n• Deploy models to production environments\n• Monitor model performance and implement improvements\n• Collaborate with security researchers on new approaches",
//     aboutClient:
//       "Fortify is a cybersecurity firm dedicated to protecting businesses from evolving digital threats through advanced security solutions.",
//     benefits: [
//       "Competitive compensation",
//       "Health and wellness benefits",
//       "Remote work options",
//       "Conference attendance opportunities",
//       "Cutting-edge ML infrastructure",
//       "Research publication support",
//     ],
//   },
//   {
//     id: "32",
//     title: "Product Designer",
//     company: "Zai",
//     companyWebsite: "https://zai.com",
//     location: "Melbourne, Australia",
//     type: "Full-time",
//     salary: "$75k - $95k",
//     posted: "1 week ago",
//     description: "Design beautiful and intuitive user experiences for mobile and web.",
//     requirements: ["Figma", "UI/UX design", "User research", "4+ years experience"],
//     applied: false,
//     saved: false, // Changed from true to false to make available for browsing
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mmp2tJXTgvXPeoADutH4SeeUExx52Q.png",
//     status: "open",
//     skillMatch: 89,
//     jobSummary:
//       "• Design end-to-end user experiences for digital products\n• Conduct user research and usability testing\n• Create wireframes, prototypes, and high-fidelity designs\n• Collaborate with product and engineering teams\n• Maintain and evolve design systems",
//     aboutClient:
//       "Zai is a rapidly growing software company specializing in cloud-native solutions and infrastructure management.",
//     benefits: [
//       "Excellent salary package",
//       "Premium health insurance",
//       "Flexible work arrangements",
//       "Latest design tools and equipment",
//       "Professional development budget",
//       "Creative team environment",
//     ],
//   },
//   {
//     id: "33",
//     title: "Full Stack Engineer",
//     company: "Teamified",
//     companyWebsite: "https://teamified.com",
//     location: "Quezon City, Philippines",
//     type: "Full-time",
//     salary: "$40k - $60k",
//     posted: "2 days ago",
//     description: "Build scalable web applications using modern technologies.",
//     requirements: ["React", "Node.js", "PostgreSQL", "4+ years experience"],
//     applied: false,
//     saved: false, // Changed from true to false to make available for browsing
//     invited: false,
//     logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/teamified-logo-100x100-NwpwYu9vSkuPkpVvtw9Esz8i2xD0Q4.png",
//     status: "open",
//     skillMatch: 92,
//     jobSummary:
//       "• Develop full-stack features from database to UI\n• Build RESTful APIs and integrate with frontend\n• Write clean, maintainable, and tested code\n• Optimize application performance and scalability\n• Participate in agile development processes",
//     aboutClient:
//       "Teamified is a leading HR technology company that helps businesses build and manage high-performing teams through innovative software solutions.",
//     benefits: [
//       "Competitive salary",
//       "HMO coverage",
//       "Hybrid work setup",
//       "Performance bonuses",
//       "Career growth opportunities",
//       "Modern office facilities",
//     ],
//   },
// ]

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

export const WorkspacePane = ({
  isOpen,
  onClose,
  content,
  onProfileSave,
  onUpgradePlan,
  onHiringManagerStepChange,
  onViewJob,
  onBackToJobBoard,
  onApplyForJob,
  // ADDED: onOpenWorkspace prop
  onOpenWorkspace, // Updated to accept WorkspaceContent
  onRequestSubmit,
  onConfirmSubmit,
  onSubmissionComplete,
  onSendMessage, // Added from updates
  onSendAIMessage,
  // </CHANGE>
  // ADDED: onOpenCandidateChat prop
  onOpenCandidateChat,
  chatMainRef, // Added chatMainRef prop
  onIntroduceMatchedCandidate, // Added prop
  onCloseWorkspace, // Added prop
  onClearMessages, // Added prop
  onJobBoardTabChange, // ADDED: prop to allow external control of the job board tab
  jobBoardTab, // ADDED: prop to allow external control of the job board tab
  // </CHANGE>
}: WorkspacePaneProps) => {
  console.log("[v0] WorkspacePane rendered with content.type:", content.type)

  const currentUser = useMemo(() => getCurrentUser(), [])

  const sentInsightsForCandidate = useRef<string | null>(null)
  // </CHANGE>

  // This useEffect sends AI insights when a candidate profile is opened
  useEffect(() => {
    if (content.type === "candidate-profile-view" && content.candidate && onSendAIMessage) {
      const candidate = content.candidate
      const skillMatchLabel =
        candidate.skillMatch >= 80
          ? "Excellent"
          : candidate.skillMatch >= 60
            ? "Good"
            : candidate.skillMatch >= 40
              ? "Fair"
              : "Limited"
      const skillMatchColor =
        candidate.skillMatch >= 80
          ? "strong"
          : candidate.skillMatch >= 60
            ? "moderate"
            : candidate.skillMatch >= 40
              ? "fair"
              : "limited"

      let message = `${candidate.name} is a ${candidate.title} with ${candidate.experience} of experience, currently based in ${candidate.location}. `

      if (candidate.summary) {
        message += `${candidate.summary.split(".")[0]}. `
      }

      message += `\n\nTheir skill match score is **${candidate.skillMatch}%** (${skillMatchLabel}), which indicates a ${skillMatchColor} alignment with the role requirements. `

      if (candidate.aiGeneratedInsights && candidate.aiGeneratedInsights.length > 0) {
        message += `\n\nHere are my key insights about ${candidate.name}:\n\n`
        candidate.aiGeneratedInsights.forEach((insight) => {
          message += `• ${insight}\n`
        })
      }

      message += `\n\nWould you like to proceed with this candidate or would you like me to show you more options?`
      // </CHANGE>

      onSendAIMessage(message, "technical-recruiter")
    }
  }, [content.type, content.candidate, onSendAIMessage])

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

  const [jobJustApplied, setJobJustApplied] = useState(false)

  const [showApplicationStatusLocal, setShowApplicationStatusLocal] = useState(false)

  const [swipedCandidates, setSwipedCandidates] = useState<{
    left: string[]
    right: string[]
  }>({ left: [], right: [] })
  const [showMatchSuccess, setShowMatchSuccess] = useState(false)
  const [matchedCandidate, setMatchedCandidate] = useState<CandidateProfile | null>(null)

  const [matchedCandidatesPerJob, setMatchedCandidatesPerJob] = useState<Record<string, CandidateProfile[]>>({})

  const [updatedJobSummaries, setUpdatedJobSummaries] = useState<Record<string, string>>({})

  const [browseCandidates, setBrowseCandidates] = useState<CandidateProfile[]>(getRandomizedCandidates())

  const lastSyncedToParent = useRef<"applied" | "invited" | "saved" | "browse">(jobBoardTab || "applied")
  // </CHANGE>

  // FIX: Declare jobStatusFilter
  const [jobStatusFilter, setJobStatusFilter] = useState("open")
  const [candidateJobFilter, setCandidateJobFilter] = useState<"applied" | "invited" | "saved" | "browse">(
    jobBoardTab || "applied",
  )
  // </CHANGE>

  // Only sync if the prop changed externally (not from our own upward sync)
  useEffect(() => {
    if (
      content.type === "job-board" &&
      jobBoardTab &&
      jobBoardTab !== candidateJobFilter &&
      jobBoardTab !== lastSyncedToParent.current
    ) {
      console.log("[v0] Syncing jobBoardTab prop to candidateJobFilter:", jobBoardTab)
      setCandidateJobFilter(jobBoardTab)
      lastSyncedToParent.current = jobBoardTab
    }
  }, [jobBoardTab, content.type, candidateJobFilter])
  // </CHANGE>

  // The candidateJobFilter state is now the single source of truth for the job board tab
  // It only syncs upward to the parent via onJobBoardTabChange
  // </CHANGE>
  useEffect(() => {
    if (content.type === "job-board" && onJobBoardTabChange && candidateJobFilter !== lastSyncedToParent.current) {
      console.log("[v0] Syncing candidateJobFilter to parent:", candidateJobFilter)
      onJobBoardTabChange(candidateJobFilter)
      lastSyncedToParent.current = candidateJobFilter
    }
  }, [candidateJobFilter, content.type, onJobBoardTabChange])
  // </CHANGE>

  useEffect(() => {
    if (content.type === "browse-candidates") {
      console.log("[v0] Randomizing candidates for browse-candidates workspace")
      setBrowseCandidates(getRandomizedCandidates())
    }
  }, [content])
  // </CHANGE>

  const handleSwipeLeft = (candidate: CandidateProfile) => {
    console.log("[v0] Swiped left on candidate:", candidate.name)
    setSwipedCandidates((prev) => ({
      ...prev,
      left: [...prev.left, candidate.id],
    }))

    if (content.type === "candidate-profile-view") {
      // If we have a candidates array and current index, show next candidate
      if (content.candidates && content.currentCandidateIndex !== undefined) {
        const nextIndex = content.currentCandidateIndex + 1

        // If there are more candidates, show the next one
        if (nextIndex < content.candidates.length) {
          const nextCandidate = content.candidates[nextIndex]
          if (onOpenWorkspace) {
            onOpenWorkspace({
              ...content,
              candidate: nextCandidate,
              currentCandidateIndex: nextIndex,
              title: `Profile: ${nextCandidate.name}`,
            })
          }
          return // Don't close the workspace
        }
      }

      // No more candidates or no candidates array - navigate back
      if (content.sourceView === "browse-candidates" && content.job && onOpenWorkspace) {
        // Return to browse-candidates if opened from there
        onOpenWorkspace({
          type: "browse-candidates",
          job: content.job,
          title: `Browse Candidates for ${content.job.title}`,
        })
      } else if (content.job && onOpenWorkspace) {
        // Return to job view if opened from matched candidates
        onOpenWorkspace({
          type: "job-view",
          job: content.job,
        })
      } else {
        // Close workspace if opened from elsewhere
        onClose()
      }
    }
    // </CHANGE>
  }

  const handleSwipeRight = (candidate: CandidateProfile) => {
    console.log("[v0] Swiped right on candidate:", candidate.name)
    setSwipedCandidates((prev) => ({
      ...prev,
      right: [...prev.right, candidate.id],
    }))

    // Simulate mutual match (in real app, check if candidate also swiped right)
    const isMutualMatch = Math.random() > 0.5 // 50% chance for demo
    if (isMutualMatch) {
      setMatchedCandidate(candidate)
      setShowMatchSuccess(true)

      if (content.type === "browse-candidates" && content.job) {
        setMatchedCandidatesPerJob((prev) => ({
          ...prev,
          [content.job.id]: [...(prev[content.job.id] || []), candidate],
        }))
      }
    } else {
      if (onSendAIMessage) {
        const message = `Great choice! I've sent an application invite to ${candidate.name}. They'll need to complete all required assessments before you can start chatting with them. I'll let you know once they've completed everything!`
        onSendAIMessage(message, "technical-recruiter")
      }
    }

    if (content.type === "candidate-profile-view") {
      // If we have a candidates array and current index, show next candidate
      if (content.candidates && content.currentCandidateIndex !== undefined) {
        const nextIndex = content.currentCandidateIndex + 1

        // If there are more candidates, show the next one
        if (nextIndex < content.candidates.length) {
          const nextCandidate = content.candidates[nextIndex]
          if (onOpenWorkspace) {
            onOpenWorkspace({
              ...content,
              candidate: nextCandidate,
              currentCandidateIndex: nextIndex,
              title: `Profile: ${nextCandidate.name}`,
            })
          }
          return // Don't close the workspace
        }
      }

      // No more candidates or no candidates array - navigate back
      if (content.sourceView === "browse-candidates" && content.job && onOpenWorkspace) {
        // Return to browse-candidates if opened from there
        onOpenWorkspace({
          type: "browse-candidates",
          job: content.job,
          title: `Browse Candidates for ${content.job.title}`,
        })
      } else if (content.job && onOpenWorkspace) {
        // Return to job view if opened from matched candidates
        onOpenWorkspace({
          type: "job-view",
          job: content.job,
        })
      } else {
        // Close workspace if opened from elsewhere
        onClose()
      }
    }
    // </CHANGE>
  }

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
    console.log("[v0] handleToggleApplicationView called with show:", show)
    setShowApplicationStatusLocal(show)
  }

  const handleViewJobDetails = (job: JobListing) => {
    console.log("[v0] handleViewJobDetails called for:", job.title, "applied:", job.applied)
    // If the job is already applied, show application status by default
    setShowApplicationStatusLocal(job.applied || false)
    if (onViewJob) {
      onViewJob(job)
    }
  }

  // Mock function for requesting skill gap analysis
  const handleRequestSkillGapAnalysis = (job: JobListing) => {
    console.log("[v0] Requesting skill gap analysis for:", job.title)
    // In a real app, this would trigger a backend process or AI analysis
    // For now, simulate sending a message to the AI chat
    if (onSendMessage) {
      onSendMessage(`Can you analyze the skill gap for the ${job.title} role at ${job.company}?`)
    }
  }
  const handleUpdateJobSummary = (jobId: string, newSummary: string) => {
    console.log("[v0] Updating job summary for job:", jobId)
    console.log("[v0] New summary:", newSummary)

    // Update the local state with the new job summary
    setUpdatedJobSummaries((prev) => ({
      ...prev,
      [jobId]: newSummary,
    }))

    // Note: In a real app, this would make an API call to update the job in the database
    // For now, we're just updating the local state
  }

  useEffect(() => {
    if (content.type === "job-view" && content.job) {
      console.log("[v0] Job view opened, job.applied:", content.job.applied)
      setShowApplicationStatusLocal(content.job.applied || false)
    }
  }, [content.type, content.job])

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

  if (content.type === "candidate-profile") {
    return (
      <div className="flex flex-col h-full border-l">
        <div className="flex items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{content.title || "Candidate Profile"}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors ml-auto"
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
        <CandidateProfileForm onSave={onProfileSave} onClose={onClose} onUpgradePlan={onUpgradePlan} />
      </div>
    )
  }

  if (content.type === "hiring-manager-profile") {
    return (
      <div className="flex flex-col h-full border-l">
        <div className="flex items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{content.title || "Enterprise Setup"}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors ml-auto"
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
        <HiringManagerProfileForm onSave={onProfileSave} onClose={onClose} onStepChange={onHiringManagerStepChange} />
      </div>
    )
  }

  if (content.type === "candidate-pricing") {
    return (
      <div className="flex flex-col h-full border-l">
        <div className="flex items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{content.title || "Upgrade to Premium"}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors ml-auto"
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
        <CandidatePricing onClose={onClose} />
      </div>
    )
  }

  if (content.type === "payment-success") {
    return (
      <div className="flex flex-col h-full border-l">
        <PaymentSuccess
          planName={content.planName || "Enterprise Plan"}
          amount={content.amount || "$500/mo"}
          onClose={onClose}
        />
      </div>
    )
  }

  if (content.type === "pdf") {
    return (
      <div className="flex flex-col h-full border-l">
        <div className="flex items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{content.title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors ml-auto"
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
        <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
          <div className="max-w-4xl mx-auto bg-background rounded-lg shadow-lg p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <FileText className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-semibold">Resume - Elena Popescu</h3>
                <p className="text-sm text-muted-foreground">PDF Document • 2 pages</p>
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Professional Summary</h4>
                <p className="text-muted-foreground">
                  Experienced software engineer with 5+ years in full-stack development. Specialized in React, Node.js,
                  and cloud architecture. Proven track record of delivering scalable solutions.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Experience</h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Senior Software Engineer - TechCorp</p>
                    <p className="text-xs text-muted-foreground">2020 - Present</p>
                    <p className="text-muted-foreground mt-1">
                      Led development of microservices architecture serving 1M+ users. Implemented CI/CD pipelines
                      reducing deployment time by 60%.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Software Engineer - StartupXYZ</p>
                    <p className="text-xs text-muted-foreground">2018 - 2020</p>
                    <p className="text-muted-foreground mt-1">
                      Built customer-facing web applications using React and TypeScript. Collaborated with design team
                      to improve UX metrics by 40%.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Education</h4>
                <p className="font-medium">B.S. Computer Science - University of Technology</p>
                <p className="text-xs text-muted-foreground">2014 - 2018</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {["React", "Node.js", "TypeScript", "AWS", "Docker", "PostgreSQL", "GraphQL", "CI/CD"].map(
                    (skill) => (
                      <span key={skill} className="px-3 py-1 bg-muted rounded-full text-xs">
                        {skill}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (content.type === "image") {
    return (
      <div className="flex flex-col h-full border-l">
        <div className="flex items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{content.title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors ml-auto"
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Portfolio Images</h3>
                <p className="text-sm text-muted-foreground">Project screenshots and designs</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden group cursor-pointer">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20 group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-16 h-16 text-muted-foreground/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (content.type === "video") {
    return (
      <div className="flex flex-col h-full border-l">
        <div className="flex items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{content.title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors ml-auto"
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-black ml-1" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white font-medium">Introduction Video - Elena Popescu</p>
                <p className="text-white/70 text-sm">Duration: 3:45</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Video Transcript
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <span className="text-foreground font-medium">[00:00]</span> Hi, I'm Elena Popescu, and I'm excited to
                  introduce myself as a candidate for the Senior Software Engineer position.
                </p>
                <p>
                  <span className="text-foreground font-medium">[00:15]</span> I have over 5 years of experience in
                  full-stack development, specializing in React, Node.js, and cloud architecture.
                </p>
                <p>
                  <span className="text-foreground font-medium">[00:35]</span> In my current role at TechCorp, I've led
                  the development of microservices that serve over 1 million users daily.
                </p>
                <p>
                  <span className="text-foreground font-medium">[01:00]</span> I'm passionate about building scalable
                  solutions and mentoring junior developers on the team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

  if (content.type === "candidate-profile-view" && content.candidate) {
    return (
      <div className="flex flex-col h-full border-l">
        <div className="flex items-center px-6 py-4 border-b">
          <button
            onClick={() => {
              console.log("[v0] Back button clicked in candidate-profile-view")
              console.log("[v0] content.sourceView:", content.sourceView)
              console.log("[v0] content.job exists:", !!content.job)

              // Return to browse-candidates if opened from there
              if (content.sourceView === "browse-candidates" && content.job && onOpenWorkspace) {
                console.log("[v0] Navigating back to browse-candidates for:", content.job.title)
                onOpenWorkspace({
                  type: "browse-candidates",
                  job: content.job,
                  title: `Browse Candidates for ${content.job.title}`,
                })
              } else if (content.job && onOpenWorkspace) {
                // Return to job view if opened from matched candidates
                console.log("[v0] Navigating back to job view for:", content.job.title)
                onOpenWorkspace({ type: "job-view", job: content.job, title: content.job.title })
              } else {
                // Close workspace if no context available
                console.log("[v0] Closing workspace - no navigation context available")
                onClose()
              }
            }}
            className="flex items-center gap-1 px-2 py-1 mr-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Back"
          >
            <span className="text-lg font-semibold">←</span>
          </button>
          {/* </CHANGE> */}
          <h2 className="text-lg font-semibold">{content.title}</h2>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors ml-auto"
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
        <CandidateProfileView
          candidate={content.candidate}
          showSwipeButtons={content.showSwipeButtons}
          onSwipe={(candidate, direction) => {
            if (direction === "left") {
              handleSwipeLeft(candidate)
            } else {
              handleSwipeRight(candidate)
            }
          }}
        />
      </div>
    )
  }

  if (content.type === "candidate-chat") {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-full sm:max-w-2xl p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <SheetTitle>Conversation with {content.data?.candidate?.name}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <CandidateChat candidate={content.data?.candidate} jobTitle={content.data?.job?.title} />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  const handleOpenMatchChat = () => {
    console.log("[v0] Opening chat with matched candidate:", matchedCandidate?.name)

    if (matchedCandidate && content.job) {
      const user = getCurrentUser()
      if (user && onIntroduceMatchedCandidate) {
        const hiringManagerName = user.name
        const position = content.job.title // Use the job title as the position
        const company = user.company || "the company"

        console.log("[v0] Introducing matched candidate with:", {
          candidateName: matchedCandidate.name,
          hiringManagerName,
          position,
          company,
        })

        // Call the introduction function to reset chat and send introduction
        onIntroduceMatchedCandidate(matchedCandidate, hiringManagerName, position, company)
      }
      // </CHANGE>

      if (onOpenWorkspace) {
        onOpenWorkspace({
          type: "candidate-profile-view",
          title: matchedCandidate.name,
          candidate: matchedCandidate,
          job: content.job,
        })
      }
    }

    setShowMatchSuccess(false)
  }

  const handleContinueSwiping = () => {
    setShowMatchSuccess(false)
    setMatchedCandidate(null)
  }

  const handleBackToMyJobs = () => {
    console.log("[v0] Back to my jobs from candidate swipe")
    const user = currentUser
    if (onBackToJobBoard) {
      onBackToJobBoard()
    }
  }

  const handleBrowseMoreCandidates = () => {
    console.log("[v0] Browse more candidates clicked")
    if (content.job && onOpenWorkspace) {
      onOpenWorkspace({ type: "candidate-swipe", job: content.job })
    }
  }

  const handleOpenCandidateChat = (candidate: CandidateProfile, job?: JobListing) => {
    console.log("[v0] Opening chat with candidate:", candidate.name)
    console.log("[v0] workspace-pane.tsx - job parameter:", job)
    console.log("[v0] workspace-pane.tsx - job exists:", !!job)
    if (onOpenCandidateChat) {
      onOpenCandidateChat(candidate, job)
    }
  }

  // Render MatchSuccess component directly here if showMatchSuccess is true
  if (showMatchSuccess && matchedCandidate) {
    return (
      <div className="flex flex-col h-full border-l">
        <MatchSuccess
          candidateName={matchedCandidate.name}
          jobTitle={content.job?.title}
          onOpenChat={handleOpenMatchChat}
          onContinueSwiping={handleContinueSwiping}
        />
      </div>
    )
  }

  const handleCandidateSelect = (candidate: CandidateProfile) => {
    if (onOpenWorkspace) {
      const currentIndex = browseCandidates.findIndex((c) => c.id === candidate.id)
      onOpenWorkspace({
        type: "candidate-profile-view",
        candidate: candidate,
        candidates: browseCandidates, // Pass full array for navigation
        currentCandidateIndex: currentIndex, // Pass current index
        title: `Profile: ${candidate.name}`,
        showSwipeButtons: true,
        job: content.type === "browse-candidates" ? content.job : undefined, // Pass job context if available
        sourceView: content.type === "browse-candidates" ? "browse-candidates" : undefined,
      })
      // </CHANGE>
    }
  }

  const handleCandidateShown = (candidate: CandidateProfile) => {
    if (chatMainRef?.current?.sendCandidateInsights && sentInsightsForCandidate.current !== candidate.id) {
      console.log("[v0] Sending insights for candidate:", candidate.name)
      sentInsightsForCandidate.current = candidate.id
      chatMainRef.current.sendCandidateInsights(candidate)
    }
    // </CHANGE>
  }

  // REMOVED: handleBrowseCandidatesLoadingComplete function

  // Function to handle applying for a job and toggling application status
  const handleApplyForJobWithStatusToggle = (job: JobListing) => {
    console.log("[v0] Applying for job:", job.title)
    if (onApplyForJob) {
      onApplyForJob(job)
    }
    // Assuming apply action sets job.applied to true
    // Update local state to reflect application status immediately for UI feedback
    setJobJustApplied(true) // This will trigger a re-render and update the job's applied status in JobView
    setShowApplicationStatusLocal(true) // Also show the application status view
  }

  // ADDED: Handle different content types for forms and payments
  if (content.type === "candidate-profile-form") {
    return (
      <div className="flex flex-col h-full border-l">
        <div className="flex items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{content.title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors ml-auto"
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
        <CandidateProfileForm onProfileSave={onProfileSave} />
      </div>
    )
  }

  if (content.type === "hiring-manager-profile-form") {
    return (
      <div className="flex flex-col h-full border-l">
        <div className="flex items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{content.title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors ml-auto"
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
        <HiringManagerProfileForm onProfileSave={onProfileSave} />
      </div>
    )
  }

  if (content.type === "candidate-pricing") {
    return (
      <div className="flex flex-col h-full border-l">
        <div className="flex items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{content.title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors ml-auto"
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
        <CandidatePricing onUpgradePlan={onUpgradePlan} />
      </div>
    )
  }

  if (content.type === "payment-success") {
    return (
      <div className="flex flex-col h-full border-l items-center justify-center bg-background">
        <PaymentSuccess onClose={onClose} />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full border-l">
        {content.title &&
          content.type !== "browse-candidates" && ( // Removed job-board exclusion to show title for job board workspace
            <div className="flex items-center px-6 py-4 border-b">
              {content.type === "candidate-swipe" && (
                <button
                  onClick={handleBackToMyJobs}
                  className="flex items-center gap-1 px-2 py-1 mr-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Back to job view"
                >
                  <ArrowLeft className="w-4 h-4" /> {/* Changed to ArrowLeft */}
                </button>
              )}
              {content.type === "job-view" && (
                <button
                  onClick={onBackToJobBoard}
                  className="flex items-center gap-1 px-2 py-1 mr-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Back to job board"
                >
                  <ArrowLeft className="w-4 h-4" /> {/* Changed to ArrowLeft */}
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
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => console.log("Withdraw submission")}
                        >
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

        {content.type === "candidate-swipe" && content.job && (
          <CandidateSwipe
            candidates={mockCandidates.filter(
              (c) => !swipedCandidates.left.includes(c.id) && !swipedCandidates.right.includes(c.id),
            )}
            jobTitle={content.job.title}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onBackToJobs={handleBackToMyJobs}
          />
        )}

        {content.type === "browse-candidates" && (
          <div className="flex flex-col h-full border-l">
            <div className="flex items-center px-6 py-4 border-b">
              <button
                onClick={() => {
                  if (onBackToJobBoard) {
                    onBackToJobBoard()
                  } else {
                    onClose()
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 mr-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Back to job board"
              >
                <span className="text-lg font-semibold">←</span>
              </button>
              <h2 className="text-lg font-semibold">{content.title}</h2>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors ml-auto"
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
            <BrowseCandidates
              candidates={browseCandidates}
              onCandidateSelect={handleCandidateSelect}
              onSwipe={(candidate, direction) => {
                if (direction === "left") {
                  handleSwipeLeft(candidate)
                } else {
                  handleSwipeRight(candidate)
                }
              }}
              onCandidateShown={handleCandidateShown}
            />
            {showMatchSuccess && matchedCandidate && (
              <MatchSuccess
                candidate={matchedCandidate}
                onClose={() => {
                  setShowMatchSuccess(false)
                  setMatchedCandidate(null)
                }}
                onSendMessage={(message) => {
                  if (onSendMessage) {
                    onSendMessage(message)
                  }
                  setShowMatchSuccess(false)
                  setMatchedCandidate(null)
                }}
              />
            )}
          </div>
        )}

        {content.type === "job-view" && content.job && (
          <JobView
            job={{
              ...content.job,
              jobSummary: updatedJobSummaries[content.job.id] || content.job.jobSummary,
              matchedCandidates: matchedCandidatesPerJob[content.job.id] || content.job.matchedCandidates || [], // Ensure matchedCandidates is always available
              applied: content.job.applied || jobJustApplied,
            }}
            onBack={onBackToJobBoard}
            onRequestSkillGapAnalysis={handleRequestSkillGapAnalysis}
            onApplyForJob={handleApplyForJobWithStatusToggle}
            showApplicationStatus={showApplicationStatusLocal}
            onToggleApplicationView={handleToggleApplicationView}
            onSendMessage={onSendMessage}
            userRole={currentUser?.role}
            matchedCandidates={matchedCandidatesPerJob[content.job.id] || []}
            onBrowseMoreCandidates={handleBrowseMoreCandidates}
            onOpenCandidateChat={handleOpenCandidateChat}
            onUpdateJobSummary={handleUpdateJobSummary}
          />
        )}

        {content.type === "job-board" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto space-y-8">
              {currentUser?.role === "hiring_manager" ? (
                // Hiring Manager View - Job Board with Draft/Open/Closed tabs
                <div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Tab Navigation - aligned left */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          console.log("[v0] Draft Jobs button clicked")
                          setJobStatusFilter("draft")
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          jobStatusFilter === "draft"
                            ? "bg-[#A16AE8] text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        Draft Jobs
                        <span className="ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full">
                          {mockHiringManagerJobs.filter((j) => j.status === "draft").length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          console.log("[v0] Open Jobs button clicked")
                          setJobStatusFilter("open")
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          jobStatusFilter === "open"
                            ? "bg-[#A16AE8] text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        Open Jobs
                        <span className="ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full">
                          {mockHiringManagerJobs.filter((j) => j.status === "open").length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          console.log("[v0] Closed Jobs button clicked")
                          setJobStatusFilter("closed")
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          jobStatusFilter === "closed"
                            ? "bg-[#A16AE8] text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        Closed Jobs
                        <span className="ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full">
                          {mockHiringManagerJobs.filter((j) => j.status === "closed").length}
                        </span>
                      </button>
                    </div>

                    {/* Create New Job button - aligned right */}
                    <button
                      onClick={() => {
                        console.log("[v0] Create New Job button clicked")
                        // TODO: Implement create job functionality
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create New Job
                    </button>
                  </div>

                  {/* Job Listings */}
                  <div className="space-y-4">
                    {mockHiringManagerJobs
                      .filter((job) => job.status === jobStatusFilter)
                      .map((job) => {
                        return (
                          <div
                            key={job.id}
                            className="bg-card border border-border rounded-lg p-4 hover:border-[#A16AE8] transition-colors cursor-pointer"
                            onClick={() => {
                              if (onViewJob) {
                                onViewJob(job)
                              }
                            }}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-semibold">{job.title}</h3>
                                  {job.status === "draft" && (
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                      Draft
                                    </Badge>
                                  )}
                                  {job.status === "open" && (
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                      Open
                                    </Badge>
                                  )}
                                  {job.status === "closed" && (
                                    <Badge variant="outline" className="text-gray-600 border-gray-600">
                                      Closed
                                    </Badge>
                                  )}
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
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
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
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                // Open job view
                                if (onViewJob) {
                                  onViewJob(job)
                                }
                              }}
                              className="w-full py-2.5 bg-[#A16AE8] hover:bg-[#8f5cd4] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <span>View Candidates</span>
                              <Badge className="bg-green-500 text-white hover:bg-green-600 border-0">
                                {job.matchedCandidates?.length || 0}
                              </Badge>
                            </button>
                          </div>
                        )
                      })}
                  </div>
                </div>
                // </CHANGE>
              ) : (
                // Candidate View - Job Board with Applied/Invited/Saved tabs
                <div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Tab Navigation - aligned left */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          console.log("[v0] Applied Jobs button clicked")
                          setCandidateJobFilter("applied")
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          candidateJobFilter === "applied"
                            ? "bg-[#A16AE8] text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        Applied Jobs
                        <span className="ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full">
                          {mockJobListings.filter((j) => j.applied).length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          console.log("[v0] Invited Jobs button clicked")
                          setCandidateJobFilter("invited")
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          candidateJobFilter === "invited"
                            ? "bg-[#A16AE8] text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        Invited Jobs
                        <span className="ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full">
                          {mockJobListings.filter((j) => j.invited && !j.applied).length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          console.log("[v0] Saved Jobs button clicked")
                          setCandidateJobFilter("saved")
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          candidateJobFilter === "saved"
                            ? "bg-[#A16AE8] text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        Saved Jobs
                        <span className="ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full">
                          {mockJobListings.filter((j) => j.saved && !j.applied && !j.invited).length}
                        </span>
                      </button>
                    </div>

                    {/* Browse Jobs button */}
                    <button
                      type="button"
                      onClick={() => {
                        console.log("[v0] Browse Jobs clicked")
                        setCandidateJobFilter("browse")
                      }}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Browse Jobs
                    </button>
                  </div>

                  {/* Applied Jobs Section */}
                  {candidateJobFilter === "applied" && (
                    <div>
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
                                  onClick={() => onViewJob?.(job)}
                                  className="border border-border rounded-lg p-5 hover:border-[#A16AE8] transition-colors cursor-pointer bg-card"
                                >
                                  <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                                      {job.logo ? (
                                        <img
                                          src={job.logo || "/placeholder.svg"}
                                          alt={job.company}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <Briefcase className="w-6 h-6 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-base mb-1 truncate">{job.title}</h4>
                                      <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {job.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <DollarSign className="w-3 h-3" />
                                          {job.salary}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {job.posted}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between pt-3 border-t border-border">
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-xs font-medium text-green-600">Applied</span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">{job.skillMatch}% match</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Invited Jobs Section */}
                  {candidateJobFilter === "invited" && (
                    <div>
                      {mockJobListings.filter((j) => j.invited && !j.applied).length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-border rounded-lg">
                          <Mail className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-muted-foreground">You haven't been invited to any jobs yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {mockJobListings
                            .filter((j) => j.invited && !j.applied)
                            .map((job) => (
                              <div
                                key={job.id}
                                onClick={() => onViewJob?.(job)}
                                className="border border-border rounded-lg p-5 hover:border-[#A16AE8] transition-colors bg-card cursor-pointer"
                              >
                                <div className="flex items-start gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                                    {job.logo ? (
                                      <img
                                        src={job.logo || "/placeholder.svg"}
                                        alt={job.company}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Briefcase className="w-6 h-6 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-base mb-1 truncate">{job.title}</h4>
                                    <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {job.location}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        {job.salary}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {job.posted}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-[#A16AE8]" />
                                    <span className="text-xs font-medium text-[#A16AE8]">Invited</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">{job.skillMatch}% match</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Saved Jobs Section */}
                  {candidateJobFilter === "saved" && (
                    <div>
                      {mockJobListings.filter((j) => j.saved && !j.applied && !j.invited).length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-border rounded-lg">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-muted-foreground">You haven't saved any jobs yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {mockJobListings
                            .filter((j) => j.saved && !j.applied && !j.invited)
                            .map((job) => (
                              <div
                                key={job.id}
                                onClick={() => onViewJob?.(job)}
                                className="border border-border rounded-lg p-5 hover:border-[#A16AE8] transition-colors bg-card cursor-pointer"
                              >
                                <div className="flex items-start gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                                    {job.logo ? (
                                      <img
                                        src={job.logo || "/placeholder.svg"}
                                        alt={job.company}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Briefcase className="w-6 h-6 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-base mb-1 truncate">{job.title}</h4>
                                    <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {job.location}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        {job.salary}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {job.posted}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {job.skillMatch && (
                                    <span className="text-xs text-muted-foreground">{job.skillMatch}% match</span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Browse Jobs Section */}
                  {candidateJobFilter === "browse" && (
                    <div>
                      {mockJobListings.filter((j) => !j.applied && !j.invited && !j.saved && j.status === "open")
                        .length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-border rounded-lg">
                          <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-muted-foreground">No available jobs to browse at the moment</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {mockJobListings
                            .filter((j) => !j.applied && !j.invited && !j.saved && j.status === "open")
                            .sort(() => Math.random() - 0.5)
                            .map((job) => (
                              <div
                                key={job.id}
                                onClick={() => onViewJob?.(job)}
                                className="border border-border rounded-lg p-5 hover:border-[#A16AE8] transition-colors bg-card cursor-pointer"
                              >
                                <div className="flex items-start gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                                    {job.logo ? (
                                      <img
                                        src={job.logo || "/placeholder.svg"}
                                        alt={job.company}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Briefcase className="w-6 h-6 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-base mb-1 truncate">{job.title}</h4>
                                    <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {job.location}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        {job.salary}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {job.posted}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {job.skillMatch && (
                                    <div className="flex items-center gap-1.5">
                                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                      <span className="text-xs font-medium text-[#A16AE8]">
                                        {job.skillMatch}% match
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
