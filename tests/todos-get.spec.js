import { test, expect } from '@/fixtures/challenger.fixture.js';
import { TodoBuilder } from '@/helpers/builders/todo.builder.js';
import https from 'node:https';

const API_BASE_URL = 'https://apichallenges.eviltester.com';

function expectTodoEntity(todo) {
  expect(todo.id).toBeTruthy();
  expect(typeof todo.id).toBe('number');
  expect(typeof todo.title).toBe('string');
  expect(typeof todo.doneStatus).toBe('boolean');
}

function sendRequestWithoutAcceptHeader(challengeKey) {
  return new Promise((resolve, reject) => {
    const request = https.request(`${API_BASE_URL}/todos`, {
      method: 'GET',
      headers: {
        'X-CHALLENGER': challengeKey,
      },
    }, (response) => {
      let responseBody = '';

      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        responseBody += chunk;
      });
      response.on('end', () => {
        resolve({
          status: response.statusCode,
          headers: response.headers,
          body: responseBody,
        });
      });
    });

    request.on('error', reject);
    request.end();
  });
}

test('GET /challenges returns challenge catalog', { tag: ['@get', '@challenger'] }, async ({ api }) => {
  const response = await api.challenger.getChallenges();
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(Array.isArray(body.challenges)).toBe(true);
  expect(body.challenges.length).toBeGreaterThanOrEqual(59);
  expect(body.challenges.some((challenge) => challenge.name === 'GET /challenges (200)')).toBe(true);
});

test('GET /todos returns todo list', { tag: ['@get', '@todos'] }, async ({ api }) => {
  const response = await api.todos.getAll();
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(Array.isArray(body.todos)).toBe(true);
  expect(body.todos.length).toBeGreaterThan(0);
  body.todos.forEach(expectTodoEntity);
});

test('GET /todo returns 404 for singular endpoint', { tag: ['@get', '@todos'] }, async ({ api }) => {
  const response = await api.todos.getSingular();

  expect(response.status()).toBe(404);
  expect(response.headers()['content-type']).toContain('application/json');
});

test('GET /todos/{id} returns created todo', { tag: ['@get', '@todos'] }, async ({ api }) => {
  const createdResponse = await api.todos.create(new TodoBuilder().build());
  const createdTodo = await createdResponse.json();

  const response = await api.todos.getOne(createdTodo.id);
  const body = await response.json();
  const [todo] = body.todos;

  expect(response.status()).toBe(200);
  expect(Array.isArray(body.todos)).toBe(true);
  expect(todo.id).toBe(createdTodo.id);
  expect(todo.title).toBe(createdTodo.title);
  expect(todo.doneStatus).toBe(createdTodo.doneStatus);
  expect(todo.description).toBe(createdTodo.description);
});

test('GET /todos/{id} returns 404 for unknown id', { tag: ['@get', '@todos'] }, async ({ api }) => {
  const response = await api.todos.getOne(65346);
  const body = await response.json();

  expect(response.status()).toBe(404);
  expect(body.errorMessages[0]).toContain('Could not find');
});

test('GET /todos filters completed todos', { tag: ['@get', '@todos'] }, async ({ api }) => {
  await api.todos.create(new TodoBuilder().withDoneStatus(true).build());
  await api.todos.create(new TodoBuilder().withDoneStatus(false).build());

  const response = await api.todos.getByDoneStatus(true);
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.todos.length).toBeGreaterThan(0);
  body.todos.forEach((todo) => expect(todo.doneStatus).toBe(true));
});

test('GET /todos filters active todos', { tag: ['@get', '@todos'] }, async ({ api }) => {
  await api.todos.create(new TodoBuilder().withDoneStatus(false).build());

  const response = await api.todos.getByDoneStatus(false);
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.todos.length).toBeGreaterThan(0);
  body.todos.forEach((todo) => expect(todo.doneStatus).toBe(false));
});

test('GET /todos doneStatus=true returns only done items', { tag: ['@get', '@todos'] }, async ({ api }) => {
  const response = await api.todos.getByDoneStatus(true);
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(Array.isArray(body.todos)).toBe(true);
  body.todos.forEach((todo) => expect(todo.doneStatus).toBe(true));
});

test('HEAD /todos returns collection metadata', { tag: ['@head', '@todos'] }, async ({ api }) => {
  const response = await api.todos.headAll();
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  expect(body).toBe('');
});

test('GET /todos returns XML when requested', { tag: ['@get', '@content'] }, async ({ api }) => {
  const response = await api.todos.getAll({ Accept: 'application/xml' });
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('application/xml');
  expect(body).toContain('<todos>');
});

test('GET /todos returns JSON when requested', { tag: ['@get', '@content'] }, async ({ api }) => {
  const response = await api.todos.getAll({ Accept: 'application/json' });
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('application/json');
  expect(Array.isArray(body.todos)).toBe(true);
});

test('GET /todos returns JSON for wildcard accept', { tag: ['@get', '@content'] }, async ({ api }) => {
  const response = await api.todos.getAll({ Accept: '*/*' });
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('application/json');
  expect(Array.isArray(body.todos)).toBe(true);
});

test('GET /todos keeps XML preference', { tag: ['@get', '@content'] }, async ({ api }) => {
  const response = await api.todos.getAll({ Accept: 'application/xml, application/json' });
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('application/xml');
  expect(body).toContain('<todos>');
});

test('GET /todos defaults to JSON without accept header', { tag: ['@get', '@content'] }, async ({ challengeKey }) => {
  const response = await sendRequestWithoutAcceptHeader(challengeKey);
  const body = JSON.parse(response.body);

  expect(response.status).toBe(200);
  expect(response.headers['content-type']).toContain('application/json');
  expect(Array.isArray(body.todos)).toBe(true);
});

test('GET /todos rejects unsupported accept header', { tag: ['@get', '@content'] }, async ({ api }) => {
  const response = await api.todos.getAll({ Accept: 'application/gzip' });
  const body = await response.json();

  expect(response.status()).toBe(406);
  expect(body.errorMessages[0]).toContain('Unrecognised Accept Type');
});
