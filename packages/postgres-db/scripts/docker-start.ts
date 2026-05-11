import Docker from 'dockerode';

const [containerName, image, hostPort, dbName, dbPassword] =
  process.argv.slice(2);

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
    Image: image,
    Env: [`MYSQL_DATABASE=${dbName}`, `MYSQL_ROOT_PASSWORD=${dbPassword}`],
    ExposedPorts: { '3306/tcp': {} },
    HostConfig: {
      AutoRemove: true,
      PortBindings: { '3306/tcp': [{ HostPort: hostPort }] },
      Binds: [`${containerName}-data:/var/lib/mysql`],
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
