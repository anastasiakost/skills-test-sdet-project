import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Header } from '../components/Header';

export class ContactDetailsPage extends BasePage {
  readonly header: Header;
  readonly editContactButton: Locator;
  readonly deleteContactButton: Locator;
  readonly returnToListButton: Locator;

  constructor(page: Page) {
    super(page, 'ContactDetailsPage');
    this.header = new Header(page);
    this.editContactButton = page.getByRole('button', { name: 'Edit Contact' });
    this.deleteContactButton = page.getByRole('button', { name: 'Delete Contact' });
    this.returnToListButton = page.getByRole('button', { name: 'Return to Contact List' });
  }

  async clickEdit(): Promise<void> {
    this.log.info('Opening edit form for the displayed contact');
    await this.editContactButton.click();
  }

  async returnToList(): Promise<void> {
    await this.returnToListButton.click();
  }
}
