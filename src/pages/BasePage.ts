import type { Page } from '@playwright/test';
import type { Logger } from 'winston';
import { logger } from '../utils/logger';

export abstract class BasePage {
  protected readonly log: Logger;

  constructor(protected readonly page: Page, scope: string) {
    this.log = logger.child({ scope });
  }

  protected async goto(path: string): Promise<void> {
    this.log.info(`Navigating to ${path}`);
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }
}
