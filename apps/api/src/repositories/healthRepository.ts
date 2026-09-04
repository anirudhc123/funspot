import { checkDatabaseHealth } from '../database/database';

export class HealthRepository {
  static async getStatus(): Promise<{ status: 'ok' }> {
    return { status: 'ok' };
  }

  static async checkDatabase(): Promise<{ status: 'ok' }> {
    await checkDatabaseHealth();
    return { status: 'ok' };
  }
}
