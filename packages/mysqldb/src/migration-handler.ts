import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { getDatabaseSecret } from './utils.js';

export const handler = async () => {
  const { host, port, dbname, username, password } = await getDatabaseSecret();

  const databaseUrl =
    `mysql://${encodeURIComponent(username)}` +
    `:${encodeURIComponent(password)}` +
    `@${host}:${port}/${dbname}` +
    `?sslaccept=strict`;

  await promisify(execFile)('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: __dirname,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });
};
