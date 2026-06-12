import type { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient } from './BaseApiClient';
import { contactSchema, type Contact, type NewContact } from './schemas/contact.schema';

export class ContactsClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request, 'ContactsClient');
  }

  async create(contact: NewContact): Promise<APIResponse> {
    return this.send('POST', '/contacts', { data: contact });
  }

  async list(): Promise<APIResponse> {
    return this.send('GET', '/contacts');
  }

  async get(id: string): Promise<APIResponse> {
    return this.send('GET', `/contacts/${id}`);
  }

  async update(id: string, contact: NewContact): Promise<APIResponse> {
    return this.send('PUT', `/contacts/${id}`, { data: contact });
  }

  async delete(id: string): Promise<APIResponse> {
    return this.send('DELETE', `/contacts/${id}`);
  }

  async seedContact(contact: NewContact): Promise<Contact> {
    const response = await this.create(contact);
    if (response.status() !== 201) {
      throw new Error(`Contact seeding failed: ${response.status()} ${await response.text()}`);
    }
    const created = contactSchema.parse(await response.json());
    this.log.info(`Seeded contact ${created.firstName} ${created.lastName} (${created._id})`);
    return created;
  }
}
