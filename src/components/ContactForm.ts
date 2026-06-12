import type { Locator, Page } from '@playwright/test';
import type { NewContact } from '../api/schemas/contact.schema';

export class ContactForm {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly birthdateInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly street1Input: Locator;
  readonly street2Input: Locator;
  readonly cityInput: Locator;
  readonly stateProvinceInput: Locator;
  readonly postalCodeInput: Locator;
  readonly countryInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.birthdateInput = page.getByRole('textbox', { name: 'Date of Birth' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone' });
    this.street1Input = page.getByRole('textbox', { name: 'Street Address 1' });
    this.street2Input = page.getByRole('textbox', { name: 'Street Address 2' });
    this.cityInput = page.getByRole('textbox', { name: 'City' });
    this.stateProvinceInput = page.getByRole('textbox', { name: 'State or Province' });
    this.postalCodeInput = page.getByRole('textbox', { name: 'Postal Code' });
    this.countryInput = page.getByRole('textbox', { name: 'Country' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async fill(contact: NewContact): Promise<void> {
    const fields: Array<[Locator, string | undefined]> = [
      [this.firstNameInput, contact.firstName],
      [this.lastNameInput, contact.lastName],
      [this.birthdateInput, contact.birthdate],
      [this.emailInput, contact.email],
      [this.phoneInput, contact.phone],
      [this.street1Input, contact.street1],
      [this.street2Input, contact.street2],
      [this.cityInput, contact.city],
      [this.stateProvinceInput, contact.stateProvince],
      [this.postalCodeInput, contact.postalCode],
      [this.countryInput, contact.country],
    ];
    for (const [locator, value] of fields) {
      if (value !== undefined) await locator.fill(value);
    }
  }
}
