import { test as base, request as playwrightRequest } from '@playwright/test';
import { ApiFacade } from '@/facades/api.facade.js';

const API_BASE_URL = 'https://apichallenges.eviltester.com';

export const test = base.extend({
  challengeState: [async ({}, use) => {
    const apiContext = await playwrightRequest.newContext();

    try {
      const response = await apiContext.post(`${API_BASE_URL}/challenger`);
      const key = response.headers()['x-challenger'];

      if (!key) {
        throw new Error('Header x-challenger was not returned');
      }

      await use({ current: key });
    } finally {
      await apiContext.dispose();
    }
  }, { scope: 'worker' }],
  challengeKey: async ({ challengeState }, use) => {
    await use(challengeState.current);
  },
  api: async ({ request, challengeState }, use) => {
    const api = new ApiFacade(request, API_BASE_URL, challengeState.current);
    api.challengeState = challengeState;
    await use(api);
  },
});

export { expect } from '@playwright/test';
