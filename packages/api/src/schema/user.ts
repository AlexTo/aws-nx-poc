import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AddUserInputSchema = z.object({
  name: z.string(),
});

export const ListUsersOutputSchema = z.object({
  items: z.array(UserSchema),
});

export type IUser = z.TypeOf<typeof UserSchema>;
export type IAddUserInput = z.TypeOf<typeof AddUserInputSchema>;
export type IListUsersOutput = z.TypeOf<typeof ListUsersOutputSchema>;
