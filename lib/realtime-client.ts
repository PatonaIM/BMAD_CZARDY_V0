// Client-side WebRTC connection manager for OpenAI Realtime API
export class RealtimeClient {
  private peerConnection: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null
  private audioElement: HTMLAudioElement | null = null
  private sessionConfig: any = null
  private onMessageCallback: ((message: any) => void) | null = null
  private onAudioCallback: ((isPlaying: boolean) => void) | null = null
  private onConnectionReadyCallback: (() => void) | null = null

  async connect(agentId?: string) {
    try {
      // Get ephemeral token from our API
      const response = await fetch("/api/openai/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentId }), // Pass agentId to session API
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get session token: ${response.status} ${errorText}`)
      }

      this.sessionConfig = await response.json()

      if (!this.sessionConfig?.client_secret?.value) {
        throw new Error("Invalid session config: missing client_secret")
      }

      const ephemeralKey = this.sessionConfig.client_secret.value
      const model = this.sessionConfig.model
      const realtimeUrl = `https://api.openai.com/v1/realtime?model=${model}`

      // Create peer connection
      this.peerConnection = new RTCPeerConnection()

      // Set up audio element for playback
      this.audioElement = document.createElement("audio")
      this.audioElement.autoplay = true

      this.audioElement.addEventListener("play", () => {
        console.log("[v0] Audio element started playing")
        if (this.onAudioCallback) {
          this.onAudioCallback(true)
        }
      })

      this.audioElement.addEventListener("ended", () => {
        console.log("[v0] Audio element finished playing (ended event)")
        if (this.onAudioCallback) {
          this.onAudioCallback(false)
        }
      })

      this.audioElement.addEventListener("pause", () => {
        console.log("[v0] Audio element paused, ended:", this.audioElement?.ended)
        // Only set to false if the audio has actually ended, not just paused
        if (this.audioElement && this.audioElement.ended && this.onAudioCallback) {
          this.onAudioCallback(false)
        }
      })

      // Handle incoming audio tracks
      this.peerConnection.ontrack = (event) => {
        if (this.audioElement && event.streams[0]) {
          this.audioElement.srcObject = event.streams[0]
        }
      }

      // Create data channel for messages
      this.dataChannel = this.peerConnection.createDataChannel("oai-events")

      this.dataChannel.onopen = () => {
        console.log("[v0] Data channel is now open")
        // Trigger connection ready callback only when data channel is actually open
        this.onConnectionReadyCallback?.()
      }

      this.dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.onMessageCallback?.(message)
        } catch (error) {
          console.error("Error parsing message:", error)
        }
      }

      // Add microphone audio track
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, stream)
      })

      // Create and set local offer
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)

      const sdpResponse = await fetch(realtimeUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      })

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text()
        throw new Error(`Failed to exchange SDP: ${sdpResponse.status}`)
      }

      const answerSdp = await sdpResponse.text()

      await this.peerConnection.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      })
    } catch (error) {
      console.error("Connection error:", error)
      throw error
    }
  }

  sendMessage(message: any) {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(JSON.stringify(message))
    }
  }

  onMessage(callback: (message: any) => void) {
    this.onMessageCallback = callback
  }

  onAudioStateChange(callback: (isPlaying: boolean) => void) {
    this.onAudioCallback = callback
  }

  onConnectionReady(callback: () => void) {
    this.onConnectionReadyCallback = callback
  }

  requestIntroduction() {
    // Simply trigger a response - the system instructions already tell the AI to introduce itself
    this.sendMessage({
      type: "response.create",
    })
  }

  cancelResponse() {
    this.sendMessage({
      type: "response.cancel",
    })
  }

  updateSessionInstructions(instructions: string) {
    this.sendMessage({
      type: "session.update",
      session: {
        instructions: instructions,
      },
    })
  }

  disconnect() {
    console.log("[v0] RealtimeClient disconnect called")

    if (this.dataChannel) {
      console.log("[v0] Closing data channel")
      this.dataChannel.close()
      this.dataChannel = null
    }

    if (this.peerConnection) {
      console.log("[v0] Closing peer connection")
      this.peerConnection.close()
      this.peerConnection = null
    }

    if (this.audioElement) {
      console.log("[v0] Cleaning up audio element")
      this.audioElement.pause()
      this.audioElement.srcObject = null
      this.audioElement = null
    }

    this.onMessageCallback = null
    this.onAudioCallback = null
    this.onConnectionReadyCallback = null

    console.log("[v0] RealtimeClient disconnected successfully")
  }
}
