"use client"

import { useEffect, useRef } from "react"
import { FileText, Calendar, Users, CheckCircle, Clock, Download } from "lucide-react"
import type { ContractData } from "@/types/workspace"

interface ContractViewerProps {
  contract: ContractData
  highlightSection?: string
  onSectionClick?: (sectionId: string) => void
}

export function ContractViewer({ contract, highlightSection, onSectionClick }: ContractViewerProps) {
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Auto-scroll to highlighted section
  useEffect(() => {
    if (highlightSection && sectionRefs.current[highlightSection]) {
      sectionRefs.current[highlightSection]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })

      // Add temporary highlight animation
      const element = sectionRefs.current[highlightSection]
      if (element) {
        element.classList.add("contract-highlight")
        setTimeout(() => {
          element.classList.remove("contract-highlight")
        }, 2000)
      }
    }
  }, [highlightSection])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "executed":
        return "text-green-600 bg-green-100"
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "draft":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "executed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-5xl mx-auto bg-background rounded-lg shadow-lg">
      {/* Contract Header */}
      <div className="border-b p-8 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="text-2xl font-bold">{contract.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">Contract ID: {contract.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(contract.status)}`}
            >
              {getStatusIcon(contract.status)}
              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </span>
            <button className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Download contract">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contract Metadata */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Company</p>
              <p className="font-medium">{contract.parties.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Client</p>
              <p className="font-medium">{contract.parties.client}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Effective Date</p>
              <p className="font-medium">{contract.effectiveDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Content */}
      <div className="p-8 space-y-8">
        <div className="prose prose-sm max-w-none">
          {/* Whereas Clauses */}
          <div className="space-y-3 mb-8 text-sm text-muted-foreground italic">
            <p>
              WHEREAS, {contract.parties.company} is an independent service provider with the necessary capital,
              equipment and expertise, primarily engaged in the business of providing professional services;
            </p>
            <p>
              WHEREAS, {contract.parties.client} is in need of an independent contractor capable of providing
              Professional Services;
            </p>
            <p>
              WHEREAS, {contract.parties.company} has offered its services and expertise to perform the provision of
              Professional Services for {contract.parties.client} and the latter has accepted the offer;
            </p>
            <p className="font-semibold text-foreground not-italic">
              NOW THEREFORE, for and in consideration of the foregoing premises, the parties hereto have agreed as
              follows:
            </p>
          </div>

          {/* Contract Sections */}
          {contract.sections.map((section) => (
            <div
              key={section.id}
              ref={(el) => {
                sectionRefs.current[section.id] = el
              }}
              className="mb-8 scroll-mt-4 transition-all duration-300"
              onClick={() => onSectionClick?.(section.id)}
            >
              <h4 className="text-lg font-bold mb-4 text-foreground">{section.title}</h4>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{section.content}</p>

                {/* Subsections */}
                {section.subsections && section.subsections.length > 0 && (
                  <div className="ml-6 space-y-4">
                    {section.subsections.map((subsection) => (
                      <div
                        key={subsection.id}
                        ref={(el) => {
                          sectionRefs.current[subsection.id] = el
                        }}
                        className="scroll-mt-4 transition-all duration-300"
                      >
                        <h5 className="text-sm font-semibold mb-2 text-foreground">{subsection.title}</h5>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {subsection.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Signatures Section */}
        {contract.signatories && contract.signatories.length > 0 && (
          <div className="border-t pt-8 mt-12">
            <h4 className="text-lg font-bold mb-6">EXECUTED BY</h4>
            <div className="grid grid-cols-2 gap-8">
              {contract.signatories.map((signatory, index) => (
                <div key={index} className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">{signatory.name}</p>
                    <p className="text-sm text-muted-foreground">Position: {signatory.position}</p>
                    <p className="text-sm text-muted-foreground">Date: {signatory.date}</p>
                  </div>
                  <div className="border-t pt-4">
                    {signatory.signed ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Signed</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Signature pending</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .contract-highlight {
          background-color: rgba(161, 106, 232, 0.1);
          border-left: 4px solid #a16ae8;
          padding-left: 1rem;
          animation: highlight-fade 2s ease-out;
        }

        @keyframes highlight-fade {
          0% {
            background-color: rgba(161, 106, 232, 0.3);
          }
          100% {
            background-color: rgba(161, 106, 232, 0.1);
          }
        }
      `}</style>
    </div>
  )
}
