"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { VideoOff } from "lucide-react"

interface DraggableVideoFeedProps {
  onClose: () => void
  isWorkspaceOpen?: boolean
}

export function DraggableVideoFeed({ onClose, isWorkspaceOpen = false }: DraggableVideoFeedProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [stream, setStream] = useState<MediaStream | null>(null)
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
      const containerWidth = 250
      const containerHeight = 250

      const viewableWidth = parentRect.width

      const rightEdge = position.x + containerWidth
      const isObscured = rightEdge > viewableWidth - 40

      if (isObscured) {
        console.log("[v0] Video feed would be obscured by workspace, repositioning...")
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
          video: { width: 250, height: 250 },
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

      const parent = containerRef.current?.parentElement
      if (!parent || !containerRef.current) return

      const parentRect = parent.getBoundingClientRect()
      const containerWidth = 250
      const containerHeight = 250

      let newX = dragStartOffset.current.x + deltaX
      let newY = dragStartOffset.current.y + deltaY

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

  return (
    <div
      ref={containerRef}
      className="absolute w-[250px] rounded-2xl bg-black/90 backdrop-blur-sm border-2 border-white/20 overflow-hidden shadow-2xl z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative aspect-square bg-gray-900">
        {error ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 p-4 text-center">
            <VideoOff className="w-12 h-12 text-red-400 mb-2" />
            <p className="text-xs text-white/70">{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        )}
      </div>
    </div>
  )
}
