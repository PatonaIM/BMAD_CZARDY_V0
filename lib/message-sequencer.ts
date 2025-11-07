// Message sequencing utility to fix conversation ordering issues
// This replaces the complex dual-state logic in chat-main.ts

export interface SequencedMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: number;  // Use number for better sorting
  agentId?: string;
  avatar?: string;
  senderName?: string;
  isStreaming?: boolean;
  [key: string]: any; // Allow other properties from existing Message interface
}

class MessageSequencer {
  private messages: Map<string, SequencedMessage> = new Map();
  private listeners: Set<(messages: SequencedMessage[]) => void> = new Set();
  private messageOrder: string[] = [];

  // Add or update a message
  addMessage(message: SequencedMessage): void {
    const existingMessage = this.messages.get(message.id);
    
    if (existingMessage) {
      // Update existing message (for streaming)
      this.messages.set(message.id, { ...existingMessage, ...message });
    } else {
      // Add new message
      this.messages.set(message.id, message);
      this.messageOrder.push(message.id);
    }
    
    this.notifyListeners();
  }

  // Update message content (for streaming responses)
  updateMessage(id: string, content: string, isStreaming: boolean = false): void {
    const message = this.messages.get(id);
    if (message) {
      message.content = content;
      message.isStreaming = isStreaming;
      this.notifyListeners();
    }
  }

  // Get all messages in chronological order
  getMessages(): SequencedMessage[] {
    return this.messageOrder
      .map(id => this.messages.get(id))
      .filter((msg): msg is SequencedMessage => msg !== undefined)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  // Clear all messages
  clear(): void {
    this.messages.clear();
    this.messageOrder = [];
    this.notifyListeners();
  }

  // Subscribe to message updates
  subscribe(listener: (messages: SequencedMessage[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const messages = this.getMessages();
    this.listeners.forEach(listener => listener(messages));
  }

  // Remove a message
  removeMessage(id: string): void {
    this.messages.delete(id);
    this.messageOrder = this.messageOrder.filter(msgId => msgId !== id);
    this.notifyListeners();
  }

  // Get message count
  getMessageCount(): number {
    return this.messages.size;
  }
}

// Create singleton instance
export const messageSequencer = new MessageSequencer();

// Helper function to convert existing Message to SequencedMessage
export function toSequencedMessage(message: any): SequencedMessage {
  return {
    id: message.id,
    type: message.type || (message.role === 'user' ? 'user' : 'ai'),
    content: message.content,
    timestamp: message.timestamp ? new Date(message.timestamp).getTime() : Date.now(),
    agentId: message.agentId,
    avatar: message.avatar,
    senderName: message.senderName,
    isStreaming: false,
    ...message  // Include any other properties
  };
}

// Helper to generate message ID
export function generateMessageId(prefix: string = 'msg'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}