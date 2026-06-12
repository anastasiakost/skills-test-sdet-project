import fs from 'fs';
import path from 'path';
import { test as setup } from '@playwright/test';
import { AUTH_META_FILE, STORAGE_STATE, env } from '../../src/config/env';
import { logger } from '../../src/utils/logger';
import { UsersClient } from '../../src/api/UsersClient';
import { buildUser } from '../../src/data/userBuilder';

const log = logger.child({ scope: 'AuthSetup' });

/**
 * Authenticates once per run via API (no UI login) and persists:
 *  STORAGE_STATE: browser cookies for UI projects (reused via project deps)
 *  AUTH_META_FILE: bearer token for API client fixtures
 * Registers a fresh unique user for every run.
 */
setup('Authenticate user role', async ({ playwright }) => {
  const requestContext = await playwright.request.newContext({ baseURL: env.baseUrl });
  const users = new UsersClient(requestContext);

  const newUser = buildUser();
  log.info(`Registering fresh user ${newUser.email}`);
  const auth = await users.registerOrThrow(newUser);
  const password = newUser.password;

  const storageState = {
    cookies: [
      {
        name: 'token',
        value: auth.token,
        domain: new URL(env.baseUrl).hostname,
        path: '/',
        expires: -1,
        httpOnly: false,
        secure: env.baseUrl.startsWith('https'),
        sameSite: 'Lax',
      },
    ],
    origins: [],
  };

  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
  fs.writeFileSync(STORAGE_STATE, JSON.stringify(storageState, null, 2));
  fs.writeFileSync(
    AUTH_META_FILE,
    JSON.stringify({ token: auth.token, email: auth.user.email, password }, null, 2),
  );
  log.info(`Auth state saved for ${auth.user.email}`);

  await requestContext.dispose();
});
