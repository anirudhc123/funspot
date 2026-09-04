declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        id: string;
        email: string;
        username: string;
        role: import('../modules/users/users.repository').UserRole;
      };
    }
  }
}

export {};
