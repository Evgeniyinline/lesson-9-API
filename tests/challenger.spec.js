import { test, expect } from '@/fixtures/challenger.fixture.js';
import { randomUUID } from 'node:crypto';

test('GET /challenger/{guid} returns current progress', { tag: ['@get', '@challenger'] }, async ({ api, challengeKey }) => {
  const response = await api.challenger.getProgress(challengeKey);
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('application/json');
  expect(body.xChallenger).toBe(challengeKey);
});

test('PUT /challenger/{guid} restores existing progress', { tag: ['@put', '@challenger'] }, async ({ api, challengeKey }) => {
  const getResponse = await api.challenger.getProgress(challengeKey);
  const payload = await getResponse.json();

  const putResponse = await api.challenger.restoreProgress(challengeKey, payload);
  const body = await putResponse.json();

  expect(getResponse.status()).toBe(200);
  expect(putResponse.status()).toBe(200);
  expect(body.xChallenger).toBe(challengeKey);
});

test('PUT /challenger/{guid} creates progress for new guid', { tag: ['@put', '@challenger'] }, async ({ api }) => {
  const getResponse = await api.challenger.getProgress();
  const payload = await getResponse.json();
  const newGuid = randomUUID();

  payload.xChallenger = newGuid;

  const putResponse = await api.challenger.restoreProgress(newGuid, payload);
  const responseText = await putResponse.text();

  expect(getResponse.status()).toBe(200);
  expect(putResponse.status()).toBe(201);
  expect(putResponse.headers()['x-challenger']).toBe(newGuid);
  expect(responseText).toBe('');

  api.challengeState.current = newGuid;
  api.setChallengeKey(newGuid);
});

test('GET /challenger/database/{guid} returns database snapshot', { tag: ['@get', '@challenger'] }, async ({ api, challengeKey }) => {
  const response = await api.challenger.getDatabase(challengeKey);
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('application/json');
  expect(Array.isArray(body.todos)).toBe(true);
});

test('PUT /challenger/database/{guid} restores database snapshot', { tag: ['@put', '@challenger'] }, async ({ api, challengeKey }) => {
  const getResponse = await api.challenger.getDatabase(challengeKey);
  const payload = await getResponse.json();

  const putResponse = await api.challenger.restoreDatabase(challengeKey, payload);

  expect(getResponse.status()).toBe(200);
  expect(Array.isArray(payload.todos)).toBe(true);
  expect(putResponse.status()).toBe(204);
});
