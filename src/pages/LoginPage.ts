import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly signUpButton: Locator;

  constructor(page: Page) {
    super(page, 'LoginPage');
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.signUpButton = page.getByRole('button', { name: 'Sign up' });
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async startSignUp(): Promise<void> {
    this.log.info('Navigating to registration via Sign up button');
    await this.signUpButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    this.log.info(`Logging in via UI as ${email}`);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
