import { BaseController } from '@/controllers/base.controller.js';

export class SecretController extends BaseController {
  async createToken(headers = {}) {
    return this.request.post(`${this.baseUrl}/secret/token`, {
      headers: this.buildHeaders({
        Authorization: 'Basic YWRtaW46cGFzc3dvcmQ=',
        ...headers,
      }),
    });
  }

  async createTokenWithoutAuth(headers = {}) {
    return this.request.post(`${this.baseUrl}/secret/token`, {
      headers: this.buildHeaders(headers),
    });
  }

  async createTokenWithInvalidAuth(headers = {}) {
    return this.request.post(`${this.baseUrl}/secret/token`, {
      headers: this.buildHeaders({
        Authorization: 'Basic d3Jvbmc6Y3JlZGVudGlhbHM=',
        ...headers,
      }),
    });
  }

  async getNoteWithAuthToken(authToken, headers = {}) {
    return this.request.get(`${this.baseUrl}/secret/note`, {
      headers: this.buildHeaders({
        'X-AUTH-TOKEN': authToken,
        ...headers,
      }),
    });
  }

  async createNoteWithAuthToken(note, authToken, headers = {}) {
    return this.request.post(`${this.baseUrl}/secret/note`, {
      headers: this.buildHeaders({
        'X-AUTH-TOKEN': authToken,
        'Content-Type': 'application/json',
        ...headers,
      }),
      data: { note },
    });
  }

  async getNoteWithBearer(authToken, headers = {}) {
    return this.request.get(`${this.baseUrl}/secret/note`, {
      headers: this.buildHeaders({
        Authorization: `Bearer ${authToken}`,
        ...headers,
      }),
    });
  }

  async createNoteWithBearer(note, authToken, headers = {}) {
    return this.request.post(`${this.baseUrl}/secret/note`, {
      headers: this.buildHeaders({
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        ...headers,
      }),
      data: { note },
    });
  }

  async getNote(headers = {}) {
    return this.request.get(`${this.baseUrl}/secret/note`, {
      headers: this.buildHeaders(headers),
    });
  }

  async createNote(note, headers = {}) {
    return this.request.post(`${this.baseUrl}/secret/note`, {
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        ...headers,
      }),
      data: { note },
    });
  }
}
