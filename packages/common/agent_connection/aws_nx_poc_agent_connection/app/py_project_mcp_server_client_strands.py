import os

from strands.tools.mcp.mcp_client import MCPClient

from aws_nx_poc_agent_connection.core.agentcore_mcp_client_strands import (
    AgentCoreMCPClientStrands,
)
from aws_nx_poc_agent_connection.core.runtime_config import (
    get_agentcore_runtime_config,
)


class PyProjectMcpServerClientStrands:
    """Strands client for the PyProjectMcpServer MCP server."""

    @staticmethod
    def create() -> MCPClient:
        if os.environ.get("LOCAL_DEV") == "true":
            return AgentCoreMCPClientStrands.without_auth("http://localhost:8002/mcp")
        config = get_agentcore_runtime_config()
        agent_runtime_arn = config.get("agentRuntimes", {}).get("PyProjectMcpServer")
        if not agent_runtime_arn:
            raise RuntimeError(
                "No connected MCP server runtime named 'PyProjectMcpServer' found in runtime configuration."
            )
        return AgentCoreMCPClientStrands.with_iam_auth(agent_runtime_arn)
