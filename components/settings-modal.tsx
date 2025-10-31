"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
    streamResponses: true,
    saveHistory: true,
    showSuggestions: true,
    autoSave: true,
  })

  if (!isOpen) return null

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem("ai-settings", JSON.stringify(settings))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Model Settings */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">AI Model</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Model</label>
                <select
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                >
                  <option value="gpt-4">GPT-4 (Most capable)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                  <option value="claude-3">Claude 3 (Alternative)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Temperature: {settings.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: Number.parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower values make responses more focused, higher values more creative
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Max Tokens</label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  step="100"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({ ...settings, maxTokens: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#A16AE8]"
                />
                <p className="text-xs text-muted-foreground mt-1">Maximum length of AI responses</p>
              </div>
            </div>
          </div>

          {/* Chat Settings */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Chat Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-foreground">Stream responses</div>
                  <div className="text-xs text-muted-foreground">Show AI responses as they're generated</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.streamResponses}
                  onChange={(e) => setSettings({ ...settings, streamResponses: e.target.checked })}
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-foreground">Save chat history</div>
                  <div className="text-xs text-muted-foreground">Keep your conversations for future reference</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.saveHistory}
                  onChange={(e) => setSettings({ ...settings, saveHistory: e.target.checked })}
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-foreground">Show prompt suggestions</div>
                  <div className="text-xs text-muted-foreground">Display suggested prompts after responses</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showSuggestions}
                  onChange={(e) => setSettings({ ...settings, showSuggestions: e.target.checked })}
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-foreground">Auto-save drafts</div>
                  <div className="text-xs text-muted-foreground">Automatically save your message drafts</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                  className="w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Data & Privacy */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Data & Privacy</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Export chat history
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
              >
                Clear all chat history
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#A16AE8] hover:bg-[#8F4FD1]">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
