import Docker from 'dockerode';

const docker = new Docker();
const image = process.argv[2];

try {
  await docker.getImage(image).inspect();
} catch (e) {
  if ((e as { statusCode?: number }).statusCode !== 404) throw e;
  await new Promise<void>((resolve, reject) => {
    docker.pull(image, (err: Error, stream: NodeJS.ReadableStream) => {
      if (err) return reject(err);
      docker.modem.followProgress(stream, (err: Error | null) =>
        err ? reject(err) : resolve(),
      );
    });
  });
}
