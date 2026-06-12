import { faker } from '@faker-js/faker';
import type { NewUser } from '../api/schemas/user.schema';
import { uniqueEmail } from './uniqueEmail';

export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    firstName,
    lastName,
    email: uniqueEmail(firstName, lastName),
    password: `Pw!${faker.internet.password({ length: 10 })}`,
    ...overrides,
  };
}
