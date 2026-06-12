import winston from 'winston';
import { env } from '../config/env';

let testContext = '';
export function setTestContext(value: string): void {
  testContext = value;
}

const injectTestContext = winston.format((info) => {
  if (testContext) info.test = testContext;
  return info;
});

const consoleFormat = winston.format.combine(
  injectTestContext(),
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.printf((info) => {
    const scope = typeof info.scope === 'string' ? info.scope : 'app';
    const test = typeof info.test === 'string' ? ` (${info.test})` : '';
    return `${String(info.timestamp)} ${info.level} [${scope}]${test} ${String(info.message)}`;
  }),
);

const fileFormat = winston.format.combine(
  injectTestContext(),
  winston.format.timestamp(),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: env.logLevel,
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({ filename: 'logs/test-run.log', format: fileFormat }),
  ],
});
