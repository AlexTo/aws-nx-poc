import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
});

export type IUser = z.TypeOf<typeof UserSchema>;

export const AddUserInputSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

export type IAddUserInput = z.TypeOf<typeof AddUserInputSchema>;
