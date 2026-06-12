import { z } from 'zod';

export const contactSchema = z.object({
  _id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  birthdate: z.string().optional(),
  email: z.email().optional(),
  phone: z.string().optional(),
  street1: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  owner: z.string(),
  __v: z.number(),
});

export const contactListSchema = z.array(contactSchema);

export type Contact = z.infer<typeof contactSchema>;

export type NewContact = Omit<Contact, '_id' | 'owner' | '__v'>;
