import { test, expect } from '../../src/fixtures/test';
import { authResponseSchema, userSchema } from '../../src/api/schemas/user.schema';

test.describe('Authentication API', () => {
  test('POST /users/login returns a valid token for a registered user', async ({
    usersApi,
    usersApiFor,
    authState,
  }) => {
    const auth = await test.step('Authenticate with the registered user credentials', async () => {
      const response = await usersApi.login(authState.email, authState.password);
      expect(response.status()).toBe(200);
      const parsed = authResponseSchema.parse(await response.json());
      expect(parsed.user.email).toBe(authState.email);
      return parsed;
    });

    await test.step('Verify issued token authorizes a protected endpoint', async () => {
      const response = await usersApiFor(auth.token).getProfile();
      expect(response.status()).toBe(200);
      const profile = userSchema.parse(await response.json());
      expect(profile._id).toBe(auth.user._id);
    });
  });
});
