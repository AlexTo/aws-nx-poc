import { HttpAgent } from '@ag-ui/client';
import type { AbstractAgent, RunAgentInput } from '@ag-ui/client';
import { Observable } from 'rxjs';
import { useMemo } from 'react';
import { useRuntimeConfig } from './useRuntimeConfig';
import { useSigV4, type SigV4Client } from './useSigV4';

function buildAgentCoreUrl(agentRuntimeArn: string): string {
  const region = agentRuntimeArn.split(':')[3];
  return `https://bedrock-agentcore.${region}.amazonaws.com/runtimes/${encodeURIComponent(agentRuntimeArn)}/invocations?qualifier=DEFAULT`;
}

// AgentCore session ids must be at least 33 characters.
function agentCoreSessionId(input: RunAgentInput): string {
  return (input.threadId ?? '').padEnd(33, '0');
}

class SigV4HttpAgent extends HttpAgent {
  sigV4Client: SigV4Client;

  constructor(
    config: ConstructorParameters<typeof HttpAgent>[0],
    sigV4Client: SigV4Client,
  ) {
    super(config);
    this.sigV4Client = sigV4Client;
  }

  protected override requestInit(input: RunAgentInput): RequestInit {
    const init = super.requestInit(input);
    init.headers = {
      ...(init.headers as Record<string, string>),
      'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': agentCoreSessionId(input),
    };
    return init;
  }

  // Remove this override once https://github.com/ag-ui-protocol/ag-ui/issues/1316 is fixed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override run(input: RunAgentInput): any {
    const sigV4Fetch = this.sigV4Client.fetch as typeof window.fetch;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Observable<any>((subscriber) => {
      const originalFetch = window.fetch;
      window.fetch = sigV4Fetch;
      const sub = super.run(input).subscribe(subscriber);
      window.fetch = originalFetch;
      return () => sub.unsubscribe();
    });
  }

  override clone(): SigV4HttpAgent {
    const cloned = super.clone() as SigV4HttpAgent;
    cloned.sigV4Client = this.sigV4Client;
    return cloned;
  }
}

export const useAguiStoryAgent = (): Record<string, AbstractAgent> => {
  const runtimeConfig = useRuntimeConfig();
  const agentRuntimeValue = runtimeConfig.agentRuntimes.StoryAgent;
  const sigv4 = useSigV4();

  const url = useMemo(
    () =>
      agentRuntimeValue.startsWith('arn:')
        ? buildAgentCoreUrl(agentRuntimeValue)
        : agentRuntimeValue,
    [agentRuntimeValue],
  );

  return useMemo((): Record<string, AbstractAgent> => {
    const agent = new SigV4HttpAgent({ url }, sigv4);

    return { agent: agent };
  }, [url, sigv4]);
};
