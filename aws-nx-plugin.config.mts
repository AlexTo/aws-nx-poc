import { AwsNxPluginConfig } from '@aws/nx-plugin';

export default {
  iac: { provider: 'cdk' },
  containers: { engine: 'docker' },
} satisfies AwsNxPluginConfig;
