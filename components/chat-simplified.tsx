"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Bot } from 'lucide-react';
import { useConversation } from '../hooks/use-conversation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { AI_AGENTS } from '../types/agents';

interface ChatSimplifiedProps {
  conversationType: 'ai_agent' | 'candidate_chat';
  participantId: string;
  currentUserId: string;
  className?: string;
}

export function ChatSimplified({ 
  conversationType, 
  participantId, 
  currentUserId, 
  className = '' 
}: ChatSimplifiedProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversationState, conversationActions] = useConversation(
    conversationType,
    participantId,
    currentUserId
  );
  
  const { messages, isLoading, error } = conversationState;
  const { sendMessage, clearConversation, setActive } = conversationActions;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set conversation as active when component mounts
  useEffect(() => {
    setActive(true);
    return () => setActive(false);
  }, [setActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Get participant info for display
  const getParticipantInfo = () => {
    if (conversationType === 'ai_agent') {
      const agent = AI_AGENTS.find(a => a.id === participantId);
      return {
        name: agent?.name || 'AI Assistant',
        avatar: agent?.name?.[0] || '🤖'
      };
    } else {
      // For candidate chat, we'd get candidate info from mock data
      return {
        name: `Candidate ${participantId}`,
        avatar: 'C'
      };
    }
  };

  const participantInfo = getParticipantInfo();

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
            {participantInfo.avatar}
          </div>
          <div>
            <h3 className="font-medium">{participantInfo.name}</h3>
            <p className="text-sm text-gray-500">
              {conversationType === 'ai_agent' ? 'AI Assistant' : 'Candidate'}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearConversation}
        >
          Clear
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <Card className="p-3 bg-red-50 border-red-200 text-red-700">
            Error: {error}
          </Card>
        )}
        
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Start a conversation...</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`max-w-[80%] p-3 ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100'
            }`}>
              <div className="text-sm">
                {message.content}
              </div>
              <div className="text-xs opacity-70 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </Card>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] p-3 bg-gray-100">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span className="text-sm">Typing...</span>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isLoading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button 
            type="button" 
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}