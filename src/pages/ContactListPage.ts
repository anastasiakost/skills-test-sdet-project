import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Header } from '../components/Header';
import type { NewContact } from '../api/schemas/contact.schema';

export class ContactListPage extends BasePage {
  readonly header: Header;
  readonly addContactButton: Locator;
  readonly contactsTable: Locator;
  readonly contactRows: Locator;

  constructor(page: Page) {
    super(page, 'ContactListPage');
    this.header = new Header(page);
    this.addContactButton = page.getByRole('button', { name: 'Add a New Contact' });
    this.contactsTable = page.getByRole('table');
    this.contactRows = this.contactsTable.getByRole('row');
  }

  async open(): Promise<void> {
    await this.goto('/contactList');
  }

  rowByText(text: string): Locator {
    return this.contactRows.filter({ hasText: text });
  }

  rowCells(text: string): Locator {
    return this.rowByText(text).getByRole('cell');
  }

  expectedRowCells(contact: NewContact): string[] {
    const join = (...parts: Array<string | undefined>) => parts.filter(Boolean).join(' ');
    return [
      join(contact.firstName, contact.lastName),
      contact.birthdate ?? '',
      contact.email ?? '',
      contact.phone ?? '',
      join(contact.street1, contact.street2),
      join(contact.city, contact.stateProvince, contact.postalCode),
      contact.country ?? '',
    ];
  }

  async openContact(text: string): Promise<void> {
    this.log.info(`Opening contact row matching "${text}"`);
    await this.rowByText(text).click();
  }

  async startAddContact(): Promise<void> {
    await this.addContactButton.click();
  }
}
