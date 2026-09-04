export type ConversationRecord = {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  createdAt: Date;
  memberIds: string[];
};

export type MessageRecord = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  readBy: string[];
};

export const conversations: ConversationRecord[] = [];
export const messages: MessageRecord[] = [];

export class ChatRepository {
  static createConversation(input: Omit<ConversationRecord, 'createdAt'> & { createdAt?: Date }): ConversationRecord {
    const conversation: ConversationRecord = {
      id: input.id,
      type: input.type,
      name: input.name,
      createdAt: input.createdAt ?? new Date(),
      memberIds: Array.from(new Set(input.memberIds)),
    };
    conversations.push(conversation);
    return conversation;
  }

  static listForUser(userId: string): ConversationRecord[] {
    return conversations.filter((conversation) => conversation.memberIds.includes(userId));
  }

  static findById(conversationId: string): ConversationRecord | undefined {
    return conversations.find((conversation) => conversation.id === conversationId);
  }

  static isMember(conversationId: string, userId: string): boolean {
    const conversation = this.findById(conversationId);
    return Boolean(conversation && conversation.memberIds.includes(userId));
  }

  static addMessage(input: Omit<MessageRecord, 'createdAt' | 'readBy'> & { createdAt?: Date; readBy?: string[] }): MessageRecord {
    const record: MessageRecord = {
      id: input.id,
      conversationId: input.conversationId,
      senderId: input.senderId,
      content: input.content,
      createdAt: input.createdAt ?? new Date(),
      readBy: input.readBy ?? [],
    };
    messages.push(record);
    return record;
  }

  static listMessages(conversationId: string): MessageRecord[] {
    return messages
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  static markRead(messageId: string, userId: string): MessageRecord | undefined {
    const message = messages.find((entry) => entry.id === messageId);
    if (!message) return undefined;
    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
    }
    return message;
  }

  static serializeConversation(conversation: ConversationRecord, viewerId?: string) {
    const recentMessage = this.listMessages(conversation.id).at(-1);
    const unreadCount = viewerId
      ? this.listMessages(conversation.id).filter((message) => message.senderId !== viewerId && !message.readBy.includes(viewerId)).length
      : 0;

    return {
      id: conversation.id,
      type: conversation.type,
      name: conversation.name,
      memberIds: conversation.memberIds,
      createdAt: conversation.createdAt,
      lastMessage: recentMessage
        ? {
            id: recentMessage.id,
            senderId: recentMessage.senderId,
            content: recentMessage.content,
            createdAt: recentMessage.createdAt,
          }
        : null,
      unreadCount,
    };
  }

  static serializeMessage(message: MessageRecord) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      readBy: message.readBy,
    };
  }
}
