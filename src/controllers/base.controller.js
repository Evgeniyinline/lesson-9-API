export class BaseController {
  constructor(request, baseUrl, challengeKey) {
    this.request = request;
    this.baseUrl = baseUrl;
    this.challengeKey = challengeKey;
  }

  setChallengeKey(challengeKey) {
    this.challengeKey = challengeKey;
  }

  buildHeaders(extraHeaders = {}) {
    return {
      'X-CHALLENGER': this.challengeKey,
      ...extraHeaders,
    };
  }
}
