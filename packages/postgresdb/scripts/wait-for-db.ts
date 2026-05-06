import { Client } from 'pg';

const noop = () => undefined;

const [portArg, dbArg, userArg, passwordArg] = process.argv.slice(2);
const timeoutAt = Date.now() + 30000;

while (Date.now() < timeoutAt) {
  const client = new Client({
    host: 'localhost',
    port: parseInt(portArg),
    user: userArg,
    password: passwordArg,
    database: dbArg,
    connectionTimeoutMillis: 500,
  });
  client.on('error', noop);
  try {
    await client.connect();
    await client.end();
    console.log('Database is ready.');
    process.exit(0);
  } catch {
    console.log('Database is not ready.');
    await client.end().catch(noop);
  }
  await new Promise((r) => setTimeout(r, 200));
}

throw new Error(`Timed out waiting for postgres on port ${portArg}`);
