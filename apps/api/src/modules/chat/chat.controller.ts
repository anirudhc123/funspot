import { NextFunction, Request, Response } from 'express';

import { successResponse } from '../../utils/apiResponse';
import { validate } from '../../validators/zod';
import { ChatService } from './chat.service';
import { createConversationSchema, sendMessageSchema } from './chat.validator';

export class ChatController {
  static async listConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id ?? 'u-1';
      const conversations = ChatService.listConversations(userId);
      res.status(200).json(successResponse(conversations));
    } catch (error) {
      next(error);
    }
  }

  static async createConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id ?? 'u-1';
      const parsed = validate(createConversationSchema, req.body, 'conversation');
      const conversation = ChatService.createConversation(actorId, parsed.participants, parsed.name);
      res.status(201).json(successResponse(conversation));
    } catch (error) {
      next(error);
    }
  }

  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id ?? 'u-1';
      const conversationId = req.params.id;
      const messages = ChatService.getMessages(conversationId, userId);
      res.status(200).json(successResponse(messages));
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id ?? 'u-1';
      const conversationId = req.params.id;
      const parsed = validate(sendMessageSchema, req.body, 'message');
      const message = ChatService.sendMessage(userId, conversationId, parsed.content);
      res.status(201).json(successResponse(message));
    } catch (error) {
      next(error);
    }
  }
}
