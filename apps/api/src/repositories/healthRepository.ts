export class HealthRepository {
  static async getStatus(): Promise<{ status: 'ok' }> {
    return { status: 'ok' };
  }
}
