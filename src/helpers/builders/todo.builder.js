import { faker } from "@faker-js/faker";

export class TodoBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.data = {
      title: faker.lorem.words(3),
      doneStatus: false,
      description: faker.lorem.sentence(3),
    };

    return this;
  }

  withTitle(title) {
    this.data.title = title;
    return this;
  }

  withDoneStatus(doneStatus) {
    this.data.doneStatus = doneStatus;
    return this;
  }

  withDescription(description) {
    this.data.description = description;
    return this;
  }

  withExtraField(key, value) {
    this.data[key] = value;
    return this;
  }

  from(todo) {
    this.data = { ...todo };
    return this;
  }

  withEmptyTitle() {
    this.data.title = '';
    return this;
  }

  withMaxLengthTitle() {
    this.data.title = 'a'.repeat(50);
    return this;
  }

  withMaxLengthDescription() {
    this.data.description = 'b'.repeat(200);
    return this;
  }

  build() {
    return { ...this.data };
  }
}
