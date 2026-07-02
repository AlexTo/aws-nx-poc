import { createFileRoute } from '@tanstack/react-router';

import { CopilotChat } from '../components/copilot';

export const Route = createFileRoute('/agent')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-[calc(100vh-10rem)] min-h-[400px]">
      <CopilotChat
        agentId="my-agent"
        labels={{
          welcomeMessageText: 'How can I help you today?',
          chatInputPlaceholder: 'Ask me anything...',
        }}
      />
    </div>
  );
}
