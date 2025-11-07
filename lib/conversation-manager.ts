// Unified conversation management system
// Fixes sequencing issues by using a single source of truth

// Generate unique IDs using crypto
function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  senderId: string;
  type: 'text' | 'audio';
  metadata?: {
    agentId?: string;
    candidateId?: string;
    conversationType?: 'ai_agent' | 'candidate_chat';
    audioUrl?: string;
    duration?: number;
  };
}

export interface Conversation {
  id: string;
  type: 'ai_agent' | 'candidate_chat';
  participantId: string; // agentId or candidateId
  messages: Message[];
  lastUpdated: string;
  isActive: boolean;
}

class ConversationManager {
  private conversations: Map<string, Conversation> = new Map();
  private listeners: Set<(conversation: Conversation) => void> = new Set();

  constructor() {
    this.loadConversations();
  }

  private async loadConversations() {
    try {
      // Load from local JSON file
      const response = await fetch('/data/conversations.json');
      const data = await response.json();
      
      // Load AI agent conversations
      Object.entries(data.aiAgentConversations || {}).forEach(([agentId, messages]) => {
        const conversation: Conversation = {
          id: `ai_${agentId}`,
          type: 'ai_agent',
          participantId: agentId,
          messages: messages as Message[],
          lastUpdated: new Date().toISOString(),
          isActive: false
        };
        this.conversations.set(conversation.id, conversation);
      });

      // Load candidate conversations
      Object.entries(data.candidateConversations || {}).forEach(([candidateId, messages]) => {
        const conversation: Conversation = {
          id: `candidate_${candidateId}`,
          type: 'candidate_chat',
          participantId: candidateId,
          messages: messages as Message[],
          lastUpdated: new Date().toISOString(),
          isActive: false
        };
        this.conversations.set(conversation.id, conversation);
      });
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }

  // Get or create conversation
  getConversation(type: 'ai_agent' | 'candidate_chat', participantId: string): Conversation {
    const conversationId = `${type}_${participantId}`;
    let conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      conversation = {
        id: conversationId,
        type,
        participantId,
        messages: [],
        lastUpdated: new Date().toISOString(),
        isActive: false
      };
      this.conversations.set(conversationId, conversation);
    }
    
    return conversation;
  }

  // Add message with proper sequencing
  addMessage(
    conversationType: 'ai_agent' | 'candidate_chat',
    participantId: string,
    content: string,
    role: 'user' | 'assistant',
    senderId: string,
    type: 'text' | 'audio' = 'text',
    metadata?: any
  ): Message {
    const conversation = this.getConversation(conversationType, participantId);
    
    const message: Message = {
      id: generateId(),
      content,
      role,
      timestamp: new Date().toISOString(),
      senderId,
      type,
      metadata: {
        ...metadata,
        conversationType,
        [conversationType === 'ai_agent' ? 'agentId' : 'candidateId']: participantId
      }
    };

    // Add message in sequence
    conversation.messages.push(message);
    conversation.lastUpdated = message.timestamp;
    conversation.isActive = true;

    // Notify listeners
    this.notifyListeners(conversation);
    
    // Save to storage
    this.saveConversation(conversation);
    
    return message;
  }

  // Update message (for streaming responses)
  updateMessage(messageId: string, content: string): void {
    for (const conversation of this.conversations.values()) {
      const message = conversation.messages.find(m => m.id === messageId);
      if (message) {
        message.content = content;
        conversation.lastUpdated = new Date().toISOString();
        this.notifyListeners(conversation);
        this.saveConversation(conversation);
        return;
      }
    }
  }

  // Get messages for a conversation in chronological order
  getMessages(conversationType: 'ai_agent' | 'candidate_chat', participantId: string): Message[] {
    const conversation = this.getConversation(conversationType, participantId);
    return [...conversation.messages].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  // Mark conversation as active/inactive
  setConversationActive(conversationType: 'ai_agent' | 'candidate_chat', participantId: string, isActive: boolean): void {
    const conversation = this.getConversation(conversationType, participantId);
    conversation.isActive = isActive;
    this.notifyListeners(conversation);
  }

  // Subscribe to conversation changes
  subscribe(listener: (conversation: Conversation) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(conversation: Conversation): void {
    this.listeners.forEach(listener => listener(conversation));
  }

  private async saveConversation(conversation: Conversation): Promise<void> {
    // In a real app, this would save to a database
    // For now, we'll just save to localStorage for persistence
    try {
      const stored = localStorage.getItem('conversations') || '{}';
      const conversations = JSON.parse(stored);
      conversations[conversation.id] = conversation;
      localStorage.setItem('conversations', JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  // Get all conversations for sidebar
  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values())
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }

  // Clear conversation
  clearConversation(conversationType: 'ai_agent' | 'candidate_chat', participantId: string): void {
    const conversation = this.getConversation(conversationType, participantId);
    conversation.messages = [];
    conversation.lastUpdated = new Date().toISOString();
    this.notifyListeners(conversation);
    this.saveConversation(conversation);
  }
}

// Export singleton instance
export const conversationManager = new ConversationManager();