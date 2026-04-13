import { test as base, request as playwrightRequest } from '@playwright/test';

const urlApi = 'https://apichallenges.eviltester.com';

export const test = base.extend({
  challengeKey: [async ({}, use) => {
    const apiContext = await playwrightRequest.newContext();

    try {
      const response = await apiContext.post(`${urlApi}/challenger`);
      const key = response.headers()['x-challenger'];

      if (!key) {
        throw new Error('Header x-challenger was not returned');
      }

      await use(key);
    } finally {
      await apiContext.dispose();
    }
  }, { scope: 'worker' }],
});

export { expect } from '@playwright/test';