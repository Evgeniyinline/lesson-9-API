import { BaseController } from '@/controllers/base.controller.js';

export class TodosController extends BaseController {
  async getAll(headers = {}) {
    return this.request.get(`${this.baseUrl}/todos`, {
      headers: this.buildHeaders(headers),
    });
  }

  async getOne(id, headers = {}) {
    return this.request.get(`${this.baseUrl}/todos/${id}`, {
      headers: this.buildHeaders(headers),
    });
  }

  async getByDoneStatus(doneStatus, headers = {}) {
    return this.request.get(`${this.baseUrl}/todos?doneStatus=${doneStatus}`, {
      headers: this.buildHeaders(headers),
    });
  }

  async getSingular(headers = {}) {
    return this.request.get(`${this.baseUrl}/todo`, {
      headers: this.buildHeaders(headers),
    });
  }

  async headAll(headers = {}) {
    return this.request.head(`${this.baseUrl}/todos`, {
      headers: this.buildHeaders(headers),
    });
  }

  async optionsAll(headers = {}) {
    return this.request.fetch(`${this.baseUrl}/todos`, {
      method: 'OPTIONS',
      headers: this.buildHeaders(headers),
    });
  }

  async create(payload, headers = {}) {
    return this.request.post(`${this.baseUrl}/todos`, {
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        ...headers,
      }),
      data: payload,
    });
  }

  async createRaw({ data, headers = {}, method = 'POST' }) {
    return this.request.fetch(`${this.baseUrl}/todos`, {
      method,
      headers: this.buildHeaders(headers),
      data,
    });
  }

  async replace(id, payload, headers = {}) {
    return this.request.put(`${this.baseUrl}/todos/${id}`, {
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        ...headers,
      }),
      data: payload,
    });
  }

  async merge(id, payload, headers = {}) {
    return this.request.patch(`${this.baseUrl}/todos/${id}`, {
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        ...headers,
      }),
      data: payload,
    });
  }

  async updateViaPost(id, payload, headers = {}) {
    return this.request.post(`${this.baseUrl}/todos/${id}`, {
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        ...headers,
      }),
      data: payload,
    });
  }

  async deleteOne(id, headers = {}) {
    return this.request.delete(`${this.baseUrl}/todos/${id}`, {
      headers: this.buildHeaders(headers),
    });
  }
}
