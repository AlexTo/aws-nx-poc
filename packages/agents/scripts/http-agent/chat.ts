/**
 * Minimal chat CLI for HttpAgent (HTTP / tRPC WebSocket).
 *
 * Connects to the agent at `process.env.URL` (set by the Nx `http-agent-chat` target).
 */
import { chatLoop, type ChatAdapter } from 'agent-chat-cli';
import { HttpAgentClient } from '../../src/http-agent/client.js';

class TrpcWebSocketAdapter implements ChatAdapter {
  private client!: ReturnType<typeof HttpAgentClient.local>;

  async connect(url: string) {
    this.client = HttpAgentClient.local({ url });
    return { agentName: 'HttpAgent' };
  }

  async *sendMessage(text: string): AsyncIterable<string> {
    const stream = new ReadableStream<string>({
      start: (controller) => {
        this.client.invoke.subscribe(
          { message: text },
          {
            onData: (chunk: string) => controller.enqueue(chunk),
            onComplete: () => controller.close(),
            onError: (err: unknown) => controller.error(err),
          },
        );
      },
    });

    yield* stream as unknown as AsyncIterable<string>;
  }
}

await chatLoop(new TrpcWebSocketAdapter(), process.env.URL!);
