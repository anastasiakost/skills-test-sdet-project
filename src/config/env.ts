import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';
import { isCI } from '../utils/envHelper';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

/**
 * Schema for every env var the framework consumes.
 */
const envSchema = z.object({
  BASE_URL: z.url().default('https://thinking-tester-contact-list.herokuapp.com'),
  ENV: z.enum(['local', 'ci', 'staging']).default('local'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  HEADED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
}

/** Typed, validated runtime configuration. Import this instead of touching process.env. */
export const env = {
  baseUrl: parsed.data.BASE_URL,
  envName: parsed.data.ENV,
  logLevel: parsed.data.LOG_LEVEL,
  headed: parsed.data.HEADED,
  isCI: isCI(),
} as const;

/** Browser storage state produced by tests/setup/auth.setup.ts (gitignored). */
export const STORAGE_STATE = path.resolve(__dirname, '../../.auth/user.json');

/** API credentials (token) produced by auth setup, consumed by API client fixtures. */
export const AUTH_META_FILE = path.resolve(__dirname, '../../.auth/user.meta.json');
