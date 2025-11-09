"use client"

import { useState } from "react"
import {
  Folder,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  List,
  Grid3x3,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react"

interface LibraryContentProps {
  isSidebarOpen: boolean
}

type ViewMode = "list" | "grid"
type ItemType = "folder" | "document" | "spreadsheet" | "image" | "pdf" | "file"

interface LibraryItem {
  id: string
  name: string
  type: ItemType
  owner: string
  dateModified: string
  fileSize?: string
  shared?: boolean
}

export function LibraryContent({ isSidebarOpen }: LibraryContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [sortBy, setSortBy] = useState<string>("name")
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // Mock data similar to Google Drive
  const items: LibraryItem[] = [
    { id: "1", name: "Candidate Profiles", type: "folder", owner: "me", dateModified: "25 Aug me" },
    { id: "2", name: "HR Documents", type: "folder", owner: "me", dateModified: "20 May me" },
    { id: "3", name: "Interview Recordings", type: "folder", owner: "me", dateModified: "20 May me" },
    { id: "4", name: "Job Descriptions", type: "folder", owner: "me", dateModified: "9 Jun me" },
    { id: "5", name: "Projects", type: "folder", owner: "me", dateModified: "4 Jun me" },
    { id: "6", name: "Quick Notes", type: "folder", owner: "me", dateModified: "20 May me" },
    { id: "7", name: "Recruitment", type: "folder", owner: "me", dateModified: "13 Jun me" },
    { id: "8", name: "Strategy Documents", type: "folder", owner: "me", dateModified: "28 Jul me" },
    {
      id: "9",
      name: "2024 Hiring Plan",
      type: "document",
      owner: "me",
      dateModified: "20 Aug 2024",
      fileSize: "40 KB",
      shared: true,
    },
    {
      id: "10",
      name: "Candidate Assessment Template",
      type: "spreadsheet",
      owner: "me",
      dateModified: "21 Oct 2024",
      fileSize: "24 KB",
      shared: true,
    },
    {
      id: "11",
      name: "Team Org Chart",
      type: "document",
      owner: "me",
      dateModified: "21 Feb",
      fileSize: "8 KB",
      shared: true,
    },
    {
      id: "12",
      name: "Interview Feedback Form",
      type: "spreadsheet",
      owner: "me",
      dateModified: "28 Aug me",
      fileSize: "19 KB",
    },
    {
      id: "13",
      name: "Job Posting Template",
      type: "document",
      owner: "me",
      dateModified: "31 Mar",
      fileSize: "4 KB",
      shared: true,
    },
    {
      id: "14",
      name: "Onboarding Checklist",
      type: "document",
      owner: "me",
      dateModified: "15 Mar 2024",
      fileSize: "2 KB",
      shared: true,
    },
    {
      id: "15",
      name: "Salary Benchmarking Report",
      type: "pdf",
      owner: "me",
      dateModified: "30 Sept me",
      fileSize: "147 KB",
    },
    {
      id: "16",
      name: "Technical Skills Matrix",
      type: "spreadsheet",
      owner: "me",
      dateModified: "07:58 Siegfried Lorelle Mina",
      fileSize: "4 KB",
      shared: true,
    },
  ]

  const getIcon = (type: ItemType) => {
    switch (type) {
      case "folder":
        return <Folder className="w-5 h-5 text-muted-foreground" />
      case "document":
        return <FileText className="w-5 h-5 text-[#4285F4]" />
      case "spreadsheet":
        return <FileSpreadsheet className="w-5 h-5 text-[#0F9D58]" />
      case "image":
        return <FileImage className="w-5 h-5 text-[#EA4335]" />
      case "pdf":
        return <File className="w-5 h-5 text-[#EA4335]" />
      default:
        return <File className="w-5 h-5 text-muted-foreground" />
    }
  }

  const handleDownload = (item: LibraryItem) => {
    // Download logic would go here
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-foreground">My Library</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                }`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <FilterButton label="Type" />
            <FilterButton label="People" />
            <FilterButton label="Modified" />
            <FilterButton label="Source" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === "list" ? (
          <div className="px-6 py-4">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 px-4 py-2 border-b border-border text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Name</span>
                <ArrowUpDown className="w-4 h-4" />
              </div>
              <div>Owner</div>
              <div>Date modified</div>
              <div>File size</div>
              <div></div>
            </div>

            {/* Table Rows */}
            <div className="space-y-1 mt-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-5 gap-4 px-4 py-3 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getIcon(item.type)}
                    <span className="text-sm text-foreground truncate">{item.name}</span>
                    {item.shared && <Share2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#A16AE8] flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">CD</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.owner}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">{item.dateModified}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">{item.fileSize || "—"}</span>
                  </div>
                  <div className="flex items-center justify-end">
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                        className="p-1 rounded hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="More actions"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Action Menu */}
                      {activeMenu === item.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => handleDownload(item)}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors text-sm"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors text-sm">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors text-sm text-destructive">
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Grid View
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 flex items-center justify-center">{getIcon(item.type)}</div>
                    <button
                      onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                      className="p-1 rounded hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="More actions"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-sm font-medium text-foreground truncate mb-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.dateModified}</p>
                  {item.fileSize && <p className="text-xs text-muted-foreground mt-1">{item.fileSize}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterButton({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
      <span className="text-sm text-foreground">{label}</span>
      <ChevronDown className="w-4 h-4 text-muted-foreground" />
    </button>
  )
}
