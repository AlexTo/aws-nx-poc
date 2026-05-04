import { createConnection, Connection } from 'mariadb';

const noop = () => undefined;

const [portArg, dbArg, userArg, passwordArg] = process.argv.slice(2);
const timeoutAt = Date.now() + 30000;

while (Date.now() < timeoutAt) {
  let conn: Connection | undefined;
  try {
    conn = await createConnection({
      host: 'localhost',
      port: parseInt(portArg),
      user: userArg,
      password: passwordArg,
      database: dbArg,
      connectTimeout: 500,
      allowPublicKeyRetrieval: true,
    });
    await conn.end();
    console.log('Database is ready.');
    process.exit(0);
  } catch (e) {
    console.log(e);
    await conn?.end().catch(noop);
  }
  await new Promise((r) => setTimeout(r, 200));
}

throw new Error(`Timed out waiting for mysql on port ${portArg}`);
