import { getPrisma as getPostgresDb } from ':aws-nx-poc/postgres-db';
import { getPrisma as getMySqlDb } from ':aws-nx-poc/my-sql-db';
import { Agent, tool } from '@strands-agents/sdk';
import { z } from 'zod';

const multiply = tool({
  name: 'Multiply',
  description: 'Multiply two numbers',
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  callback: ({ a, b }) => a * b,
});

export const getAgent = async () => {
  const postgresDb = await getPostgresDb();
  postgresDb.$on('error' as never, (e) => {
    console.log(e);
  });
  const mySqlDb = await getMySqlDb();
  mySqlDb.$on('error' as never, (e) => {
    console.log(e);
  });
  return new Agent({
    systemPrompt: `You are a mathematical wizard.
  Use your tools for mathematical tasks.
  Refer to tools as your 'spellbook'.`,
    tools: [multiply],
  });
};
