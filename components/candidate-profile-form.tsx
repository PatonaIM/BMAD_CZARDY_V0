"use client"

import type React from "react"

import { useState } from "react"
import { Upload, LinkIcon, X, FileText, Camera, User } from "lucide-react"

interface PortfolioItem {
  id: string
  type: "file" | "link"
  name: string
  url?: string
}

interface CandidateProfileFormProps {
  onSave?: () => void
}

export function CandidateProfileForm({ onSave }: CandidateProfileFormProps) {
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    currentRole: "",
    yearsOfExperience: "",
    skills: "",
    linkedIn: "",
    github: "",
    portfolio: "",
  })

  const [resume, setResume] = useState<File | null>(null)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [showAddLink, setShowAddLink] = useState(false)
  const [newLinkName, setNewLinkName] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setResume(file)
    }
  }

  const handlePortfolioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newItems: PortfolioItem[] = Array.from(files).map((file) => ({
        id: `file-${Date.now()}-${Math.random()}`,
        type: "file",
        name: file.name,
      }))
      setPortfolioItems((prev) => [...prev, ...newItems])
    }
  }

  const handleAddLink = () => {
    if (newLinkName && newLinkUrl) {
      const newItem: PortfolioItem = {
        id: `link-${Date.now()}`,
        type: "link",
        name: newLinkName,
        url: newLinkUrl,
      }
      setPortfolioItems((prev) => [...prev, newItem])
      setNewLinkName("")
      setNewLinkUrl("")
      setShowAddLink(false)
    }
  }

  const handleRemovePortfolioItem = (id: string) => {
    setPortfolioItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Candidate profile submitted:", { formData, profilePicture, resume, portfolioItems })
    if (onSave) {
      onSave()
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Candidate Profile</h2>
          <p className="text-sm text-muted-foreground">
            Complete your profile to help us match you with the best opportunities
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-border bg-muted flex items-center justify-center">
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
              <label
                htmlFor="profile-picture-upload"
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#A16AE8] to-[#8096FD] flex items-center justify-center cursor-pointer hover:shadow-lg transition-all border-4 border-background"
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  id="profile-picture-upload"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Professional Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="currentRole" className="block text-sm font-medium text-foreground mb-2">
                  Current Role
                </label>
                <input
                  type="text"
                  id="currentRole"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                />
              </div>

              <div>
                <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-foreground mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-foreground mb-2">
                Key Skills
              </label>
              <textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="e.g., React, Node.js, TypeScript, AWS..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8] resize-none"
              />
            </div>
          </div>

          {/* CV/Resume Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">CV / Resume *</h3>

            <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-[#A16AE8] transition-colors">
              {resume ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#A16AE8] to-[#8096FD] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{resume.name}</p>
                      <p className="text-xs text-muted-foreground">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResume(null)}
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <label htmlFor="resume-upload" className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">Upload your CV or Resume</p>
                  <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (Max 10MB)</p>
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Social Links</h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="linkedIn" className="block text-sm font-medium text-foreground mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="linkedIn"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                />
              </div>

              <div>
                <label htmlFor="github" className="block text-sm font-medium text-foreground mb-2">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/yourusername"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                />
              </div>

              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium text-foreground mb-2">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                />
              </div>
            </div>
          </div>

          {/* My Portfolio */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">My Portfolio</h3>
              <div className="flex gap-2">
                <label
                  htmlFor="portfolio-files"
                  className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Files
                  <input
                    type="file"
                    id="portfolio-files"
                    multiple
                    onChange={handlePortfolioFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddLink(true)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  Add Link
                </button>
              </div>
            </div>

            {showAddLink && (
              <div className="p-4 rounded-lg border border-border bg-muted space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Link Name</label>
                  <input
                    type="text"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    placeholder="e.g., My Project Demo"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">URL</label>
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white hover:shadow-lg transition-all"
                  >
                    Add Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddLink(false)
                      setNewLinkName("")
                      setNewLinkUrl("")
                    }}
                    className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {portfolioItems.length > 0 && (
              <div className="space-y-2">
                {portfolioItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.type === "file" ? (
                        <FileText className="w-5 h-5 text-[#A16AE8]" />
                      ) : (
                        <LinkIcon className="w-5 h-5 text-[#8096FD]" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        {item.url && <p className="text-xs text-muted-foreground truncate max-w-[300px]">{item.url}</p>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePortfolioItem(item.id)}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {portfolioItems.length === 0 && !showAddLink && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No portfolio items added yet. Upload files or add links to showcase your work.
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-border">
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#A16AE8] to-[#8096FD] text-white font-medium hover:shadow-lg transition-all"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
