import { test, expect } from '@/fixtures/challenger.fixture.js';

async function createAuthToken(api) {
  const response = await api.secret.createToken({ Accept: '*/*' });

  expect(response.status()).toBe(201);

  return response.headers()['x-auth-token'];
}

test('POST /secret/token rejects invalid credentials', { tag: ['@post', '@secret'] }, async ({ api }) => {
  const response = await api.secret.createTokenWithInvalidAuth();

  expect(response.status()).toBe(401);
  expect(response.headers()['www-authenticate']).toContain('Basic');
});

test('POST /secret/token returns auth token', { tag: ['@post', '@secret'] }, async ({ api }) => {
  const response = await api.secret.createToken({ Accept: '*/*' });
  const authToken = response.headers()['x-auth-token'];

  expect(response.status()).toBe(201);
  expect(authToken).toBeTruthy();
});

test('GET /secret/note rejects invalid auth token', { tag: ['@get', '@secret'] }, async ({ api }) => {
  const response = await api.secret.getNote({ 'X-AUTH-TOKEN': 'invalid-token' });

  expect(response.status()).toBe(403);
  expect(response.headers()['content-type']).toContain('application/json');
});

test('GET /secret/note rejects missing auth token', { tag: ['@get', '@secret'] }, async ({ api }) => {
  const response = await api.secret.getNote();

  expect(response.status()).toBe(401);
  expect(response.headers()['content-type']).toContain('application/json');
});

test('GET /secret/note returns secret note', { tag: ['@get', '@secret'] }, async ({ api }) => {
  const authToken = await createAuthToken(api);
  const response = await api.secret.getNoteWithAuthToken(authToken);
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(body).toBeTruthy();
});

test('POST /secret/note stores note', { tag: ['@post', '@secret'] }, async ({ api }) => {
  const authToken = await createAuthToken(api);
  const response = await api.secret.createNoteWithAuthToken('my note', authToken);
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.note).toBe('my note');
});

test('POST /secret/note rejects missing auth token', { tag: ['@post', '@secret'] }, async ({ api }) => {
  const response = await api.secret.createNote('my note');

  expect(response.status()).toBe(401);
  expect(response.headers()['content-type']).toContain('application/json');
});

test('POST /secret/note rejects invalid auth token', { tag: ['@post', '@secret'] }, async ({ api }) => {
  const response = await api.secret.createNote('my note', {
    'X-AUTH-TOKEN': 'invalid-token',
  });

  expect(response.status()).toBe(403);
  expect(response.headers()['content-type']).toContain('application/json');
});

test('GET /secret/note supports bearer auth', { tag: ['@get', '@secret'] }, async ({ api }) => {
  const authToken = await createAuthToken(api);
  const response = await api.secret.getNoteWithBearer(authToken);
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(body).toBeTruthy();
});

test('POST /secret/note supports bearer auth', { tag: ['@post', '@secret'] }, async ({ api }) => {
  const authToken = await createAuthToken(api);
  const response = await api.secret.createNoteWithBearer('my note', authToken);
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.note).toBe('my note');
});
