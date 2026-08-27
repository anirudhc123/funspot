import { NextFunction, Request, Response } from 'express';

import { AuthService } from './auth.service';
import { validate } from '../../validators/zod';
import { successResponse } from '../../utils/apiResponse';
import { forgotPasswordSchema, loginSchema, refreshSchema, registerSchema, resetPasswordSchema } from './auth.validator';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = validate(registerSchema, req.body, 'register');
      const result = await AuthService.register(parsed);
      res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
      res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.status(201).json(successResponse({ user: result.user, tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken } }));
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = validate(loginSchema, req.body, 'login');
      const result = await AuthService.login(parsed);
      res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
      res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.status(200).json(successResponse({ user: result.user, tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken } }));
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken ?? req.body.refreshToken ?? req.get('x-refresh-token') ?? '';
      const result = AuthService.logout(token);
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const raw = validate(refreshSchema, req.body ?? req.cookies ?? {}, 'refresh');
      const refreshToken = raw.refreshToken ?? req.cookies?.refreshToken;
      const result = AuthService.refresh(refreshToken ?? '');
      res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
      res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.status(200).json(successResponse({ user: result.user, tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken } }));
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = validate(forgotPasswordSchema, req.body, 'forgot-password');
      const result = AuthService.forgotPassword(parsed.email);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = validate(resetPasswordSchema, req.body, 'reset-password');
      const result = AuthService.resetPassword(parsed.token, parsed.password);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}
