import { z } from 'zod';

export const userSchema = z.object({
  _id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
});

export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string().min(1),
});

export type User = z.infer<typeof userSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

export type NewUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
