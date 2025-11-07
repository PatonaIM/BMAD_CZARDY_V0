"use client"

import { ChatSimplified } from '@/components/chat-simplified';

export default function TestChatPage() {
  return (
    <div className="h-screen p-4">
      <div className="h-full max-w-4xl mx-auto grid grid-cols-2 gap-4">
        {/* AI Agent Chat */}
        <div className="border rounded-lg">
          <h2 className="p-4 border-b font-semibold">AI Agent Chat</h2>
          <div className="h-[calc(100%-60px)]">
            <ChatSimplified 
              conversationType="ai_agent"
              participantId="hiring-assistant"
              currentUserId="user123"
            />
          </div>
        </div>
        
        {/* Candidate Chat */}
        <div className="border rounded-lg">
          <h2 className="p-4 border-b font-semibold">Candidate Chat</h2>
          <div className="h-[calc(100%-60px)]">
            <ChatSimplified 
              conversationType="candidate_chat"
              participantId="1"
              currentUserId="user123"
            />
          </div>
        </div>
      </div>
    </div>
  );
}