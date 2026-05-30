import { createUserEntity } from ':aws-nx-poc/dynamodb1';
import { randomUUID } from 'crypto';
import { publicProcedure } from '../init.js';
import {
  AddUserInputSchema,
  ListUsersOutputSchema,
  UserSchema,
} from '../schema/index.js';

export const listUsers = publicProcedure
  .output(ListUsersOutputSchema)
  .query(async () => {
    const entity = await createUserEntity();
    const { data } = await entity.scan.go();
    return { items: data };
  });

export const addUser = publicProcedure
  .input(AddUserInputSchema)
  .output(UserSchema)
  .mutation(async (opts) => {
    const entity = await createUserEntity();
    const { data } = await entity
      .put({ id: randomUUID(), name: opts.input.name })
      .go();
    return data;
  });
