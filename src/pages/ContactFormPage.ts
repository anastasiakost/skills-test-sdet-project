import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ContactForm } from '../components/ContactForm';
import type { NewContact } from '../api/schemas/contact.schema';


export abstract class ContactFormPage extends BasePage {
  readonly form: ContactForm;

  constructor(page: Page, scope: string) {
    super(page, scope);
    this.form = new ContactForm(page);
  }

  async submitContact(contact: NewContact): Promise<void> {
    this.log.info(`Submitting contact ${contact.firstName} ${contact.lastName}`);
    await this.form.fill(contact);
    await this.form.submitButton.click();
  }
}
