import type { Locator, Page } from '@playwright/test';

export class Header {
  readonly heading: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
