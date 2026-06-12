import type { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient } from './BaseApiClient';
import { authResponseSchema, type AuthResponse, type NewUser } from './schemas/user.schema';

export class UsersClient extends BaseApiClient {
  constructor(
    request: APIRequestContext,
    private readonly token?: string,
  ) {
    super(request, 'UsersClient');
  }

  async register(user: NewUser): Promise<APIResponse> {
    return this.send('POST', '/users', { data: user });
  }

  async login(email: string, password: string): Promise<APIResponse> {
    return this.send('POST', '/users/login', { data: { email, password } });
  }

  async getProfile(): Promise<APIResponse> {
    return this.send('GET', '/users/me', { headers: this.authHeaders() });
  }

  async deleteMe(): Promise<APIResponse> {
    return this.send('DELETE', '/users/me', { headers: this.authHeaders() });
  }

  private authHeaders(): Record<string, string> | undefined {
    return this.token ? { Authorization: `Bearer ${this.token}` } : undefined;
  }

  async registerOrThrow(user: NewUser): Promise<AuthResponse> {
    const response = await this.register(user);
    if (response.status() !== 201) {
      throw new Error(`User registration failed: ${response.status()} ${await response.text()}`);
    }
    return authResponseSchema.parse(await response.json());
  }

  async loginOrThrow(email: string, password: string): Promise<AuthResponse> {
    const response = await this.login(email, password);
    if (response.status() !== 200) {
      throw new Error(`Login failed for ${email}: ${response.status()}`);
    }
    return authResponseSchema.parse(await response.json());
  }
}
