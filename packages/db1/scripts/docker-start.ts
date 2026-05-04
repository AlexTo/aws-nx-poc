import Docker from 'dockerode';

const [containerName, hostPort, dbName, dbUser, dbPassword] =
  process.argv.slice(2);

if (!containerName || !hostPort || !dbName || !dbUser || !dbPassword) {
  console.error(
    'Usage: docker-start.ts <containerName> <hostPort> <dbName> <dbUser> <dbPassword>',
  );
  process.exit(1);
}

const docker = new Docker();

let container: Docker.Container;

try {
  const existing = docker.getContainer(containerName);
  const info = await existing.inspect();
  container = existing;
  if (!info.State.Running) {
    await container.start();
  }
} catch (e) {
  if ((e as { statusCode?: number }).statusCode !== 404) throw e;
  container = await docker.createContainer({
    name: containerName,
    Image: 'postgres',
    Env: [
      `POSTGRES_DB=${dbName}`,
      `POSTGRES_USER=${dbUser}`,
      `POSTGRES_PASSWORD=${dbPassword}`,
    ],
    ExposedPorts: { '5432/tcp': {} },
    HostConfig: {
      AutoRemove: true,
      PortBindings: { '5432/tcp': [{ HostPort: hostPort }] },
      Binds: [`${containerName}-data:/var/lib/postgresql`],
    },
  });
  await container.start();
}

const stream = await container.attach({
  stream: true,
  stdout: true,
  stderr: true,
});
container.modem.demuxStream(stream, process.stdout, process.stderr);

let exiting = false;

async function cleanup() {
  if (exiting) return;
  exiting = true;
  try {
    await container.stop();
  } catch (e) {
    if ((e as { statusCode?: number }).statusCode !== 404) console.error(e);
  }
  process.exit(0);
}

process.on('SIGTERM', () => void cleanup());
process.on('SIGINT', () => void cleanup());
process.on('SIGHUP', () => void cleanup());

const { StatusCode } = await container.wait();
if (!exiting) process.exit(StatusCode);
