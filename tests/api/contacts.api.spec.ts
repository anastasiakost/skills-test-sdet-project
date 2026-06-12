import { test, expect } from '../../src/fixtures/test';
import { buildContact } from '../../src/data/contactBuilder';
import { contactSchema } from '../../src/api/schemas/contact.schema';

test.describe('Contacts API', () => {
  test('POST /contacts creates a contact retrievable via GET', async ({
    contactsApi,
    seededContacts,
  }) => {
    const payload = buildContact();

    const created = await test.step('When the contact is created with valid data', async () => {
      const response = await contactsApi.create(payload);
      expect(response.status()).toBe(201);
      const contact = seededContacts.track(contactSchema.parse(await response.json()));
      expect(contact).toMatchObject(payload);
      return contact;
    });

    await test.step('Then the contact is retrievable via GET', async () => {
      const response = await contactsApi.get(created._id);
      expect(response.status()).toBe(200);
      expect(contactSchema.parse(await response.json())).toMatchObject(payload);
    });
  });

  test('DELETE /contacts/:id removes the contact', async ({ contactsApi }) => {
    const seeded = await contactsApi.seedContact(buildContact());

    await test.step('When the contact is deleted', async () => {
      const response = await contactsApi.delete(seeded._id);
      expect(response.status()).toBe(200);
      expect(await response.text()).toBe('Contact deleted');
    });

    await test.step('Then the contact is removed (404 on retrieval)', async () => {
      const response = await contactsApi.get(seeded._id);
      expect(response.status()).toBe(404);
    });
  });
});
