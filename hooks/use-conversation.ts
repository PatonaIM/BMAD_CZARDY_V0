// Unified conversation hook that replaces the complex chat logic
// Fixes sequencing issues and simplifies message management

import { useState, useCallback, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { conversationManager, Message, Conversation } from '../lib/conversation-manager';

export interface ConversationState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversation: Conversation | null;
}

export interface ConversationActions {
  sendMessage: (content: string, type?: 'text' | 'audio') => Promise<void>;
  clearConversation: () => void;
  setActive: (active: boolean) => void;
}

export function useConversation(
  conversationType: 'ai_agent' | 'candidate_chat',
  participantId: string,
  currentUserId: string
): [ConversationState, ConversationActions] {
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // For AI agents, use the @ai-sdk/react hook
  const {
    messages: aiMessages,
    append: appendAiMessage,
    isLoading: isAiLoading,
    setMessages: setAiMessages
  } = useChat({
    api: conversationType === 'ai_agent' ? '/api/chat' : '/api/candidate-chat',
    id: `${conversationType}_${participantId}`,
    onError: (err: Error) => setError(err.message),
    onFinish: (message: any) => {
      // Sync AI response back to conversation manager
      if (conversationType === 'ai_agent') {
        conversationManager.addMessage(
          conversationType,
          participantId,
          message.content,
          'assistant',
          participantId,
          'text'
        );
      }
    }
  });

  // Load conversation on mount
  useEffect(() => {
    const conv = conversationManager.getConversation(conversationType, participantId);
    setConversation(conv);
    
    // For AI agents, sync existing messages to useChat
    if (conversationType === 'ai_agent' && conv.messages.length > 0) {
      setAiMessages(conv.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content
      })));
    }
  }, [conversationType, participantId, setAiMessages]);

  // Subscribe to conversation updates
  useEffect(() => {
    const unsubscribe = conversationManager.subscribe((updatedConv) => {
      if (updatedConv.id === `${conversationType}_${participantId}`) {
        setConversation({...updatedConv});
      }
    });
    
    return unsubscribe;
  }, [conversationType, participantId]);

  const sendMessage = useCallback(async (content: string, type: 'text' | 'audio' = 'text') => {
    setError(null);
    
    try {
      if (conversationType === 'ai_agent') {
        // For AI agents: Add user message and let useChat handle the AI response
        conversationManager.addMessage(
          conversationType,
          participantId,
          content,
          'user',
          currentUserId,
          type
        );
        
        // Trigger AI response
        await appendAiMessage({
          role: 'user',
          content
        });
        
      } else {
        // For candidate chats: Add message directly (no AI response)
        conversationManager.addMessage(
          conversationType,
          participantId,
          content,
          'user',
          currentUserId,
          type
        );
        
        // Simulate candidate response after a delay
        setTimeout(() => {
          const responses = [
            "That's a great question! Let me think about that...",
            "I have experience with that technology. Here's what I can tell you...",
            "Thanks for asking! In my previous role...",
            "That's exactly the kind of challenge I enjoy working on.",
            "I'd be happy to elaborate on that point."
          ];
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          conversationManager.addMessage(
            conversationType,
            participantId,
            randomResponse,
            'assistant',
            participantId,
            'text'
          );
        }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [conversationType, participantId, currentUserId, appendAiMessage]);

  const clearConversation = useCallback(() => {
    conversationManager.clearConversation(conversationType, participantId);
    if (conversationType === 'ai_agent') {
      setAiMessages([]);
    }
  }, [conversationType, participantId, setAiMessages]);

  const setActive = useCallback((active: boolean) => {
    conversationManager.setConversationActive(conversationType, participantId, active);
  }, [conversationType, participantId]);

  const state: ConversationState = {
    messages: conversation?.messages || [],
    isLoading: conversationType === 'ai_agent' ? isAiLoading : false,
    error,
    conversation
  };

  const actions: ConversationActions = {
    sendMessage,
    clearConversation,
    setActive
  };

  return [state, actions];
}