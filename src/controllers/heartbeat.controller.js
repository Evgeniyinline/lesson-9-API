import { BaseController } from '@/controllers/base.controller.js';

export class HeartbeatController extends BaseController {
  async get(headers = {}) {
    return this.request.get(`${this.baseUrl}/heartbeat`, {
      headers: this.buildHeaders(headers),
    });
  }

  async send(method, headers = {}) {
    return this.request.fetch(`${this.baseUrl}/heartbeat`, {
      method,
      headers: this.buildHeaders(headers),
    });
  }

  async postWithOverride(overrideMethod, headers = {}) {
    return this.request.post(`${this.baseUrl}/heartbeat`, {
      headers: this.buildHeaders({
        'X-HTTP-Method-Override': overrideMethod,
        ...headers,
      }),
    });
  }
}
