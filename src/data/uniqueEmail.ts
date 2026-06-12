import { uniqueId } from './uniqueId';

export function uniqueEmail(firstName: string, lastName: string): string {
  const local = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9.]/g, '');
  return `${local}.${uniqueId()}@example.com`;
}
