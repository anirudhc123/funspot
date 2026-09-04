import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

import { ChatService } from '../modules/chat/chat.service';
import { env } from '../config/env';

export const registerChatSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const token = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : undefined;
    if (!token) {
      socket.disconnect();
      return;
    }

    let userId: string;
    try {
      const payload = jwt.verify(token.replace(/^Bearer\s+/i, ''), env.JWT_ACCESS_SECRET, {
        issuer: 'funspot',
        audience: 'funspot-api',
        algorithms: ['HS256'],
      });
      if (typeof payload === 'string' || typeof payload.sub !== 'string') throw new Error('Invalid socket token.');
      userId = payload.sub;
    } catch {
      socket.disconnect();
      return;
    }

    socket.data.userId = userId;
    socket.join(`user:${userId}`);
    io.emit('presence:update', { userId, online: true });

    socket.on('join:conversation', (conversationId: string) => {
      try {
        ChatService.getConversation(conversationId, userId);
        socket.join(`conversation:${conversationId}`);
      } catch {
        socket.emit('error', { code: 'CONVERSATION_FORBIDDEN', message: 'You cannot join this conversation.' });
      }
    });

    socket.on('message:send', (payload: { conversationId: string; content: string }) => {
      try {
        const message = ChatService.sendMessage(userId, payload.conversationId, payload.content);
        io.to(`conversation:${payload.conversationId}`).emit('message:new', message);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Message could not be sent.';
        socket.emit('error', { code: 'MESSAGE_SEND_FAILED', message });
      }
    });

    socket.on('message:read', (payload: { conversationId: string; messageId: string }) => {
      try {
        const updated = ChatService.markMessageRead(userId, payload.conversationId, payload.messageId);
        io.to(`conversation:${payload.conversationId}`).emit('message:read', {
          userId,
          conversationId: payload.conversationId,
          messageId: payload.messageId,
          message: updated,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Message could not be marked as read.';
        socket.emit('error', { code: 'MESSAGE_READ_FAILED', message });
      }
    });

    socket.on('typing:start', (payload: { conversationId: string }) => {
      try {
        ChatService.getConversation(payload.conversationId, userId);
      } catch {
        socket.emit('error', { code: 'CONVERSATION_FORBIDDEN', message: 'You cannot access this conversation.' });
        return;
      }
      socket.to(`conversation:${payload.conversationId}`).emit('typing:start', { userId, conversationId: payload.conversationId });
    });

    socket.on('typing:stop', (payload: { conversationId: string }) => {
      try {
        ChatService.getConversation(payload.conversationId, userId);
      } catch {
        socket.emit('error', { code: 'CONVERSATION_FORBIDDEN', message: 'You cannot access this conversation.' });
        return;
      }
      socket.to(`conversation:${payload.conversationId}`).emit('typing:stop', { userId, conversationId: payload.conversationId });
    });

    socket.on('presence:update', (payload: { online?: boolean }) => {
      const online = payload.online ?? true;
      io.emit('presence:update', { userId, online });
    });

    socket.on('disconnect', () => {
      io.emit('presence:update', { userId, online: false });
    });
  });
};
