import { ChallengerController } from '@/controllers/challenger.controller.js';
import { HeartbeatController } from '@/controllers/heartbeat.controller.js';
import { SecretController } from '@/controllers/secret.controller.js';
import { TodosController } from '@/controllers/todos.controller.js';

export class ApiFacade {
  constructor(request, baseUrl, challengeKey) {
    this.challengeKey = challengeKey;
    this.challenger = new ChallengerController(request, baseUrl, challengeKey);
    this.todos = new TodosController(request, baseUrl, challengeKey);
    this.heartbeat = new HeartbeatController(request, baseUrl, challengeKey);
    this.secret = new SecretController(request, baseUrl, challengeKey);
  }

  setChallengeKey(challengeKey) {
    this.challengeKey = challengeKey;
    this.challenger.setChallengeKey(challengeKey);
    this.todos.setChallengeKey(challengeKey);
    this.heartbeat.setChallengeKey(challengeKey);
    this.secret.setChallengeKey(challengeKey);
  }
}
