"use client"

import type React from "react"
import { Copy } from "lucide-react"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      // Code blocks (```language ... ```)
      if (line.startsWith("```")) {
        const language = line.substring(3).trim() || "plaintext"
        const codeLines: string[] = []
        i++ // Move past the opening ```

        // Collect all lines until closing ```
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i])
          i++
        }

        const codeContent = codeLines.join("\n")

        elements.push(
          <div key={i} className="rounded-2xl overflow-hidden border border-border bg-card my-4">
            <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
              <span className="text-xs font-mono text-muted-foreground">{language}</span>
              <button
                onClick={() => navigator.clipboard.writeText(codeContent)}
                className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg hover:bg-accent transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy code
              </button>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-xs font-mono leading-relaxed">
                <code className="text-foreground">{codeContent}</code>
              </pre>
            </div>
          </div>,
        )

        i++ // Move past the closing ```
        continue
      }

      // Headers
      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-lg font-semibold text-foreground mt-6 mb-3">
            {line.substring(4)}
          </h3>,
        )
        i++
        continue
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-xl font-semibold text-foreground mt-6 mb-3">
            {line.substring(3)}
          </h2>,
        )
        i++
        continue
      }
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-foreground mt-6 mb-4">
            {line.substring(2)}
          </h1>,
        )
        i++
        continue
      }

      // Bold text (using **text**)
      if (line.includes("**")) {
        const parts = line.split("**")
        const formatted = parts.map((part, idx) => {
          if (idx % 2 === 1) {
            return (
              <strong key={idx} className="font-semibold text-foreground">
                {part}
              </strong>
            )
          }
          return <span key={idx}>{part}</span>
        })
        elements.push(
          <p key={i} className="text-sm leading-relaxed text-foreground mb-4">
            {formatted}
          </p>,
        )
        i++
        continue
      }

      // Bullet lists
      if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
        const listItems: string[] = []
        while (
          i < lines.length &&
          (lines[i].startsWith("• ") || lines[i].startsWith("- ") || lines[i].startsWith("* "))
        ) {
          listItems.push(lines[i].substring(2))
          i++
        }
        elements.push(
          <ul key={i} className="list-disc list-inside space-y-2 mb-4 text-sm text-foreground">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>,
        )
        continue
      }

      // Empty lines
      if (line.trim() === "") {
        i++
        continue
      }

      // Regular paragraphs
      elements.push(
        <p key={i} className="text-sm leading-relaxed text-foreground mb-4">
          {line}
        </p>,
      )
      i++
    }

    return elements
  }

  return <div className="space-y-2">{renderMarkdown(content)}</div>
}
