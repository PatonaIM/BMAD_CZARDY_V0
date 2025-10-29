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
} from "lucide-react"
import { useState } from "react"
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

interface WorkspacePaneProps {
  isOpen: boolean
  onClose: () => void
  content: WorkspaceContent
}

const mockJobListings: JobListing[] = [
  {
    id: "1",
    title: "Senior Full-Stack Developer",
    company: "Teamified",
    location: "Remote",
    type: "Full-time",
    salary: "$120k - $160k",
    posted: "2 days ago",
    description: "We're looking for an experienced full-stack developer to join our growing team.",
    requirements: ["5+ years experience", "React & Node.js", "TypeScript", "AWS"],
    applied: false,
  },
  {
    id: "2",
    title: "AI Engineer",
    company: "Tech Innovations",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$140k - $180k",
    posted: "1 week ago",
    description: "Join our AI team to build cutting-edge machine learning solutions.",
    requirements: ["Python", "TensorFlow/PyTorch", "ML algorithms", "3+ years experience"],
    applied: true,
  },
  {
    id: "3",
    title: "Product Manager",
    company: "StartupCo",
    location: "New York, NY",
    type: "Full-time",
    salary: "$130k - $170k",
    posted: "3 days ago",
    description: "Lead product strategy and execution for our flagship product.",
    requirements: ["5+ years PM experience", "Agile/Scrum", "Data-driven", "B2B SaaS"],
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$110k - $150k",
    posted: "5 days ago",
    description: "Build and maintain our cloud infrastructure and CI/CD pipelines.",
    requirements: ["Kubernetes", "Docker", "AWS/GCP", "Terraform", "4+ years experience"],
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

export function WorkspacePane({ isOpen, onClose, content }: WorkspacePaneProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showTranscription, setShowTranscription] = useState(false)

  const mockImages = ["/dashboard-analytics.png", "/user-interface-design.png", "/data-visualization-abstract.png"]

  if (!isOpen || !content.type) return null

  const renderContent = () => {
    switch (content.type) {
      case "pdf":
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-muted rounded-2xl p-8 flex items-center justify-center">
              <div className="text-center max-w-2xl">
                <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#A16AE8] to-[#8096FD] flex items-center justify-center shadow-xl">
                  <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">{content.title || "Document.pdf"}</h3>
                <p className="text-muted-foreground mb-8">PDF Document • 2.4 MB • 12 pages</p>
                <div className="flex gap-3 justify-center">
                  <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all">
                    Open Full Preview
                  </button>
                  <button className="px-8 py-3 rounded-xl border border-border hover:bg-accent transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
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
        return (
          <div className="h-full overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mockJobListings.map((job) => (
                <div
                  key={job.id}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                    {job.applied && (
                      <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white">
                        Applied
                      </span>
                    )}
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
                    <button className="px-4 py-2 rounded-xl border border-border hover:bg-accent transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "table":
        return (
          <div className="h-full overflow-auto">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-4 py-3 text-left font-medium">Candidate</th>
                    <th className="px-4 py-3 text-left font-medium">Position</th>
                    <th className="px-4 py-3 text-left font-medium">Experience</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Sarah Johnson", "Senior Full-Stack", "8 years", "Interview", "95%"],
                    ["Michael Chen", "AI Engineer", "5 years", "Review", "88%"],
                    ["Emily Rodriguez", "Product Manager", "6 years", "Offer", "92%"],
                    ["David Kim", "DevOps Engineer", "7 years", "Assessment", "85%"],
                    ["Lisa Wang", "Data Scientist", "6 years", "Interview", "90%"],
                    ["James Brown", "Frontend Dev", "4 years", "Review", "82%"],
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-accent/50">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-3">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
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
        <h2 className="text-lg font-semibold">Workspace</h2>
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
