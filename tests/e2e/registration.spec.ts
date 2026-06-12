import { test, expect } from '../../src/fixtures/test';

// Registration must start unauthenticated, opt out of the setup user's storage state.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('User registration', () => {
  test('New user can register and log in with the same credentials', async ({
    disposableUser,
    loginPage,
    signUpPage,
    contactListPage,
  }) => {
    await test.step('When a new user registers via the sign-up form', async () => {
      await loginPage.open();
      await loginPage.startSignUp();
      await signUpPage.register(disposableUser);
      await expect(contactListPage.header.heading).toHaveText('Contact List');
    });

    await test.step('Then the user can log again with the same credentials', async () => {
      await contactListPage.header.logout();
      await expect(loginPage.signUpButton).toBeVisible();
      await loginPage.login(disposableUser.email, disposableUser.password);
      await expect(contactListPage.addContactButton).toBeVisible();
    });
  });
});
