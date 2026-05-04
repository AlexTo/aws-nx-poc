import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { getDatabaseSecret } from './utils.js';

export const handler = async () => {
  // TODO: The Prisma CLI relies on a Rust-based driver that doesn’t support `mysql_clear_password` (required for IAM authentication).
  // Therefore, the MySQL migration handler can only connect directly to the database cluster.
  // See: https://github.com/prisma/prisma/issues/10304
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
