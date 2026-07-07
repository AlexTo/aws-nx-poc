import os

from aws_nx_poc_my_sql_db.connection import session_context
from aws_nx_poc_my_sql_db.models import ExampleModel
from mcp.server.fastmcp import FastMCP
from sqlmodel import select

mcp = FastMCP(
    name="PyProjectMcpServer",
    host="0.0.0.0",
    port=int(os.environ.get("PORT", 8000)),
    stateless_http=True,
)


@mcp.tool(name="listEntities", description="Lists entities stored in the MySQL database")
def list_entities() -> list[ExampleModel]:
    """List all example entities from MySQL"""
    with session_context("/opt/global-bundle.pem") as session:
        return list(session.exec(select(ExampleModel)).all())


@mcp.resource("example://context", description="Sample Guidance")
def sample_guidance() -> str:
    return """## Sample Guidance

This is some guidance in markdown format!"""
