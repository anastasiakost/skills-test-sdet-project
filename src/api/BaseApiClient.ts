import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Logger } from 'winston';
import { logger } from '../utils/logger';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type SendOptions = {
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
};

const SENSITIVE_KEYS = new Set(['password', 'token']);

/** Deep-copies a JSON value with sensitive field values masked. */
function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) =>
        SENSITIVE_KEYS.has(key.toLowerCase()) ? [key, '***'] : [key, redact(val)],
      ),
    );
  }
  return value;
}

/** Redacts a raw response body if it is JSON; non-JSON bodies pass through unchanged. */
function redactBody(text: string): string {
  try {
    return JSON.stringify(redact(JSON.parse(text)));
  } catch {
    return text;
  }
}


export abstract class BaseApiClient {
  protected readonly log: Logger;

  constructor(protected readonly request: APIRequestContext, scope: string) {
    this.log = logger.child({ scope });
  }

  protected async send(method: HttpMethod, url: string, options: SendOptions = {}): Promise<APIResponse> {
    if (options.data !== undefined) {
      this.log.debug(`→ ${method} ${url} body: ${JSON.stringify(redact(options.data))}`);
    }
    const startedAt = Date.now();
    const response = await this.request.fetch(url, {
      method,
      data: options.data,
      params: options.params,
      headers: options.headers,
    });
    const duration = Date.now() - startedAt;
    this.log.info(`${method} ${url} → ${response.status()} (${duration}ms)`);
    if (this.log.isDebugEnabled()) {
      this.log.debug(`← ${method} ${url} body: ${redactBody(await response.text())}`);
    }
    return response;
  }
}
