import { HealthRepository } from '../repositories/healthRepository';

export class HealthService {
  static async getHealthStatus(): Promise<{ status: 'ok' }> {
    return HealthRepository.getStatus();
  }

  static async getDatabaseHealth(): Promise<{ status: 'ok' }> {
    return HealthRepository.checkDatabase();
  }
}
