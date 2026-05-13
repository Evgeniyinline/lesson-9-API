import { test, expect } from '@/fixtures/challenger.fixture.js';

test('DELETE /heartbeat is not allowed', { tag: ['@delete', '@heartbeat'] }, async ({ api }) => {
  const response = await api.heartbeat.send('DELETE');

  expect(response.status()).toBe(405);
  expect(response.headers()['content-type']).toContain('application/json');
});

test('PATCH /heartbeat returns server error', { tag: ['@patch', '@heartbeat'] }, async ({ api }) => {
  const response = await api.heartbeat.send('PATCH');

  expect(response.status()).toBe(500);
  expect(response.headers()['content-type']).toContain('application/json');
});

test('TRACE /heartbeat is not implemented', { tag: ['@trace', '@heartbeat'] }, async ({ api }) => {
  const response = await api.heartbeat.send('TRACE');

  expect(response.status()).toBe(501);
  expect(response.headers()['content-type']).toContain('application/json');
});

test('GET /heartbeat returns no content', { tag: ['@get', '@heartbeat'] }, async ({ api }) => {
  const response = await api.heartbeat.get();
  const body = await response.text();

  expect(response.status()).toBe(204);
  expect(body).toBe('');
});

test('POST /heartbeat overrides to DELETE', { tag: ['@post', '@delete', '@heartbeat'] }, async ({ api }) => {
  const response = await api.heartbeat.postWithOverride('DELETE');

  expect(response.status()).toBe(405);
  expect(response.headers()['content-type']).toContain('application/json');
});

test('POST /heartbeat overrides to PATCH', { tag: ['@post', '@patch', '@heartbeat'] }, async ({ api }) => {
  const response = await api.heartbeat.postWithOverride('PATCH');

  expect(response.status()).toBe(500);
  expect(response.headers()['content-type']).toContain('application/json');
});

test('POST /heartbeat overrides to TRACE', { tag: ['@post', '@trace', '@heartbeat'] }, async ({ api }) => {
  const response = await api.heartbeat.postWithOverride('TRACE');

  expect(response.status()).toBe(501);
  expect(response.headers()['content-type']).toContain('application/json');
});
