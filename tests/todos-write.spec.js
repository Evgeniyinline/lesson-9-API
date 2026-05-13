import { test, expect } from '@/fixtures/challenger.fixture.js';
import { TodoBuilder } from '@/helpers/builders/todo.builder.js';

const MAX_TODOS = 20;

async function ensureTodoSlotAvailable(api) {
  const listResponse = await api.todos.getAll();
  const listBody = await listResponse.json();

  expect(listResponse.status()).toBe(200);

  if (listBody.todos.length < MAX_TODOS) {
    return;
  }

  const deleteResponse = await api.todos.deleteOne(listBody.todos[0].id);
  expect(deleteResponse.status()).toBe(200);
}

async function createTodo(api, builder = new TodoBuilder()) {
  await ensureTodoSlotAvailable(api);

  const response = await api.todos.create(builder.build());
  const body = await response.json();

  expect(response.status()).toBe(201);
  expect(body.id).toBeTruthy();

  return body;
}

async function createTodoRaw(api, requestOptions) {
  await ensureTodoSlotAvailable(api);

  return api.todos.createRaw(requestOptions);
}

test('POST /todos creates todo', { tag: ['@post', '@todos'] }, async ({ api }) => {
  const todo = new TodoBuilder().build();
  const response = await api.todos.create(todo);
  const body = await response.json();

  expect(response.status()).toBe(201);
  expect(body.title).toBe(todo.title);
  expect(body.doneStatus).toBe(todo.doneStatus);
  expect(body.description).toBe(todo.description);
});

test('POST /todos validates doneStatus type', { tag: ['@post', '@todos'] }, async ({ api }) => {
  const response = await api.todos.create(
    new TodoBuilder().withDoneStatus('123').build(),
  );
  const body = await response.json();

  expect(response.status()).toBe(400);
  expect(body.errorMessages[0]).toContain('doneStatus');
  expect(body.errorMessages[0]).toContain('BOOLEAN');
});

test('POST /todos validates title max length', { tag: ['@post', '@todos'] }, async ({ api }) => {
  const response = await api.todos.create(
    new TodoBuilder().withTitle('test summary'.repeat(100)).withDoneStatus(true).build(),
  );
  const body = await response.json();

  expect(response.status()).toBe(400);
  expect(body.errorMessages[0]).toContain('title');
  expect(body.errorMessages[0]).toContain('maximum allowed is 50');
});

test('POST /todos validates description max length', { tag: ['@post', '@todos'] }, async ({ api }) => {
  const response = await api.todos.create(
    new TodoBuilder().withDescription('my description'.repeat(100)).withDoneStatus(true).build(),
  );
  const body = await response.json();

  expect(response.status()).toBe(400);
  expect(body.errorMessages[0]).toContain('description');
  expect(body.errorMessages[0]).toContain('maximum allowed is 200');
});

test('POST /todos accepts max field lengths', { tag: ['@post', '@todos'] }, async ({ api }) => {
  const todo = new TodoBuilder()
    .withMaxLengthTitle()
    .withDoneStatus(true)
    .withMaxLengthDescription()
    .build();

  const response = await api.todos.create(todo);
  const body = await response.json();

  expect(response.status()).toBe(201);
  expect(body.title.length).toBe(50);
  expect(body.description.length).toBe(200);
});

test('POST /todos rejects oversized payload', { tag: ['@post', '@todos'] }, async ({ api }) => {
  const response = await api.todos.create(
    new TodoBuilder().withTitle('a'.repeat(5000)).withDoneStatus(true).withDescription('b').build(),
  );
  const body = await response.json();

  expect(response.status()).toBe(413);
  expect(body.errorMessages[0]).toContain('Request body too large');
});

test('POST /todos rejects unexpected field', { tag: ['@post', '@todos'] }, async ({ api }) => {
  const response = await api.todos.create(
    new TodoBuilder().withExtraField('priority', 1).build(),
  );
  const body = await response.json();

  expect(response.status()).toBe(400);
  expect(body.errorMessages[0]).toContain('priority');
  expect(body.errorMessages[0]).toContain('Could not find field');
});

test('PUT /todos/{id} returns 400 for unknown id', { tag: ['@put', '@todos'] }, async ({ api }) => {
  const response = await api.todos.replace(99999, new TodoBuilder().build());
  const body = await response.json();

  expect(response.status()).toBe(400);
  expect(Array.isArray(body.errorMessages)).toBe(true);
});

test('POST /todos/{id} updates existing todo', { tag: ['@post', '@todos'] }, async ({ api }) => {
  const createdTodo = await createTodo(api);
  const updatedTodo = new TodoBuilder()
    .withTitle('updated title')
    .withDoneStatus(true)
    .withDescription('updated description')
    .build();

  const response = await api.todos.updateViaPost(createdTodo.id, updatedTodo);
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.id).toBe(createdTodo.id);
  expect(body.title).toBe(updatedTodo.title);
  expect(body.doneStatus).toBe(updatedTodo.doneStatus);
  expect(body.description).toBe(updatedTodo.description);
});

test('POST /todos/{id} returns 404 for unknown id', { tag: ['@post', '@todos'] }, async ({ api }) => {
  const response = await api.todos.updateViaPost(100, new TodoBuilder().build());
  const body = await response.json();

  expect(response.status()).toBe(404);
  expect(body.errorMessages[0]).toContain('id == 100');
});

test('PUT /todos/{id} replaces todo', { tag: ['@put', '@todos'] }, async ({ api }) => {
  const createdTodo = await createTodo(api);
  const updatedTodo = new TodoBuilder()
    .withTitle('updated title')
    .withDoneStatus(true)
    .withDescription('updated description')
    .build();

  const response = await api.todos.replace(createdTodo.id, updatedTodo);
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.id).toBe(createdTodo.id);
  expect(body.title).toBe(updatedTodo.title);
  expect(body.doneStatus).toBe(true);
  expect(body.description).toBe(updatedTodo.description);
});

test('PUT /todos/{id} allows partial replacement payload', { tag: ['@put', '@todos'] }, async ({ api }) => {
  const createdTodo = await createTodo(api);
  const response = await api.todos.replace(createdTodo.id, {
    title: 'updated title',
  });
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.id).toBe(createdTodo.id);
  expect(body.title).toBe('updated title');
  expect(body.doneStatus).toBe(createdTodo.doneStatus);
  expect(body.description).toBe('');
});

test('PUT /todos/{id} rejects empty title', { tag: ['@put', '@todos'] }, async ({ api }) => {
  const createdTodo = await createTodo(api);
  const { title, ...payloadWithoutTitle } = createdTodo;
  const response = await api.todos.replace(createdTodo.id, {
    ...payloadWithoutTitle,
  });
  const body = await response.json();

  expect(response.status()).toBe(400);
  expect(body.errorMessages[0]).toContain('title');
});

test('PUT /todos/{id} rejects changing entity id', { tag: ['@put', '@todos'] }, async ({ api }) => {
  const createdTodo = await createTodo(api);
  const response = await api.todos.replace(createdTodo.id, {
    ...createdTodo,
    id: createdTodo.id + 1,
    title: 'updated title',
  });
  const body = await response.json();

  expect(response.status()).toBe(400);
  expect(body.errorMessages[0]).toContain('id');
});

test('DELETE /todos/{id} removes todo', { tag: ['@delete', '@todos'] }, async ({ api }) => {
  const createdTodo = await createTodo(api);
  const deleteResponse = await api.todos.deleteOne(createdTodo.id);
  const getResponse = await api.todos.getOne(createdTodo.id);
  const getBody = await getResponse.json();

  expect(deleteResponse.status()).toBe(200);
  expect(getResponse.status()).toBe(404);
  expect(getBody.errorMessages[0]).toContain('Could not find');
});

test('OPTIONS /todos exposes supported methods', { tag: ['@options', '@todos'] }, async ({ api }) => {
  const response = await api.todos.optionsAll();
  const allowHeader = response.headers().allow;

  expect(response.status()).toBe(200);
  expect(allowHeader).toContain('OPTIONS');
  expect(allowHeader).toContain('GET');
  expect(allowHeader).toContain('HEAD');
  expect(allowHeader).toContain('POST');
});

test('POST /todos creates XML response from XML request', { tag: ['@post', '@content'] }, async ({ api }) => {
  const response = await createTodoRaw(api, {
    headers: {
      'Content-Type': 'application/xml',
      Accept: 'application/xml',
    },
    data: '<todo><doneStatus>false</doneStatus><title>test</title></todo>',
  });
  const body = await response.text();

  expect(response.status()).toBe(201);
  expect(response.headers()['content-type']).toContain('application/xml');
  expect(body).toContain('<title>test</title>');
});

test('POST /todos creates JSON response from JSON request', { tag: ['@post', '@content'] }, async ({ api }) => {
  const response = await createTodoRaw(api, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    data: {
      title: 'test',
      doneStatus: false,
      description: 'test description',
    },
  });
  const body = await response.json();

  expect(response.status()).toBe(201);
  expect(response.headers()['content-type']).toContain('application/json');
  expect(body.title).toBe('test');
});

test('POST /todos rejects unsupported content type', { tag: ['@post', '@content'] }, async ({ api }) => {
  const response = await api.todos.createRaw({
    headers: {
      'Content-Type': 'bob',
      Accept: '*/*',
    },
    data: {
      title: 'test',
      doneStatus: false,
      description: '',
    },
  });

  expect(response.status()).toBe(415);
  expect(response.headers()['content-type']).toContain('application/json');
});

test('POST /todos converts XML request to JSON response', { tag: ['@post', '@content'] }, async ({ api }) => {
  const response = await createTodoRaw(api, {
    headers: {
      'Content-Type': 'application/xml',
      Accept: 'application/json',
    },
    data: '<todo><doneStatus>false</doneStatus><title>test</title></todo>',
  });
  const body = await response.json();

  expect(response.status()).toBe(201);
  expect(response.headers()['content-type']).toContain('application/json');
  expect(body.title).toBe('test');
});

test('POST /todos converts JSON request to XML response', { tag: ['@post', '@content'] }, async ({ api }) => {
  const response = await createTodoRaw(api, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/xml',
    },
    data: {
      title: 'test',
      doneStatus: true,
      description: '',
    },
  });
  const body = await response.text();

  expect(response.status()).toBe(201);
  expect(response.headers()['content-type']).toContain('application/xml');
  expect(response.headers().location).toContain('todos/');
  expect(body).toContain('<doneStatus>true</doneStatus>');
  expect(body).toContain('<title>test</title>');
});

test('DELETE /todos/{id} removes all todos', { tag: ['@delete', '@todos'] }, async ({ api }) => {
  const listResponse = await api.todos.getAll();
  const listBody = await listResponse.json();

  for (const todo of listBody.todos) {
    const deleteResponse = await api.todos.deleteOne(todo.id);
    expect(deleteResponse.status()).toBe(200);
  }

  const finalResponse = await api.todos.getAll();
  const finalBody = await finalResponse.json();

  expect(finalResponse.status()).toBe(200);
  expect(finalBody.todos.length).toBe(0);
});

test('POST /todos creates up to limit after cleanup', { tag: ['@post', '@delete', '@todos'] }, async ({ api, challengeKey }) => {
  const currentTodosResponse = await api.todos.getAll();
  const currentTodosBody = await currentTodosResponse.json();

  for (const todo of currentTodosBody.todos) {
    const deleteResponse = await api.todos.deleteOne(todo.id);
    expect(deleteResponse.status()).toBe(200);
  }

  let createdTodosCount = 0;

  for (let index = 1; index <= 50; index += 1) {
    const response = await api.todos.create({
      title: `todo ${index}`,
      doneStatus: false,
      description: '',
    });

    if (response.status() !== 201) {
      expect(response.status()).toBe(400);
      break;
    }

    createdTodosCount += 1;
  }

  const finalResponse = await api.todos.getAll();
  const finalBody = await finalResponse.json();

  expect(finalResponse.status()).toBe(200);
  expect(createdTodosCount).toBeGreaterThan(0);
  expect(finalBody.todos.length).toBe(createdTodosCount);

  console.log(`Challenge URL: https://apichallenges.eviltester.com/gui/challenges/${challengeKey}`);
});
