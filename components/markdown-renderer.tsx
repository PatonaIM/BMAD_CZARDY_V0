import type React from "react"

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
        const language = line.substring(3).trim()
        const codeLines: string[] = []
        i++ // Move past the opening ```

        // Collect all lines until closing ```
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i])
          i++
        }

        // Skip the closing ```
        if (i < lines.length && lines[i].startsWith("```")) {
          i++
        }

        // Render the code block
        elements.push(
          <div key={i} className="my-4 rounded-lg overflow-hidden border border-border">
            {language && (
              <div className="bg-muted px-4 py-2 text-xs font-mono text-muted-foreground border-b border-border">
                {language}
              </div>
            )}
            <pre className="bg-muted/50 p-4 overflow-x-auto">
              <code className="text-sm font-mono text-foreground">{codeLines.join("\n")}</code>
            </pre>
          </div>,
        )
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
