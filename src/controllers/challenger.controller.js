import { BaseController } from '@/controllers/base.controller.js';

export class ChallengerController extends BaseController {
  constructor(request, baseUrl, challengeKey) {
    super(request, baseUrl, challengeKey);
  }

  async createSession() {
    return this.request.post(`${this.baseUrl}/challenger`);
  }

  async getChallenges() {
    return this.request.get(`${this.baseUrl}/challenges`, {
      headers: this.buildHeaders({
        Accept: 'application/json',
      }),
    });
  }

  async getProgress(challengeKey = this.challengeKey) {
    return this.request.get(`${this.baseUrl}/challenger/${challengeKey}`, {
      headers: this.buildHeaders({
        Accept: 'application/json',
      }),
    });
  }

  async restoreProgress(challengeKey, payload) {
    return this.request.put(`${this.baseUrl}/challenger/${challengeKey}`, {
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
      data: payload,
    });
  }

  async getDatabase(challengeKey = this.challengeKey) {
    return this.request.get(`${this.baseUrl}/challenger/database/${challengeKey}`, {
      headers: this.buildHeaders({
        Accept: 'application/json',
      }),
    });
  }

  async restoreDatabase(challengeKey, payload) {
    return this.request.put(`${this.baseUrl}/challenger/database/${challengeKey}`, {
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
      data: payload,
    });
  }
}
