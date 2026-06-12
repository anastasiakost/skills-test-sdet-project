import type { Page } from '@playwright/test';
import { ContactFormPage } from './ContactFormPage';

export class EditContactPage extends ContactFormPage {
  constructor(page: Page) {
    super(page, 'EditContactPage');
  }
}
