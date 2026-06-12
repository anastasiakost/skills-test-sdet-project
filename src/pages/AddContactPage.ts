import type { Page } from '@playwright/test';
import { ContactFormPage } from './ContactFormPage';

export class AddContactPage extends ContactFormPage {
  constructor(page: Page) {
    super(page, 'AddContactPage');
  }
}
