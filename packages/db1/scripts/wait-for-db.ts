import pg from 'pg';

const noop = () => undefined;

const [portArg, dbArg, userArg, passwordArg] = process.argv.slice(2);
const deadline = Date.now() + 5000;

while (Date.now() < deadline) {
  const client = new pg.Client({
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
    await client.end().catch(noop);
  }
  await new Promise((r) => setTimeout(r, 200));
}

throw new Error(`Timed out waiting for postgres on port ${portArg}`);
