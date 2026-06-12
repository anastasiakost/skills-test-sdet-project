import { faker } from '@faker-js/faker';
import type { NewContact } from '../api/schemas/contact.schema';
import { uniqueEmail } from './uniqueEmail';

export type ContactPayload = Required<NewContact>;

export function buildContact(overrides: Partial<NewContact> = {}): ContactPayload {
  const firstName = faker.person.firstName().slice(0, 20);
  const lastName = faker.person.lastName().slice(0, 20);
  return {
    firstName,
    lastName,
    birthdate: faker.date
      .birthdate({ min: 18, max: 80, mode: 'age' })
      .toISOString()
      .slice(0, 10),
    email: uniqueEmail(firstName, lastName),
    phone: faker.string.numeric(10),
    street1: faker.location.streetAddress(),
    street2: `Apt ${faker.number.int({ min: 1, max: 999 })}`,
    city: faker.location.city(),
    stateProvince: faker.location.state({ abbreviated: true }),
    postalCode: faker.location.zipCode('#####'),
    country: 'USA',
    ...overrides,
  };
}
