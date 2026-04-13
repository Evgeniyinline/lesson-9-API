import { faker } from "@faker-js/faker";

export class TodoBuilder {
  constructor() {
    this.data = {
      title: faker.lorem.sentence(3),
      doneStatus: false,
      description: faker.lorem.sentence(3),

    }
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

  build() {
    return { ...this.data };
  }
}

