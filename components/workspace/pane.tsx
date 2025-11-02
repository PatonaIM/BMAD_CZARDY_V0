"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2 } from "lucide-react"
import { Save, Send, MoreVertical, Clock, MessageSquare } from "lucide-react"

const content = { type: "code" } // Example declaration for content
const isSavingDraft = false // Example declaration for isSavingDraft
const isSubmitting = false // Example declaration for isSubmitting
const isSubmittingChallenge = false // Example declaration for isSubmittingChallenge
const handleSaveAsDraft = () => {} // Example declaration for handleSaveAsDraft
const handleSubmitChallenge = () => {} // Example declaration for handleSubmitChallenge
const handleRequestExtension = () => {} // Example declaration for handleRequestExtension
const handleAskQuestion = () => {} // Example declaration for handleAskQuestion
const onClose = () => {} // Example declaration for onClose

{
  content.type === "code" && (
    <div className="flex items-center gap-1.5">
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
  )
}
