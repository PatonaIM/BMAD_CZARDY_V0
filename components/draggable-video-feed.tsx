"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Video, VideoOff, Mic, MicOff, X, GripVertical } from "lucide-react"

interface DraggableVideoFeedProps {
  onClose: () => void
  isWorkspaceOpen?: boolean
}

export function DraggableVideoFeed({ onClose, isWorkspaceOpen = false }: DraggableVideoFeedProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const dragStartOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (isWorkspaceOpen && containerRef.current) {
      const parent = containerRef.current.parentElement
      if (!parent) return

      const parentRect = parent.getBoundingClientRect()
      const containerWidth = 220
      const containerHeight = 320

      // Calculate the viewable area when workspace is open (left pane is 40% of screen)
      const viewableWidth = parentRect.width

      // Check if current position would be cut off by workspace
      const rightEdge = position.x + containerWidth
      const isObscured = rightEdge > viewableWidth - 40 // Add 40px buffer

      if (isObscured) {
        console.log("[v0] Video feed would be obscured by workspace, repositioning...")
        // Move to safe position on the left side
        const newX = Math.max(20, viewableWidth - containerWidth - 60)
        setPosition({ x: newX, y: position.y })
      }
    }
  }, [isWorkspaceOpen])

  useEffect(() => {
    console.log("[v0] DraggableVideoFeed mounted, requesting camera access...")
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 220, height: 320 },
          audio: true,
        })
        console.log("[v0] Camera access granted, stream:", mediaStream)
        setStream(mediaStream)
        setError(null)
      } catch (error) {
        console.error("[v0] Failed to access camera:", error)
        setError("Camera access denied")
      }
    }

    initCamera()

    return () => {
      console.log("[v0] DraggableVideoFeed unmounting, stopping camera...")
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop()
          console.log("[v0] Stopped track:", track.kind)
        })
      }
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      console.log("[v0] Video element srcObject set")
    }
  }, [stream])

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the drag handle
    const target = e.target as HTMLElement
    if (!target.closest(".drag-handle")) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    setIsDragging(true)
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    dragStartOffset.current = { ...position }
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()

      const deltaX = e.clientX - dragStartPos.current.x
      const deltaY = e.clientY - dragStartPos.current.y

      // Get parent container bounds (the voice mode container)
      const parent = containerRef.current?.parentElement
      if (!parent || !containerRef.current) return

      const parentRect = parent.getBoundingClientRect()
      const containerWidth = 220
      const containerHeight = 320

      // Calculate new position with bounds
      let newX = dragStartOffset.current.x + deltaX
      let newY = dragStartOffset.current.y + deltaY

      // Constrain within parent bounds
      newX = Math.max(0, Math.min(parentRect.width - containerWidth, newX))
      newY = Math.max(0, Math.min(parentRect.height - containerHeight, newY))

      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, position])

  const toggleCamera = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsCameraOn(videoTrack.enabled)
        console.log("[v0] Camera toggled:", videoTrack.enabled)
      }
    }
  }

  const toggleMic = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMicOn(audioTrack.enabled)
        console.log("[v0] Microphone toggled:", audioTrack.enabled)
      }
    }
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("[v0] Closing video feed...")
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    onClose()
  }

  return (
    <div
      ref={containerRef}
      className="absolute w-[220px] rounded-2xl bg-black/90 backdrop-blur-sm border-2 border-white/20 overflow-hidden shadow-2xl z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      <div
        className="drag-handle absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/80 to-transparent cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 group z-10"
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
        <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors">Drag to move</span>
      </div>

      {/* Video Container */}
      <div className="relative aspect-[11/16] bg-gray-900">
        {error ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 p-4 text-center">
            <VideoOff className="w-12 h-12 text-red-400 mb-2" />
            <p className="text-xs text-white/70">{error}</p>
          </div>
        ) : isCameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <VideoOff className="w-12 h-12 text-white/40" />
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between gap-2">
            {/* Camera Toggle */}
            <button
              onClick={toggleCamera}
              className={`p-2 rounded-full transition-colors ${
                isCameraOn ? "bg-white/20 hover:bg-white/30" : "bg-red-500/80 hover:bg-red-500"
              }`}
              aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
            >
              {isCameraOn ? <Video className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-white" />}
            </button>

            {/* Mic Toggle */}
            <button
              onClick={toggleMic}
              className={`p-2 rounded-full transition-colors ${
                isMicOn ? "bg-white/20 hover:bg-white/30" : "bg-red-500/80 hover:bg-red-500"
              }`}
              aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
            >
              {isMicOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white" />}
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
              aria-label="Close video feed"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
