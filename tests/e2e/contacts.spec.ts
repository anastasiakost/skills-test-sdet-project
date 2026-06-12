import { test, expect } from '../../src/fixtures/test';
import { buildContact } from '../../src/data/contactBuilder';

test.describe('Contact list', () => {
  test('User can create a new contact and see it in the list', async ({
    contactListPage,
    addContactPage,
    seededContacts,
  }) => {
    const contact = buildContact();
    seededContacts.trackByEmail(contact.email);

    await test.step('When the user creates a new contact via the add-contact form', async () => {
      await contactListPage.open();
      await contactListPage.startAddContact();
      await addContactPage.submitContact(contact);
    });

    await test.step('Then all contact details appear in the correct columns', async () => {
      await expect(contactListPage.rowByText(contact.email)).toBeVisible();
      await expect(contactListPage.rowCells(contact.email)).toHaveText(
        contactListPage.expectedRowCells(contact),
      );
    });
  });

  test('User can edit an existing contact and see the changes in the list', async ({
    contactsApi,
    seededContacts,
    contactListPage,
    contactDetailsPage,
    editContactPage,
  }) => {

    const payload = buildContact();
    const original = seededContacts.track(await contactsApi.seedContact(payload));
    const updated = buildContact({ email: payload.email });

    await test.step('When the user updates the contact via the edit form', async () => {
      await contactListPage.open();
      await contactListPage.openContact(payload.email);
      await contactDetailsPage.clickEdit();

      await expect(editContactPage.form.firstNameInput).toHaveValue(original.firstName);
      await editContactPage.submitContact(updated);
      await expect(contactDetailsPage.returnToListButton).toBeVisible();
      await contactDetailsPage.returnToList();
    });

    await test.step('Then all updated details appear in the correct columns', async () => {
      await expect(contactListPage.rowCells(updated.email)).toHaveText(
        contactListPage.expectedRowCells(updated),
      );
    });
  });
});
