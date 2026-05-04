import Docker from 'dockerode';
import { promisify } from 'util';

const docker = new Docker();
const image = process.argv[2];

try {
  await docker.getImage(image).inspect();
} catch (e) {
  if ((e as { statusCode?: number }).statusCode !== 404) throw e;
  await promisify(docker.modem.followProgress.bind(docker.modem))(
    await promisify(docker.pull.bind(docker))(image),
  );
}
