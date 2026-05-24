import os

from strands.tools.mcp.mcp_client import MCPClient

from aws_nx_poc_agent_connection.core.agentcore_mcp_client import AgentCoreMCPClient
from aws_nx_poc_agent_connection.core.runtime_config import (
    get_connected_agent_runtime_arn,
)


class InventoryMcpServerClient:
    """Client for the InventoryMcpServer MCP server."""

    @staticmethod
    def create() -> MCPClient:
        if os.environ.get("SERVE_LOCAL") == "true":
            return AgentCoreMCPClient.without_auth("http://localhost:8000/mcp")
        return AgentCoreMCPClient.with_iam_auth(get_connected_agent_runtime_arn("InventoryMcpServer"))
