import fs from 'fs';
import { test as base } from '@playwright/test';
import { AUTH_META_FILE, env } from '../config/env';
import { logger, setTestContext } from '../utils/logger';
import { LoginPage } from '../pages/LoginPage';
import { SignUpPage } from '../pages/SignUpPage';
import { ContactListPage } from '../pages/ContactListPage';
import { ContactDetailsPage } from '../pages/ContactDetailsPage';
import { AddContactPage } from '../pages/AddContactPage';
import { EditContactPage } from '../pages/EditContactPage';
import { ContactsClient } from '../api/ContactsClient';
import { UsersClient } from '../api/UsersClient';
import { contactListSchema, type Contact } from '../api/schemas/contact.schema';
import { authResponseSchema, type NewUser } from '../api/schemas/user.schema';
import { buildUser } from '../data/userBuilder';

/** Credentials persisted by tests/setup/auth.setup.ts. */
type AuthState = { token: string; email: string; password: string };

type TestFixtures = {
  loginPage: LoginPage;
  signUpPage: SignUpPage;
  contactListPage: ContactListPage;
  contactDetailsPage: ContactDetailsPage;
  addContactPage: AddContactPage;
  editContactPage: EditContactPage;
  contactsApi: ContactsClient;
  /** Registers contacts created in a test for guaranteed deletion at teardown */
  seededContacts: {
    track: (contact: Contact) => Contact;
  /** For contacts created via the UI, where no id exists yet, resolved via the API at teardown. */
    trackByEmail: (email: string) => void;
  };
  usersApi: UsersClient;
  /** Builds a users client bound to an arbitrary token, for verifying freshly issued tokens. */
  usersApiFor: (token: string) => UsersClient;
  /** Fresh user payload; if the test registered it, the account is deleted at teardown. */
  disposableUser: NewUser;
  /** Tags every log line with the worker index and test title for the duration of the test. */
  testLogContext: void;
};

type WorkerFixtures = {
  authState: AuthState;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  testLogContext: [
    async ({}, use, testInfo) => {
      setTestContext(`w${testInfo.workerIndex} ${testInfo.title}`);
      await use();
      setTestContext('');
    },
    { auto: true },
  ],

  authState: [
    async ({}, use) => {
      if (!fs.existsSync(AUTH_META_FILE)) {
        throw new Error(`${AUTH_META_FILE} not found, verify the "setup" step`);
      }
      const state = JSON.parse(fs.readFileSync(AUTH_META_FILE, 'utf-8')) as AuthState;
      logger.child({ scope: 'Fixtures' }).debug(`Loaded auth state for ${state.email}`);
      await use(state);
    },
    { scope: 'worker' },
  ],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  signUpPage: async ({ page }, use) => {
    await use(new SignUpPage(page));
  },

  contactListPage: async ({ page }, use) => {
    await use(new ContactListPage(page));
  },

  contactDetailsPage: async ({ page }, use) => {
    await use(new ContactDetailsPage(page));
  },

  addContactPage: async ({ page }, use) => {
    await use(new AddContactPage(page));
  },

  editContactPage: async ({ page }, use) => {
    await use(new EditContactPage(page));
  },

  contactsApi: async ({ playwright, authState }, use) => {
    const context = await playwright.request.newContext({
      baseURL: env.baseUrl,
      extraHTTPHeaders: { Authorization: `Bearer ${authState.token}` },
    });
    await use(new ContactsClient(context));
    await context.dispose();
  },

  seededContacts: async ({ contactsApi }, use) => {
    const ids: string[] = [];
    const emails: string[] = [];
    await use({
      track: (contact) => {
        ids.push(contact._id);
        return contact;
      },
      trackByEmail: (email) => {
        emails.push(email);
      },
    });

    // Runs after the test regardless of outcome. Tracked emails are resolved
    // to ids here, since UI-created contacts have no id at tracking time; an
    // email that was never created simply matches nothing.
    if (emails.length > 0) {
      const response = await contactsApi.list();
      const all = contactListSchema.parse(await response.json());
      ids.push(...all.filter((c) => c.email && emails.includes(c.email)).map((c) => c._id));
    }
    for (const id of ids) {
      await contactsApi.delete(id);
    }
  },

  usersApi: async ({ playwright, authState }, use) => {
    const context = await playwright.request.newContext({ baseURL: env.baseUrl });
    await use(new UsersClient(context, authState.token));
    await context.dispose();
  },

  usersApiFor: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: env.baseUrl });
    await use((token) => new UsersClient(context, token));
    await context.dispose();
  },

  disposableUser: async ({ playwright }, use) => {
    const user = buildUser();
    await use(user);
    const context = await playwright.request.newContext({ baseURL: env.baseUrl });
    const response = await new UsersClient(context).login(user.email, user.password);
    if (response.status() === 200) {
      const { token } = authResponseSchema.parse(await response.json());
      await new UsersClient(context, token).deleteMe();
    }
    await context.dispose();
  },
});

export { expect } from '@playwright/test';
