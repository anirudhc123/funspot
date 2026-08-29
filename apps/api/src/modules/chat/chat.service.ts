import { AppError } from '../../errors/AppError';
import { ChatRepository, ConversationRecord, MessageRecord } from './chat.repository';

export class ChatService {
  static createConversation(actorId: string, participantIds: string[], name?: string) {
    const members = Array.from(new Set([actorId, ...participantIds.filter(Boolean)]));
    if (members.length < 2) {
      throw new AppError(400, 'INVALID_CONVERSATION', 'A conversation must have at least two members.');
    }

    const conversation: ConversationRecord = ChatRepository.createConversation({
      id: `conversation-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
      type: members.length > 2 ? 'group' : 'direct',
      name,
      memberIds: members,
    });

    return ChatRepository.serializeConversation(conversation);
  }

  static listConversations(userId: string) {
    return ChatRepository.listForUser(userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((conversation) => ChatRepository.serializeConversation(conversation, userId));
  }

  static getConversation(conversationId: string, userId: string) {
    const conversation = ChatRepository.findById(conversationId);
    if (!conversation) {
      throw new AppError(404, 'CONVERSATION_NOT_FOUND', 'Conversation was not found.');
    }
    if (!ChatRepository.isMember(conversationId, userId)) {
      throw new AppError(403, 'CONVERSATION_FORBIDDEN', 'You are not a member of this conversation.');
    }
    return ChatRepository.serializeConversation(conversation, userId);
  }

  static getMessages(conversationId: string, userId: string) {
    const conversation = ChatRepository.findById(conversationId);
    if (!conversation) {
      throw new AppError(404, 'CONVERSATION_NOT_FOUND', 'Conversation was not found.');
    }
    if (!ChatRepository.isMember(conversationId, userId)) {
      throw new AppError(403, 'CONVERSATION_FORBIDDEN', 'You are not a member of this conversation.');
    }

    const messages = ChatRepository.listMessages(conversationId).map((message) => ChatRepository.serializeMessage(message));
    return { conversationId, messages };
  }

  static sendMessage(senderId: string, conversationId: string, content: string) {
    const conversation = ChatRepository.findById(conversationId);
    if (!conversation) {
      throw new AppError(404, 'CONVERSATION_NOT_FOUND', 'Conversation was not found.');
    }
    if (!ChatRepository.isMember(conversationId, senderId)) {
      throw new AppError(403, 'CONVERSATION_FORBIDDEN', 'You are not a member of this conversation.');
    }

    const trimmed = content.trim();
    if (!trimmed) {
      throw new AppError(400, 'INVALID_MESSAGE', 'Message content is required.');
    }

    const message: MessageRecord = ChatRepository.addMessage({
      id: `message-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
      conversationId,
      senderId,
      content: trimmed,
      createdAt: new Date(),
      readBy: [senderId],
    });

    return ChatRepository.serializeMessage(message);
  }

  static markMessageRead(userId: string, conversationId: string, messageId: string) {
    const conversation = ChatRepository.findById(conversationId);
    if (!conversation) {
      throw new AppError(404, 'CONVERSATION_NOT_FOUND', 'Conversation was not found.');
    }
    if (!ChatRepository.isMember(conversationId, userId)) {
      throw new AppError(403, 'CONVERSATION_FORBIDDEN', 'You are not a member of this conversation.');
    }

    const message = messages.find((entry) => entry.id === messageId && entry.conversationId === conversationId);
    if (!message) {
      throw new AppError(404, 'MESSAGE_NOT_FOUND', 'Message was not found.');
    }

    const updated = ChatRepository.markRead(messageId, userId);
    if (!updated) {
      throw new AppError(404, 'MESSAGE_NOT_FOUND', 'Message was not found.');
    }
    return ChatRepository.serializeMessage(updated);
  }
}

const { messages } = require('./chat.repository') as { messages: MessageRecord[] };
