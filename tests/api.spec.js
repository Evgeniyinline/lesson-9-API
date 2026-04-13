import { test, expect } from '@/fixtures/challenger.fixture.js';
import { TodoBuilder } from '@/helpers/builders/todo.builder.js';
import { faker } from '@faker-js/faker';

const urlApi = 'https://apichallenges.eviltester.com';

// test('01- POST /challenger (201)', async ({ request }) => {
//   // получить ключ авторизации
//   let response = await request.post(`${urlApi}/challenger`);
//   // конвертировать хедер в json
//   const headers = response.headers();

//   // вытащить токен из хедера
//   const key = headers['x-challenger'];
//   const link = `${urlApi}${headers.location}`;

//   console.log(link);
//   console.log(key);
//   expect(headers['x-challenger'].length).toEqual(36);

// });

test('02-GET /challenges (200)', async ({request, challengeKey}) => {

    let response = await request.get(`${urlApi}/challenges`, {
    headers: {
      'X-CHALLENGER': challengeKey
    }
  });
  let r = await response.json();
  expect(r.challenges.length).toEqual(59);

  response = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': challengeKey
    },
    // унести в билдер
    data: {
        "title":'test summary',
        "doneStatus":false,
        "description":"my description",
      
    }

  });
  r = await response.json();
  expect(r.title).toEqual('test summary');
  expect(r.doneStatus).toEqual(false);
  expect(r.description).toEqual('my description');
  expect(r.id).toBeTruthy();
})

test('03-GET /todos (200)', async ({ request, challengeKey }) => {

  let response = await request.get(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': challengeKey
    }
  });

  const data = await response.json();
  
  // проверка статуса ответа
  expect(response.status()).toBe(200);

  // проверка структуры ответа
  expect(data).toHaveProperty('todos');

  // проверка что массив не пустой
  expect(data.todos.length).toBeGreaterThan(0);

  // проверка каждого элемента массива
  data.todos.forEach(todo => {
    expect(todo).toHaveProperty('id');
    expect(todo).toHaveProperty('title');
    expect(typeof todo.id).toBe('number');
  
  });

});

test('04-GET /todo (404) not plural', async ({request, challengeKey}) => {

  let response = await request.get(`${urlApi}/todo`, {
    headers: {
      'X-CHALLENGER': challengeKey
    }
  });
  expect(response.status()).toBe(404);
});

test('05-GET /todos/{id} (200)', async ({request, challengeKey}) => {

  let response = await request.get(`${urlApi}/todos/1`, {
    headers: {
      'X-CHALLENGER': challengeKey
    }
  });
  expect(response.status()).toBe(200);
})

test('06-GET /todos/{id} (404)', async ({request, challengeKey}) => {

  let response = await request.get(`${urlApi}/todos/65346`, {
    headers: {
      'X-CHALLENGER': challengeKey
    }
  });
  expect(response.status()).toBe(404);
})

// TODO - не проходит из-за жесткой последовательности, создание TODO позже фильтрации, гипотеза причина в этом
test('07-GET /todos (200) ?filter=doneStatus', async ({request, challengeKey}) => {

  let response = await request.get(`${urlApi}/todos?doneStatus=false`, {
    headers: {
      'X-CHALLENGER': challengeKey
    }
  });

  console.log(await response.json());
  expect(response.status()).toBe(200);
  console.log(urlApi+'/gui/challenges/'+challengeKey)
  // TODO бизнес логика проверки структуры ответа
})

test('08-HEAD /todos (200)', async ({request, challengeKey}) => {

  let response = await request.head(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': challengeKey
    }
  });
  expect(response.status()).toBe(200);
  // TODO бизнес логика проверки заголовков ответа
})

test('09-POST /todos (201)', async ({ request, challengeKey }) => {

  const todo = new TodoBuilder()
    .build();

  let response = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': challengeKey
    },
    data: todo
  });

  const data = await response.json();
  console.log(data);

  // проверка статуса ответа
  expect(response.status()).toBe(201);

  // проверка структуры ответа
  expect(data.title).toEqual(todo.title);
  expect(data.doneStatus).toEqual(todo.doneStatus);
  expect(data.description).toEqual(todo.description);
});

test('10-POST /todos (400) doneStatus', async ({ request, challengeKey }) => {

  const invalidTodo = new TodoBuilder()
    .withTitle('test summary')
    .withDoneStatus('123')
    .withDescription('my description')
    .build();

  let response = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': challengeKey
    },
    data: invalidTodo
  });

  const data = await response.json();
  console.log(data);

  // проверка статуса ответа
  expect(response.status()).toBe(400);

  // проверка структуры ответа
  expect(data).toHaveProperty('errorMessages');

  // проверка сообщения ошибки
  expect(data.errorMessages[0]).toContain('doneStatus');
  expect(data.errorMessages[0]).toContain('BOOLEAN');
  
});

test('11-POST /todos (400) title too long', async ({ request, challengeKey }) => {

  const invalidTodo = new TodoBuilder()
    .withTitle('test summary'.repeat(100))
    .withDoneStatus(true)
    .withDescription()
    .build();

  let response = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': challengeKey
    },
    data: invalidTodo
  });

  const data = await response.json();
  console.log(data);

  // проверка статуса ответа
  expect(response.status()).toBe(400);

  // проверка структуры ответа
  expect(data).toHaveProperty('errorMessages');

  // проверка сообщения ошибки
  expect(data.errorMessages[0]).toContain('title');
  expect(data.errorMessages[0]).toContain('Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50');

})

test('12-POST /todos (400) description too long', async ({ request, challengeKey }) => {

  const invalidTodo = new TodoBuilder()
    .withTitle()
    .withDoneStatus(true)
    .withDescription('my description'.repeat(100))
    .build();

  let response = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': challengeKey
    },
    data: invalidTodo
  });
  console.log(invalidTodo);
  const data = await response.json();


  // проверка статуса ответа
  expect(response.status()).toBe(400);

  // проверка структуры ответа
  expect(data).toHaveProperty('errorMessages');

  // проверка сообщения ошибки
  expect(data.errorMessages[0]).toContain('description');
  expect(data.errorMessages[0]).toContain('Failed Validation: Maximum allowable length exceeded for description - maximum allowed is 200');
});

test('13-POST /todos (201) max out content', async ({ request, challengeKey }) => {

  const todo = new TodoBuilder()
    .withTitle('a'.repeat(50))
    .withDoneStatus(true)
    .withDescription('b'.repeat(200))
    .build();

  let response = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': challengeKey
    },
    data: todo
  });

  const data = await response.json();

  // проверка статуса ответа
  expect(response.status()).toBe(201);

  // проверка структуры ответа
  expect(data.title.length).toBe(50);
  expect(data.description.length).toBe(200);
})

test('14-POST /todos (413) content too long', async ({ request, challengeKey }) => {

  const invalidTodo = new TodoBuilder()
    .withTitle('a'.repeat(5000))
    .withDoneStatus(true)
    .withDescription('b')
    .build();

  let response = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': challengeKey
    },
    data: invalidTodo
  });

  const data = await response.json();
  console.log(data);

  // проверка статуса ответа
  expect(response.status()).toBe(413);

  // проверка структуры ответа
  expect(data).toHaveProperty('errorMessages');

  // проверка сообщения ошибки
  expect(data.errorMessages[0]).toContain('Error: Request body too large, max allowed is 5000 bytes');
})

test('15-POST /todos (400) extra', async ({ request, challengeKey }) => {
  // создать токен

  const invalid = new TodoBuilder()
    .withExtraField('priority', 1)
    .build();

  let response = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': challengeKey
    },
    data: invalid
  });
  console.log(invalid);
  const data = await response.json();
  console.log(data);

  // проверка статуса ответа
  expect(response.status()).toBe(400);

  // проверка структуры ответа
  expect(data).toHaveProperty('errorMessages');

  // проверка сообщения ошибки
  expect(data.errorMessages[0]).toContain('priority');
  expect(data.errorMessages[0]).toContain('Could not find field: priority');
});

test('16-PUT /todos/{id} (400)', async ({ request, challengeKey }) => {

  const invalidId = 99999;
  const invalid = new TodoBuilder().build();

  let response = await request.put(`${urlApi}/todos/${invalidId}`, {
    headers: {
      'X-CHALLENGER': challengeKey
    },
    data: invalid
  });
  console.log(invalid);
  const data = await response.json();
  console.log(data);

  // проверка статуса ответа
  expect(response.status()).toBe(400);

  // проверка структуры ответа
  expect(data).toHaveProperty('errorMessages');

})

test('17-POST /todos/{id} (200)', async ({ request, challengeKey }) => {
  // создать токен
  const token = await request.post(`${urlApi}/challenger`);
  const key = token.headers()['x-challenger'];

  const createResponse = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': key,
    },
    data: new TodoBuilder().build(),
  });

  const createdTodo = await createResponse.json();
  const todoId = createdTodo.id;

  const updatedTodo = new TodoBuilder()
    .withTitle('updated title')
    .withDoneStatus(true)
    .withDescription('updated description')
    .build();

  const response = await request.post(`${urlApi}/todos/${todoId}`, {
    headers: {
      'X-CHALLENGER': key,
    },
    data: updatedTodo,
  });

  const data = await response.json();

  expect(response.status()).toBe(200);
  expect(data.id).toBe(todoId);
  expect(data.title).toBe(updatedTodo.title);
  expect(data.doneStatus).toBe(updatedTodo.doneStatus);
  expect(data.description).toBe(updatedTodo.description);
});

test('18-POST /todos/{id} (404)', async ({ request, challengeKey }) => {
  // создать токен

  const invalidId = 100;
  const invalidTodo = new TodoBuilder().build();

  let response = await request.post(`${urlApi}/todos/${invalidId}`, {
    headers: {
      'X-CHALLENGER': challengeKey
    },
    data: invalidTodo
  });
  console.log(invalidTodo);
  const data = await response.json();
  console.log(data);

  // проверка статуса ответа
  expect(response.status()).toBe(404);

  // проверка структуры ответа
  expect(data).toHaveProperty('errorMessages');

  // проверка сообщения ошибки
  expect(data.errorMessages[0]).toContain('No such todo entity instance with id == 100 found');
})

test('19-PUT /todos/{id} full (200)', async ({ request, challengeKey }) => {
  // создать токен

  const createResponse = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': challengeKey,
    },
    data: new TodoBuilder().build(),
  });

  const createdTodo = await createResponse.json();
  const todoId = createdTodo.id;

  const updatedTodo = new TodoBuilder()
    .withTitle('updated title')
    .withDoneStatus(true)
    .withDescription('updated description')
    .build();

  const response = await request.put(`${urlApi}/todos/${todoId}`, {
    headers: {
      'X-CHALLENGER': challengeKey,
    },
    data: updatedTodo,
  });

  const data = await response.json();

  expect(response.status()).toBe(200);
  expect(data.id).toBe(todoId);
  expect(data.title).toBe(updatedTodo.title);
  expect(data.doneStatus).toBe(updatedTodo.doneStatus);
  expect(data.description).toBe(updatedTodo.description);
});

test('20-PUT /todos/{id} partial (200)', async ({ request, challengeKey }) => {

  const createResponse = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': challengeKey,
    },
    data: new TodoBuilder().build(),
  });

  const createdTodo = await createResponse.json();
  const todoId = createdTodo.id;

  const updatedTodo = {
    ...createdTodo,
    title: 'updated title',
  };

  const response = await request.put(`${urlApi}/todos/${todoId}`, {
    headers: {
      'X-CHALLENGER': challengeKey,
    },
    data: updatedTodo,
  });

  const data = await response.json();

  expect(response.status()).toBe(200);
  expect(data.id).toBe(todoId);
  expect(data.title).toBe(updatedTodo.title);
  expect(data.doneStatus).toBe(createdTodo.doneStatus);
  expect(data.description).toBe(createdTodo.description);

});

test('21-PUT /todos/{id} no title (400)', async ({ request, challengeKey }) => {
  // создать токен
  const token = await request.post(`${urlApi}/challenger`);
  const key = token.headers()['x-challenger'];

  const createResponse = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': key,
    },
    data: new TodoBuilder().build(),
  });

  const createdTodo = await createResponse.json();
  const todoId = createdTodo.id;

  const updatedTodo = {
    ...createdTodo,
    title: '',
  };

  const response = await request.put(`${urlApi}/todos/${todoId}`, {
    headers: {
      'X-CHALLENGER': key,
    },
    data: updatedTodo,
  });

  const data = await response.json();

  expect(response.status()).toBe(400);
  expect(data).toHaveProperty('errorMessages');
})

test('22-PUT /todos/{id} no amend id (400)', async ({ request, challengeKey }) => {
  
  const tokenResponse = await request.post(`${urlApi}/challenger`);
  const key = tokenResponse.headers()['x-challenger'];

  const createResponse = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': key,
    },
    data: new TodoBuilder().build(),
  });

  const createdTodo = await createResponse.json();
  const id = createdTodo.id;

  const invalidTodo = {
    ...createdTodo,
    id: id + 1, 
    title: 'updated title',
  };

  const response = await request.put(`${urlApi}/todos/${id}`, {
    headers: {
      'X-CHALLENGER': key,
    },
    data: invalidTodo,
  });

  const data = await response.json();
  console.log(data)

  expect(response.status()).toBe(400);

  expect(data).toHaveProperty('errorMessages');
  expect(data.errorMessages[0]).toContain('id');
})

test('23-DELETE /todos/{id} (200)', async ({ request, challengeKey }) => {

  const createResponse = await request.post(`${urlApi}/todos`, {
    headers: {
      'X-CHALLENGER': challengeKey,
    },
    data: new TodoBuilder().build(),
  });

  const createdTodo = await createResponse.json();
  const id = createdTodo.id;

  const response = await request.delete(`${urlApi}/todos/${id}`, {
    headers: {
      'X-CHALLENGER': challengeKey,
    },
  });

  expect(response.status()).toBe(200);


  const getTodo = await request.get(`${urlApi}/todos/${id}`, {
    headers: {
      'X-CHALLENGER': challengeKey,
    },
  });
  console.log(id)

  const todoData = await getTodo.json();

  expect(getTodo.status()).toBe(404);
  expect(todoData).toHaveProperty('errorMessages');
  expect(todoData.errorMessages[0]).toContain('Could not find');

  console.log(urlApi+'/gui/challenges/'+challengeKey)
})