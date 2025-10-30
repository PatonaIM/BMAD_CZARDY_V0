"use client"

import {
  X,
  Download,
  ExternalLink,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileCode,
  Folder,
  File,
  ZoomIn,
  ZoomOut,
  Printer,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { useState, useMemo } from "react"
import type { WorkspaceContent, JobListing } from "@/types/workspace"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { CandidateProfileForm } from "./candidate-profile-form"
import { HiringManagerProfileForm } from "./hiring-manager-profile-form" // Fixed import path to use the correct file name
import { CandidatePricing } from "./candidate-pricing"
import { PaymentSuccess } from "./payment-success" // Import payment success component
import { JobView } from "./job-view" // Import JobView component
import { getCurrentUser } from "@/lib/auth" // Added import for getCurrentUser

interface WorkspacePaneProps {
  isOpen: boolean
  onClose: () => void
  content: WorkspaceContent
  onProfileSave?: () => void // Added callback for profile save
  onUpgradePlan?: () => void // Added onUpgradePlan prop
  onHiringManagerStepChange?: (step: number) => void
  onViewJob?: (job: JobListing) => void // Added callback for viewing job details
}

const mockJobListings: JobListing[] = [
  {
    id: "1",
    title: "Senior Full-Stack Developer",
    company: "Teamified",
    location: "Manila, Philippines",
    type: "Full-time",
    salary: "$45k - $65k",
    posted: "2 days ago",
    description: "We're looking for an experienced full-stack developer to join our growing team in Manila.",
    requirements: ["5+ years experience", "React & Node.js", "TypeScript", "AWS"],
    applied: false,
    saved: true, // Added saved property
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/teamified-logo-100x100%20%282%29-8C2bS6hRQcpiWfm5tR1PvB9jKttelk.png",
    status: "open",
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
    location: "Bangalore, India",
    type: "Full-time",
    salary: "$35k - $55k",
    posted: "1 week ago",
    description: "Join our AI team to build cutting-edge machine learning solutions.",
    requirements: ["Python", "TensorFlow/PyTorch", "ML algorithms", "3+ years experience"],
    applied: true,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/archa%20logo-hG253NIsF4D3nHFyFmkDW64AC92Ocl.png",
    status: "draft",
  },
  {
    id: "3",
    title: "Product Manager",
    company: "Volaro Group",
    location: "Sydney, Australia",
    type: "Full-time",
    salary: "$90k - $120k",
    posted: "3 days ago",
    description: "Lead product strategy and execution for our flagship product in Sydney.",
    requirements: ["5+ years PM experience", "Agile/Scrum", "Data-driven", "B2B SaaS"],
    saved: true, // Added saved property
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-8EH1LHzdtuGkcJm9qtk0UEoG89Ht5h.jpeg",
    status: "open",
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "Zai",
    location: "Colombo, Sri Lanka",
    type: "Full-time",
    salary: "$30k - $45k",
    posted: "5 days ago",
    description: "Build and maintain our cloud infrastructure and CI/CD pipelines.",
    requirements: ["Kubernetes", "Docker", "AWS/GCP", "Terraform", "4+ years experience"],
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hellozai_logo-3Bb4gZipjVfr2gWZJaFL7PCYGJghqR.jpg",
    status: "closed",
  },
  {
    id: "5",
    title: "Frontend Developer",
    company: "Thriday",
    location: "Cebu, Philippines",
    type: "Full-time",
    salary: "$35k - $50k",
    posted: "1 day ago",
    description: "Create beautiful and responsive user interfaces for our web applications.",
    requirements: ["React", "TypeScript", "CSS/Tailwind", "3+ years experience"],
    applied: false,
    saved: true, // Added saved property
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon_Only-z71A3nLVFYGxsNDGRrsNMXNlj2Mw1L.png",
    status: "open",
  },
  {
    id: "6",
    title: "Data Scientist",
    company: "Fortify",
    location: "Mumbai, India",
    type: "Full-time",
    salary: "$40k - $60k",
    posted: "4 days ago",
    description: "Analyze complex datasets and build predictive models to drive business insights.",
    requirements: ["Python", "SQL", "Machine Learning", "Statistics", "4+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fortify_technology_logo-Zj5o0qLJVi2HJnHqVX6DydAP4pnKBN.jpeg",
    status: "draft",
  },
  {
    id: "7",
    title: "Backend Developer",
    company: "Archa",
    location: "Melbourne, Australia",
    type: "Full-time",
    salary: "$85k - $110k",
    posted: "1 week ago",
    description: "Design and implement scalable backend services and APIs.",
    requirements: ["Node.js or Java", "Microservices", "Databases", "5+ years experience"],
    applied: true,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/archa%20logo-hG253NIsF4D3nHFyFmkDW64AC92Ocl.png",
    status: "open",
  },
  {
    id: "8",
    title: "QA Engineer",
    company: "Teamified",
    location: "Remote (Philippines)",
    type: "Full-time",
    salary: "$30k - $45k",
    posted: "2 days ago",
    description: "Ensure software quality through comprehensive testing and automation.",
    requirements: ["Test automation", "Selenium/Cypress", "API testing", "3+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/teamified-logo-100x100%20%282%29-8C2bS6hRQcpiWfm5tR1PvB9jKttelk.png",
    status: "closed",
  },
  {
    id: "9",
    title: "Mobile Developer (iOS)",
    company: "Zai",
    location: "Pune, India",
    type: "Full-time",
    salary: "$38k - $55k",
    posted: "6 days ago",
    description: "Build native iOS applications with cutting-edge features.",
    requirements: ["Swift", "iOS SDK", "UIKit/SwiftUI", "4+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hellozai_logo-3Bb4gZipjVfr2gWZJaFL7PCYGJghqR.jpg",
    status: "open",
  },
  {
    id: "10",
    title: "UX/UI Designer",
    company: "Volaro Group",
    location: "Brisbane, Australia",
    type: "Full-time",
    salary: "$70k - $95k",
    posted: "3 days ago",
    description: "Create intuitive and visually appealing user experiences.",
    requirements: ["Figma", "User research", "Prototyping", "4+ years experience"],
    applied: false,
    saved: true, // Added saved property
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-8EH1LHzdtuGkcJm9qtk0UEoG89Ht5h.jpeg",
    status: "draft",
  },
  {
    id: "11",
    title: "Solutions Architect",
    company: "Fortify",
    location: "Galle, Sri Lanka",
    type: "Full-time",
    salary: "$50k - $70k",
    posted: "1 week ago",
    description: "Design and implement enterprise-level cloud solutions.",
    requirements: ["AWS/Azure", "System design", "Architecture patterns", "7+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fortify_technology_logo-Zj5o0qLJVi2HJnHqVX6DydAP4pnKBN.jpeg",
    status: "open",
  },
  {
    id: "12",
    title: "Scrum Master",
    company: "Thriday",
    location: "Makati, Philippines",
    type: "Full-time",
    salary: "$40k - $55k",
    posted: "4 days ago",
    description: "Facilitate agile processes and remove impediments for development teams.",
    requirements: ["Scrum certification", "Agile methodologies", "Team facilitation", "3+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon_Only-z71A3nLVFYGxsNDGRrsNMXNlj2Mw1L.png",
    status: "closed",
  },
  {
    id: "13",
    title: "Security Engineer",
    company: "Archa",
    location: "Hyderabad, India",
    type: "Full-time",
    salary: "$45k - $65k",
    posted: "2 days ago",
    description: "Protect our systems and data through robust security measures.",
    requirements: ["Security protocols", "Penetration testing", "SIEM tools", "5+ years experience"],
    applied: true,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/archa%20logo-hG253NIsF4D3nHFyFmkDW64AC92Ocl.png",
    status: "open",
  },
  {
    id: "14",
    title: "Technical Writer",
    company: "Teamified",
    location: "Remote (Australia)",
    type: "Contract",
    salary: "$60k - $80k",
    posted: "5 days ago",
    description: "Create clear and comprehensive technical documentation.",
    requirements: ["Technical writing", "API documentation", "Markdown", "3+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/teamified-logo-100x100%20%282%29-8C2bS6hRQcpiWfm5tR1PvB9jKttelk.png",
    status: "draft",
  },
  {
    id: "15",
    title: "Business Analyst",
    company: "Zai",
    location: "Davao, Philippines",
    type: "Full-time",
    salary: "$35k - $50k",
    posted: "1 week ago",
    description: "Bridge the gap between business needs and technical solutions.",
    requirements: ["Requirements gathering", "Process modeling", "SQL", "4+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hellozai_logo-3Bb4gZipjVfr2gWZJaFL7PCYGJghqR.jpg",
    status: "open",
  },
  {
    id: "16",
    title: "Machine Learning Engineer",
    company: "Fortify",
    location: "Chennai, India",
    type: "Full-time",
    salary: "$42k - $62k",
    posted: "3 days ago",
    description: "Develop and deploy machine learning models at scale.",
    requirements: ["Python", "TensorFlow", "MLOps", "Model deployment", "4+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fortify_technology_logo-Zj5o0qLJVi2HJnHqVX6DydAP4pnKBN.jpeg",
    status: "closed",
  },
  {
    id: "17",
    title: "Site Reliability Engineer",
    company: "Volaro Group",
    location: "Perth, Australia",
    type: "Full-time",
    salary: "$95k - $125k",
    posted: "6 days ago",
    description: "Ensure high availability and reliability of production systems.",
    requirements: ["Linux", "Monitoring tools", "Incident management", "5+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volaro_group_logo-8EH1LHzdtuGkcJm9qtk0UEoG89Ht5h.jpeg",
    status: "open",
  },
  {
    id: "18",
    title: "Database Administrator",
    company: "Thriday",
    location: "Kandy, Sri Lanka",
    type: "Full-time",
    salary: "$35k - $50k",
    posted: "2 days ago",
    description: "Manage and optimize database systems for performance and reliability.",
    requirements: ["PostgreSQL/MySQL", "Database tuning", "Backup strategies", "5+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon_Only-z71A3nLVFYGxsNDGRrsNMXNlj2Mw1L.png",
    status: "draft",
  },
  {
    id: "19",
    title: "Cloud Engineer",
    company: "Archa",
    location: "Remote (India)",
    type: "Full-time",
    salary: "$40k - $58k",
    posted: "4 days ago",
    description: "Build and maintain cloud infrastructure on AWS and Azure.",
    requirements: ["AWS/Azure", "Infrastructure as Code", "CI/CD", "4+ years experience"],
    applied: false,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/archa%20logo-hG253NIsF4D3nHFyFmkDW64AC92Ocl.png",
    status: "open",
  },
  {
    id: "20",
    title: "Engineering Manager",
    company: "Teamified",
    location: "Adelaide, Australia",
    type: "Full-time",
    salary: "$110k - $145k",
    posted: "1 week ago",
    description: "Lead and mentor a team of software engineers to deliver high-quality products.",
    requirements: ["Team leadership", "Technical expertise", "Agile", "7+ years experience"],
    applied: true,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/teamified-logo-100x100%20%282%29-8C2bS6hRQcpiWfm5tR1PvB9jKttelk.png",
    status: "closed",
  },
]

const analyticsData = {
  applicationsByRole: [
    { role: "Full-Stack Dev", applications: 45 },
    { role: "AI Engineer", applications: 32 },
    { role: "Product Manager", applications: 28 },
    { role: "DevOps", applications: 25 },
    { role: "Data Scientist", applications: 38 },
  ],
  candidatesByRegion: [
    { name: "Philippines", value: 35, color: "#A16AE8" },
    { name: "India", value: 28, color: "#8096FD" },
    { name: "Sri Lanka", value: 15, color: "#60D394" },
    { name: "Australia", value: 12, color: "#FF6B6B" },
    { name: "Others", value: 10, color: "#FFD93D" },
  ],
  hiringTrends: [
    { month: "Jan", hires: 8, applications: 45 },
    { month: "Feb", hires: 12, applications: 52 },
    { month: "Mar", hires: 10, applications: 48 },
    { month: "Apr", hires: 15, applications: 60 },
    { month: "May", hires: 18, applications: 65 },
    { month: "Jun", hires: 20, applications: 70 },
  ],
}

const mockFileStructure = [
  {
    name: "src",
    type: "folder",
    children: [
      { name: "components", type: "folder" },
      { name: "utils", type: "folder" },
      { name: "server.js", type: "file", active: true },
      { name: "app.js", type: "file" },
    ],
  },
  { name: "public", type: "folder" },
  { name: "package.json", type: "file" },
]

const mockTranscription = [
  { time: "00:00", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { time: "00:15", text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { time: "00:30", text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris." },
  { time: "00:45", text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum." },
  { time: "01:00", text: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia." },
]

const mockCandidateData = [
  { name: "Sarah Johnson", position: "Senior Full-Stack", experience: "8 years", status: "Interview", match: "95%" },
  { name: "Michael Chen", position: "AI Engineer", experience: "5 years", status: "Review", match: "88%" },
  { name: "Emily Rodriguez", position: "Product Manager", experience: "6 years", status: "Offer", match: "92%" },
  { name: "David Kim", position: "DevOps Engineer", experience: "7 years", status: "Assessment", match: "85%" },
  { name: "Lisa Wang", position: "Data Scientist", experience: "6 years", status: "Interview", match: "90%" },
  { name: "James Brown", position: "Frontend Dev", experience: "4 years", status: "Review", match: "82%" },
  { name: "Maria Garcia", position: "Backend Dev", experience: "5 years", status: "Interview", match: "87%" },
  { name: "Robert Taylor", position: "Senior Full-Stack", experience: "9 years", status: "Offer", match: "94%" },
  { name: "Jennifer Lee", position: "Product Manager", experience: "7 years", status: "Review", match: "89%" },
  { name: "William Martinez", position: "AI Engineer", experience: "4 years", status: "Assessment", match: "83%" },
  { name: "Amanda White", position: "Data Scientist", experience: "5 years", status: "Interview", match: "86%" },
  { name: "Christopher Davis", position: "DevOps Engineer", experience: "6 years", status: "Review", match: "88%" },
  { name: "Jessica Wilson", position: "Frontend Dev", experience: "3 years", status: "Assessment", match: "79%" },
  { name: "Daniel Anderson", position: "Backend Dev", experience: "7 years", status: "Interview", match: "91%" },
  { name: "Michelle Thomas", position: "Senior Full-Stack", experience: "10 years", status: "Offer", match: "96%" },
  { name: "Kevin Jackson", position: "Product Manager", experience: "5 years", status: "Review", match: "84%" },
  { name: "Laura Harris", position: "AI Engineer", experience: "6 years", status: "Interview", match: "89%" },
  { name: "Brian Clark", position: "Data Scientist", experience: "4 years", status: "Assessment", match: "81%" },
  { name: "Nicole Lewis", position: "DevOps Engineer", experience: "8 years", status: "Interview", match: "93%" },
  { name: "Steven Walker", position: "Frontend Dev", experience: "5 years", status: "Review", match: "85%" },
  { name: "Rachel Hall", position: "Backend Dev", experience: "6 years", status: "Offer", match: "90%" },
  { name: "Jason Allen", position: "Senior Full-Stack", experience: "7 years", status: "Interview", match: "88%" },
  { name: "Stephanie Young", position: "Product Manager", experience: "8 years", status: "Review", match: "92%" },
  { name: "Matthew King", position: "AI Engineer", experience: "5 years", status: "Assessment", match: "86%" },
  { name: "Ashley Wright", position: "Data Scientist", experience: "7 years", status: "Interview", match: "91%" },
]

export function WorkspacePane({
  isOpen,
  onClose,
  content,
  onProfileSave,
  onUpgradePlan,
  onHiringManagerStepChange,
  onViewJob, // Added onViewJob prop
}: WorkspacePaneProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showTranscription, setShowTranscription] = useState(false)
  const [pdfZoom, setPdfZoom] = useState(100)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filters, setFilters] = useState({
    name: "",
    position: "",
    experience: "",
    status: "",
    match: "",
  })

  const mockImages = ["/dashboard-analytics.png", "/user-interface-design.png", "/data-visualization-abstract.png"]

  const handleViewJobDetails = (job: JobListing) => {
    if (onViewJob) {
      onViewJob(job)
    }
  }

  const getWorkspaceTitle = () => {
    switch (content.type) {
      case "candidate-profile":
        return "Edit Candidate Profile"
      case "hiring-manager-profile":
        return "Edit Hiring Manager Profile"
      case "candidate-pricing":
        return "Upgrade to Premium"
      case "payment-success":
        return "Payment Successful"
      case "pdf":
        return "Document Viewer"
      case "image":
        return "Image Gallery"
      case "video":
        return "Video Player"
      case "code":
        return "Code Editor"
      case "job-board":
        const user = getCurrentUser()
        return user?.role === "candidate" ? "My Jobs" : "Available Positions"
      case "table":
        return "Candidate Overview"
      case "analytics":
        return "Analytics Dashboard"
      case "job-view":
        return content.job?.title || "Job Details"
      default:
        return "Workspace"
    }
  }

  const filteredAndSortedData = useMemo(() => {
    let data = [...mockCandidateData]

    // Apply filters
    data = data.filter((row) => {
      return (
        row.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        row.position.toLowerCase().includes(filters.position.toLowerCase()) &&
        row.experience.toLowerCase().includes(filters.experience.toLowerCase()) &&
        row.status.toLowerCase().includes(filters.status.toLowerCase()) &&
        row.match.toLowerCase().includes(filters.match.toLowerCase())
      )
    })

    // Apply sorting
    if (sortColumn) {
      data.sort((a, b) => {
        const aValue = a[sortColumn as keyof typeof a]
        const bValue = b[sortColumn as keyof typeof b]

        // Handle numeric sorting for experience and match
        if (sortColumn === "experience") {
          const aNum = Number.parseInt(aValue)
          const bNum = Number.parseInt(bValue)
          return sortDirection === "asc" ? aNum - bNum : bNum - aNum
        }
        if (sortColumn === "match") {
          const aNum = Number.parseInt(aValue)
          const bNum = Number.parseInt(bValue)
          return sortDirection === "asc" ? aNum - bNum : bNum - aNum
        }

        // String sorting
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return data
  }, [filters, sortColumn, sortDirection])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({ ...prev, [column]: value }))
  }

  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 text-[#A16AE8]" />
    ) : (
      <ArrowDown className="w-4 h-4 text-[#A16AE8]" />
    )
  }

  const renderContent = () => {
    switch (content.type) {
      case "candidate-profile":
        return <CandidateProfileForm onSave={onProfileSave} onClose={onClose} onUpgradePlan={onUpgradePlan} />

      case "hiring-manager-profile":
        return (
          <HiringManagerProfileForm onSave={onProfileSave} onClose={onClose} onStepChange={onHiringManagerStepChange} />
        )

      case "candidate-pricing":
        return <CandidatePricing onClose={onClose} />

      case "payment-success":
        return (
          <PaymentSuccess
            planName={content.planName || "Enterprise Plan"}
            amount={content.amount || "$500/mo"}
            onClose={onClose}
          />
        )

      case "pdf":
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPdfZoom((prev) => Math.max(50, prev - 10))}
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium min-w-[4rem] text-center">{pdfZoom}%</span>
                  <button
                    onClick={() => setPdfZoom((prev) => Math.min(200, prev + 10))}
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-6 w-px bg-border" />
                <span className="text-sm font-medium">{content.title || "Document.pdf"}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Print">
                  <Printer className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-muted/30 p-6">
              <div
                className="mx-auto space-y-6"
                style={{
                  width: `${pdfZoom}%`,
                  maxWidth: "100%",
                  minWidth: "600px",
                }}
              >
                {/* Page 1 */}
                <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                  <div className="aspect-[8.5/11] bg-white p-12 text-gray-900">
                    <div className="space-y-6">
                      <div className="text-center border-b-2 border-gray-800 pb-4">
                        <h1 className="text-3xl font-bold mb-2">EMPLOYMENT CONTRACT</h1>
                        <p className="text-sm text-gray-600">Effective Date: January 1, 2025</p>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed">
                          This Employment Agreement is entered into as of January 1, 2025, by and between:
                        </p>

                        <div className="space-y-2">
                          <p className="font-semibold">
                            TEAMIFIED{" "}
                            <span className="font-normal">(hereinafter referred to as "Company" or "Employer")</span>
                          </p>
                          <p className="text-sm">123 Innovation Drive</p>
                          <p className="text-sm">San Francisco, CA 94105</p>
                        </div>

                        <p className="text-center font-semibold">AND</p>

                        <div className="space-y-2">
                          <p className="font-semibold">
                            ROBERT DOWNEY JR.{" "}
                            <span className="font-normal">(hereinafter referred to as "Employee")</span>
                          </p>
                          <p className="text-sm">456 Malibu Beach Road</p>
                          <p className="text-sm">Malibu, CA 90265</p>
                        </div>

                        <div className="mt-8">
                          <h2 className="text-xl font-bold mb-3">1. POSITION AND DUTIES</h2>
                          <div className="space-y-3 text-sm">
                            <p>
                              <span className="font-semibold">1.1 Position:</span> The Employee is hereby employed in
                              the position of <span className="font-semibold">Principal Software Engineer</span>.
                            </p>
                            <p>
                              <span className="font-semibold">1.2 Duties:</span> The Employee shall perform all duties
                              and responsibilities customarily associated with this position, including but not limited
                              to:
                            </p>
                            <ul className="list-disc ml-6 space-y-1">
                              <li>Leading the design and architecture of complex software systems</li>
                              <li>Providing technical leadership and mentorship to engineering teams</li>
                              <li>Establishing engineering best practices and coding standards</li>
                              <li>Collaborating with cross-functional teams on technical strategy</li>
                              <li>Contributing to key technical decisions and platform architecture</li>
                              <li>Participating in code reviews and ensuring code quality</li>
                              <li>Such other duties as may reasonably be assigned by the Company</li>
                            </ul>
                            <p>
                              <span className="font-semibold">1.3 Reporting:</span> The Employee shall report directly
                              to the Chief Technology Officer (CTO) or other designated supervisor.
                            </p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h2 className="text-xl font-bold mb-3">2. COMPENSATION</h2>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-semibold">2.1 Base Salary:</span> The Employee shall receive an
                              annual base salary of $180,000 (One Hundred Eighty Thousand Dollars), payable in
                              accordance with the Company's standard payroll practices, subject to applicable
                              withholdings and deductions.
                            </p>
                            <p>
                              <span className="font-semibold">2.2 Performance Bonus:</span> The Employee may be eligible
                              for an annual performance bonus of up to 20% of base salary, based on individual and
                              company performance metrics as determined by the Company.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
                        Page 1 of 6 • Employment Contract • Confidential
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page 2 */}
                <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                  <div className="aspect-[8.5/11] bg-white p-12 text-gray-900">
                    <div className="space-y-6">
                      <div className="space-y-4 text-sm">
                        <p>
                          <span className="font-semibold">2.3 Equity Compensation:</span> The Employee shall be granted
                          stock options to purchase 10,000 shares of the Company's common stock, subject to the terms
                          and conditions of the Company's Stock Option Plan and a separate Stock Option Agreement.
                        </p>
                      </div>

                      <div className="mt-8">
                        <h2 className="text-xl font-bold mb-3">3. BENEFITS</h2>
                        <div className="space-y-3 text-sm">
                          <p>
                            <span className="font-semibold">3.1 Health Insurance:</span> The Employee shall be eligible
                            to participate in the Company's group health insurance plan, including medical, dental, and
                            vision coverage, subject to the terms and conditions of such plans.
                          </p>
                          <p>
                            <span className="font-semibold">3.2 Retirement Plan:</span> The Employee shall be eligible
                            to participate in the Company's 401(k) retirement plan with employer matching contributions
                            of up to 4% of base salary.
                          </p>
                          <p>
                            <span className="font-semibold">3.3 Paid Time Off:</span> The Employee shall be entitled to:
                          </p>
                          <ul className="list-disc ml-6 space-y-1">
                            <li>20 days of paid vacation per year</li>
                            <li>10 days of paid sick leave per year</li>
                            <li>All Company- recognized holidays</li>
                            <li>5 days of personal leave per year</li>
                          </ul>
                          <p>
                            <span className="font-semibold">3.4 Professional Development:</span> The Company shall
                            provide an annual professional development budget of $5,000 for conferences, training, and
                            educational materials.
                          </p>
                          <p>
                            <span className="font-semibold">3.5 Equipment:</span> The Company shall provide all
                            necessary equipment, including laptop, monitors, and other tools required to perform job
                            duties.
                          </p>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h2 className="text-xl font-bold mb-3">4. WORK SCHEDULE AND LOCATION</h2>
                        <div className="space-y-3 text-sm">
                          <p>
                            <span className="font-semibold">4.1 Work Hours:</span> The Employee's standard work schedule
                            shall be Monday through Friday, with flexible hours as agreed upon with the supervisor. As
                            an exempt employee, the Employee may be required to work additional hours as necessary to
                            fulfill job responsibilities.
                          </p>
                          <p>
                            <span className="font-semibold">4.2 Work Location:</span> The Employee's primary work
                            location shall be remote, with occasional visits to the Company's San Francisco office as
                            required for meetings, team events, or other business purposes.
                          </p>
                          <p>
                            <span className="font-semibold">4.3 Remote Work:</span> The Employee is authorized to work
                            remotely, subject to maintaining appropriate work environment, internet connectivity, and
                            availability during core business hours (9:00 AM - 5:00 PM Pacific Time).
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
                        Page 2 of 6 • Employment Contract • Confidential
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page 3 */}
                <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                  <div className="aspect-[8.5/11] bg-white p-12 text-gray-900">
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold mb-3">5. CONFIDENTIALITY</h2>
                      <div className="space-y-3 text-sm">
                        <p>
                          <span className="font-semibold">5.1 Confidential Information:</span> The Employee acknowledges
                          that during employment, they will have access to and become familiar with confidential
                          information belonging to the Company, including but not limited to:
                        </p>
                        <ul className="list-disc ml-6 space-y-1">
                          <li>Trade secrets, proprietary technology, and source code</li>
                          <li>Business strategies, financial information, and pricing models</li>
                          <li>Customer lists, supplier information, and business relationships</li>
                          <li>Marketing plans, product roadmaps, and development strategies</li>
                          <li>Personnel information and internal processes</li>
                        </ul>
                        <p>
                          <span className="font-semibold">5.2 Non-Disclosure:</span> The Employee agrees to maintain the
                          confidentiality of all such information during and after employment, and shall not disclose,
                          use, or permit others to use such information except as required in the performance of job
                          duties.
                        </p>
                        <p>
                          <span className="font-semibold">5.3 Return of Materials:</span> Upon termination of
                          employment, the Employee shall immediately return all Company property, documents, and
                          materials containing confidential information.
                        </p>
                      </div>

                      <div className="mt-8">
                        <h2 className="text-xl font-bold mb-3">6. INTELLECTUAL PROPERTY</h2>
                        <div className="space-y-3 text-sm">
                          <p>
                            <span className="font-semibold">6.1 Work Product:</span> All inventions, discoveries,
                            developments, improvements, works of authorship, and other intellectual property created by
                            the Employee during employment, whether alone or with others, that relate to the Company's
                            business or result from work performed for the Company, shall be the sole and exclusive
                            property of the Company.
                          </p>
                          <p>
                            <span className="font-semibold">6.2 Assignment:</span> The Employee hereby assigns to the
                            Company all right, title, and interest in and to such work product, and agrees to execute
                            any documents necessary to perfect the Company's ownership rights.
                          </p>
                          <p>
                            <span className="font-semibold">6.3 Prior Inventions:</span> The Employee has disclosed to
                            the Company all inventions, if any, that were made prior to employment and that the Employee
                            desires to exclude from this Agreement (see Exhibit A, if applicable).
                          </p>
                          <p>
                            <span className="font-semibold">6.4 Cooperation:</span> The Employee agrees to cooperate
                            with the Company in obtaining and enforcing patents, copyrights, and other intellectual
                            property rights for such work product.
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
                        Page 3 of 6 • Employment Contract • Confidential
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page 4 */}
                <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                  <div className="aspect-[8.5/11] bg-white p-12 text-gray-900">
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold mb-3">7. NON-COMPETE AND NON-SOLICITATION</h2>
                      <div className="space-y-3 text-sm">
                        <p>
                          <span className="font-semibold">7.1 Non-Compete:</span> During employment and for a period of
                          twelve (12) months following termination, the Employee agrees not to directly or indirectly
                          engage in, own, manage, operate, or control any business that competes with the Company's
                          business within the geographic areas where the Company conducts business.
                        </p>
                        <p>
                          <span className="font-semibold">7.2 Non-Solicitation of Employees:</span> During employment
                          and for a period of eighteen (18) months following termination, the Employee agrees not to
                          directly or indirectly solicit, recruit, or hire any employee or contractor of the Company.
                        </p>
                        <p>
                          <span className="font-semibold">7.3 Non-Solicitation of Customers:</span> During employment
                          and for a period of twelve (12) months following termination, the Employee agrees not to
                          directly or indirectly solicit or conduct business with any customer or client of the Company
                          with whom the Employee had contact during employment.
                        </p>
                        <p>
                          <span className="font-semibold">7.4 Reasonableness:</span> The Employee acknowledges that the
                          restrictions contained in this Section are reasonable and necessary to protect the Company's
                          legitimate business interests.
                        </p>
                      </div>

                      <div className="mt-8">
                        <h2 className="text-xl font-bold mb-3">8. TERMINATION</h2>
                        <div className="space-y-3 text-sm">
                          <p>
                            <span className="font-semibold">8.1 At-Will Employment:</span> Employment with the Company
                            is at-will, meaning that either the Employee or the Company may terminate the employment
                            relationship at any time, with or without cause or notice.
                          </p>
                          <p>
                            <span className="font-semibold">8.2 Termination by Company for Cause:</span> The Company may
                            terminate the Employee's employment immediately for cause, including but not limited to:
                          </p>
                          <ul className="list-disc ml-6 space-y-1">
                            <li>Material breach of this Agreement or Company policies</li>
                            <li>Gross negligence or willful misconduct</li>
                            <li>Conviction of a felony or crime involving moral turpitude</li>
                            <li>Fraud, embezzlement, or dishonesty</li>
                            <li>Unauthorized disclosure of confidential information</li>
                          </ul>
                          <p>
                            <span className="font-semibold">8.3 Termination by Company without Cause:</span> If the
                            Company terminates the Employee's employment without cause, the Company shall provide thirty
                            (30) days' written notice or pay in lieu of notice.
                          </p>
                          <p>
                            <span className="font-semibold">8.4 Termination by Employee:</span> The Employee may
                            terminate employment by providing thirty (30) days' written notice to the Company.
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
                        Page 4 of 6 • Employment Contract • Confidential
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page 5 */}
                <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                  <div className="aspect-[8.5/11] bg-white p-12 text-gray-900">
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold mb-3">9. SEVERANCE</h2>
                      <div className="space-y-3 text-sm">
                        <p>
                          <span className="font-semibold">9.1 Severance Pay:</span> If the Company terminates the
                          Employee's employment without cause (excluding termination due to death or disability), the
                          Employee shall be entitled to severance pay equal to three (3) months of base salary, payable
                          in accordance with the Company's standard payroll practices.
                        </p>
                        <p>
                          <span className="font-semibold">9.2 Conditions:</span> Receipt of severance pay is contingent
                          upon the Employee signing a general release of claims and complying with all post-termination
                          obligations under this Agreement.
                        </p>
                        <p>
                          <span className="font-semibold">9.3 No Severance for Cause:</span> No severance shall be paid
                          if employment is terminated for cause or if the Employee voluntarily resigns.
                        </p>
                      </div>

                      <div className="mt-8">
                        <h2 className="text-xl font-bold mb-3">10. GENERAL PROVISIONS</h2>
                        <div className="space-y-3 text-sm">
                          <p>
                            <span className="font-semibold">10.1 Entire Agreement:</span> This Agreement constitutes the
                            entire agreement between the parties and supersedes all prior agreements, understandings,
                            and negotiations, whether written or oral.
                          </p>
                          <p>
                            <span className="font-semibold">10.2 Amendments:</span> This Agreement may only be amended
                            or modified by a written document signed by both parties.
                          </p>
                          <p>
                            <span className="font-semibold">10.3 Governing Law:</span> This Agreement shall be governed
                            by and construed in accordance with the laws of the State of California, without regard to
                            its conflict of laws principles.
                          </p>
                          <p>
                            <span className="font-semibold">10.4 Severability:</span> If any provision of this Agreement
                            is found to be invalid or unenforceable, the remaining provisions shall continue in full
                            force and effect.
                          </p>
                          <p>
                            <span className="font-semibold">10.5 Waiver:</span> The failure of either party to enforce
                            any provision of this Agreement shall not constitute a waiver of that provision or any other
                            provision.
                          </p>
                          <p>
                            <span className="font-semibold">10.6 Assignment:</span> This Agreement is personal to the
                            Employee and may not be assigned by the Employee. The Company may assign this Agreement to
                            any successor or affiliate.
                          </p>
                          <p>
                            <span className="font-semibold">10.7 Notices:</span> All notices required under this
                            Agreement shall be in writing and delivered by email, certified mail, or personal delivery
                            to the addresses set forth above.
                          </p>
                          <p>
                            <span className="font-semibold">10.8 Counterparts:</span> This Agreement may be executed in
                            counterparts, each of which shall be deemed an original and all of which together shall
                            constitute one instrument.
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
                        Page 5 of 6 • Employment Contract • Confidential
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page 6 - Signatures */}
                <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                  <div className="aspect-[8.5/11] bg-white p-12 text-gray-900">
                    <div className="space-y-6">
                      <div className="space-y-3 text-sm">
                        <p>
                          <span className="font-semibold">10.9 Dispute Resolution:</span> Any dispute arising out of or
                          relating to this Agreement shall be resolved through binding arbitration in accordance with
                          the rules of the American Arbitration Association, conducted in San Francisco, California.
                        </p>
                        <p>
                          <span className="font-semibold">10.10 Survival:</span> The provisions of Sections 5
                          (Confidentiality), 6 (Intellectual Property), and 7 (Non-Compete and Non-Solicitation) shall
                          survive the termination of this Agreement.
                        </p>
                      </div>

                      <div className="mt-12">
                        <p className="text-sm mb-8">
                          IN WITNESS WHEREOF, the parties have executed this Employment Agreement as of the date first
                          written above.
                        </p>

                        <div className="space-y-12">
                          <div>
                            <p className="font-semibold mb-6">COMPANY:</p>
                            <div className="border-b-2 border-gray-800 w-80 mb-2"></div>
                            <p className="text-sm">Signature</p>
                            <p className="text-sm mt-4 font-semibold">Sarah Chen</p>
                            <p className="text-sm">Chief Executive Officer, Teamified</p>
                            <p className="text-sm mt-2">Date: January 1, 2025</p>
                          </div>

                          <div>
                            <p className="font-semibold mb-6">EMPLOYEE:</p>
                            <div className="border-b-2 border-gray-800 w-80 mb-2"></div>
                            <p className="text-sm">Signature</p>
                            <p className="text-sm mt-4 font-semibold">Robert Downey Jr.</p>
                            <p className="text-sm">Principal Software Engineer</p>
                            <p className="text-sm mt-2">Date: January 1, 2025</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-12 pt-6 border-t border-gray-300">
                        <p className="text-xs text-gray-500 text-center mb-2">
                          This document contains confidential and proprietary information.
                        </p>
                        <p className="text-xs text-gray-500 text-center">
                          Unauthorized disclosure or distribution is strictly prohibited.
                        </p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
                        Page 6 of 6 • Employment Contract • Confidential
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "image":
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-muted rounded-2xl p-4 flex items-center justify-center relative">
              <img
                src={mockImages[currentImageIndex] || "/placeholder.svg"}
                alt={`Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
              />
              {mockImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : mockImages.length - 1))}
                    className="absolute left-6 p-3 rounded-full bg-card border border-border hover:bg-accent transition-all shadow-lg"
                    disabled={currentImageIndex === 0}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev < mockImages.length - 1 ? prev + 1 : 0))}
                    className="absolute right-6 p-3 rounded-full bg-card border border-border hover:bg-accent transition-all shadow-lg"
                    disabled={currentImageIndex === mockImages.length - 1}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-card border border-border shadow-lg">
                    <span className="text-sm font-medium">
                      {currentImageIndex + 1} / {mockImages.length}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 flex gap-3">
              <button className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition-colors flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </button>
            </div>
          </div>
        )

      case "video":
        return (
          <div className="h-full flex gap-4">
            <div className={`flex-1 flex flex-col transition-all ${showTranscription ? "mr-0" : ""}`}>
              <div className="flex-1 bg-muted rounded-2xl overflow-hidden">
                <video controls className="w-full h-full object-contain">
                  <source src="/placeholder-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setShowTranscription(!showTranscription)}
                  className="px-6 py-2.5 rounded-xl border border-border hover:bg-accent transition-colors font-medium"
                >
                  {showTranscription ? "Hide" : "Show"} Transcription
                </button>
              </div>
            </div>
            {showTranscription && (
              <div className="w-80 bg-card rounded-2xl border border-border p-4 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Video Transcription</h3>
                <div className="space-y-4">
                  {mockTranscription.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="text-[#A16AE8] font-mono font-medium">{item.time}</span>
                      <p className="mt-1 text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case "code":
        return (
          <div className="h-full flex gap-4">
            <div className="w-64 bg-card rounded-2xl border border-border p-4 overflow-y-auto">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">File Explorer</h3>
              <div className="space-y-1">
                {mockFileStructure.map((item, idx) => (
                  <div key={idx}>
                    <div
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent cursor-pointer ${item.type === "file" && item.active ? "bg-accent" : ""}`}
                    >
                      {item.type === "folder" ? (
                        <Folder className="w-4 h-4 text-[#8096FD]" />
                      ) : (
                        <FileCode className="w-4 h-4 text-[#A16AE8]" />
                      )}
                      <span className="text-sm">{item.name}</span>
                    </div>
                    {item.children && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child, childIdx) => (
                          <div
                            key={childIdx}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent cursor-pointer ${child.type === "file" && child.active ? "bg-accent" : ""}`}
                          >
                            {child.type === "folder" ? (
                              <Folder className="w-4 h-4 text-[#8096FD]" />
                            ) : (
                              <File className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">{child.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-card rounded-2xl border border-border overflow-hidden h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 bg-muted border-b border-border">
                  <span className="text-sm font-mono text-muted-foreground">{content.title || "code.tsx"}</span>
                  <button className="px-3 py-1.5 text-xs rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
                <div className="flex-1 p-6 overflow-auto">
                  <pre className="text-sm font-mono leading-relaxed">
                    <code className="text-foreground">{content.data || "// Code content here"}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )

      case "job-board":
        const user = getCurrentUser()

        let displayedJobs = mockJobListings

        if (user?.role === "candidate") {
          // Candidates can only see open and closed jobs (not draft or cancelled)
          displayedJobs = mockJobListings.filter(
            (job) => (job.applied || job.saved) && (job.status === "open" || job.status === "closed"),
          )
        }

        const appliedJobs = user?.role === "candidate" ? displayedJobs.filter((job) => job.applied) : []
        const savedJobs = user?.role === "candidate" ? displayedJobs.filter((job) => job.saved && !job.applied) : []

        return (
          <div className="h-full overflow-auto">
            {user?.role === "candidate" && displayedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Briefcase className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Jobs Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  You haven't applied to or saved any jobs yet. Start exploring available positions and apply to jobs
                  that match your skills!
                </p>
              </div>
            ) : user?.role === "candidate" ? (
              <div className="space-y-8">
                {/* Applied Jobs Section */}
                {appliedJobs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-semibold">Applied Jobs</h3>
                      <span className="px-3 py-1 text-sm rounded-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white">
                        {appliedJobs.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {appliedJobs.map((job) => (
                        <div
                          key={job.id}
                          className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all relative"
                        >
                          <div className="absolute top-6 right-6">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#A16AE8]/10 to-[#8096FD]/10 border border-border flex items-center justify-center overflow-hidden">
                              <img
                                src={job.logo || "/placeholder.svg"}
                                alt={`${job.company} logo`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          <div className="flex items-start justify-between mb-4 pr-16">
                            <div>
                              <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                              <p className="text-sm text-muted-foreground">{job.company}</p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              {job.status && (
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    job.status === "open"
                                      ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                      : job.status === "draft"
                                        ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                                        : job.status === "closed"
                                          ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                          : "bg-red-500/10 text-red-600 border border-red-500/20"
                                  }`}
                                >
                                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </span>
                              )}
                              <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white">
                                Applied
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {job.type}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.salary}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.posted}
                            </div>
                          </div>
                          <p className="text-sm mb-4 leading-relaxed line-clamp-2">{job.description}</p>
                          <div className="flex gap-2">
                            <button className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all">
                              View Application
                            </button>
                            <button
                              onClick={() => handleViewJobDetails(job)}
                              className="px-4 py-2 rounded-xl border border-border hover:bg-accent transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Saved Jobs Section */}
                {savedJobs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-semibold">Saved Jobs</h3>
                      <span className="px-3 py-1 text-sm rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        {savedJobs.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {savedJobs.map((job) => (
                        <div
                          key={job.id}
                          className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all relative"
                        >
                          <div className="absolute top-6 right-6">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#A16AE8]/10 to-[#8096FD]/10 border border-border flex items-center justify-center overflow-hidden">
                              <img
                                src={job.logo || "/placeholder.svg"}
                                alt={`${job.company} logo`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          <div className="flex items-start justify-between mb-4 pr-16">
                            <div>
                              <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                              <p className="text-sm text-muted-foreground">{job.company}</p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              {job.status && (
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    job.status === "open"
                                      ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                      : job.status === "draft"
                                        ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                                        : job.status === "closed"
                                          ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                          : "bg-red-500/10 text-red-600 border border-red-500/20"
                                  }`}
                                >
                                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </span>
                              )}
                              <span className="px-3 py-1 text-xs rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                                Saved
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {job.type}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.salary}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.posted}
                            </div>
                          </div>
                          <p className="text-sm mb-4 leading-relaxed line-clamp-2">{job.description}</p>
                          <div className="flex gap-2">
                            <button className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all">
                              Submit Application
                            </button>
                            <button
                              onClick={() => handleViewJobDetails(job)}
                              className="px-4 py-2 rounded-xl border border-border hover:bg-accent transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {displayedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all relative"
                  >
                    <div className="absolute top-6 right-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#A16AE8]/10 to-[#8096FD]/10 border border-border flex items-center justify-center overflow-hidden">
                        <img
                          src={job.logo || "/placeholder.svg"}
                          alt={`${job.company} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between mb-4 pr-16">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {job.status && (
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              job.status === "open"
                                ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                : job.status === "draft"
                                  ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                                  : job.status === "closed"
                                    ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                    : "bg-red-500/10 text-red-600 border border-red-500/20"
                            }`}
                          >
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        )}
                        {job.applied && (
                          <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white">
                            Applied
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.posted}
                      </div>
                    </div>
                    <p className="text-sm mb-4 leading-relaxed line-clamp-2">{job.description}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all">
                        {job.applied ? "View Application" : "Apply Now"}
                      </button>
                      <button
                        onClick={() => handleViewJobDetails(job)}
                        className="px-4 py-2 rounded-xl border border-border hover:bg-accent transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "job-view":
        return content.job ? <JobView job={content.job} /> : <div>No job data available</div>

      case "table":
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedData.length} of {mockCandidateData.length} candidates
              </p>
              <button
                onClick={() => {
                  setFilters({ name: "", position: "", experience: "", status: "", match: "" })
                  setSortColumn(null)
                }}
                className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent transition-colors"
              >
                Clear Filters
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort("name")}
                          className="flex items-center gap-2 font-medium hover:text-[#A16AE8] transition-colors"
                        >
                          Candidate
                          {renderSortIcon("name")}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort("position")}
                          className="flex items-center gap-2 font-medium hover:text-[#A16AE8] transition-colors"
                        >
                          Position
                          {renderSortIcon("position")}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort("experience")}
                          className="flex items-center gap-2 font-medium hover:text-[#A16AE8] transition-colors"
                        >
                          Experience
                          {renderSortIcon("experience")}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort("status")}
                          className="flex items-center gap-2 font-medium hover:text-[#A16AE8] transition-colors"
                        >
                          Status
                          {renderSortIcon("status")}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort("match")}
                          className="flex items-center gap-2 font-medium hover:text-[#A16AE8] transition-colors"
                        >
                          Match
                          {renderSortIcon("match")}
                        </button>
                      </th>
                    </tr>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Filter by name..."
                          value={filters.name}
                          onChange={(e) => handleFilterChange("name", e.target.value)}
                          className="w-full px-2 py-1 text-sm rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                        />
                      </th>
                      <th className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Filter by position..."
                          value={filters.position}
                          onChange={(e) => handleFilterChange("position", e.target.value)}
                          className="w-full px-2 py-1 text-sm rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                        />
                      </th>
                      <th className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={filters.experience}
                          onChange={(e) => handleFilterChange("experience", e.target.value)}
                          className="w-full px-2 py-1 text-sm rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                        />
                      </th>
                      <th className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={filters.status}
                          onChange={(e) => handleFilterChange("status", e.target.value)}
                          className="w-full px-2 py-1 text-sm rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                        />
                      </th>
                      <th className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={filters.match}
                          onChange={(e) => handleFilterChange("match", e.target.value)}
                          className="w-full px-2 py-1 text-sm rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedData.length > 0 ? (
                      filteredAndSortedData.map((row, idx) => (
                        <tr key={idx} className="border-b border-border last:border-0 hover:bg-accent/50">
                          <td className="px-4 py-3">{row.name}</td>
                          <td className="px-4 py-3">{row.position}</td>
                          <td className="px-4 py-3">{row.experience}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                row.status === "Offer"
                                  ? "bg-green-500/10 text-green-500"
                                  : row.status === "Interview"
                                    ? "bg-blue-500/10 text-blue-500"
                                    : row.status === "Review"
                                      ? "bg-yellow-500/10 text-yellow-500"
                                      : "bg-gray-500/10 text-gray-500"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD]"
                                  style={{ width: row.match }}
                                />
                              </div>
                              <span className="text-xs font-medium">{row.match}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No candidates found matching your filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case "analytics":
        return (
          <div className="h-full overflow-auto space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Applications per Job Role</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.applicationsByRole}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="role" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="applications" fill="#A16AE8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Candidates per Region</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.candidatesByRegion}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                  >
                    {analyticsData.candidatesByRegion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Hiring Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.hiringTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="applications" stroke="#A16AE8" strokeWidth={2} name="Applications" />
                  <Line type="monotone" dataKey="hires" stroke="#8096FD" strokeWidth={2} name="Hires" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col border-l border-border bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold">{getWorkspaceTitle()}</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Close workspace"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">{renderContent()}</div>
    </div>
  )
}
