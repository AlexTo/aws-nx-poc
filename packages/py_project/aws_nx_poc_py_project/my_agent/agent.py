from contextlib import contextmanager

from aws_nx_poc_agent_connection import (
    PyProjectMcpServerClientStrands,
    log_model_errors,
)
from aws_nx_poc_postgres_db.connection import session_context
from aws_nx_poc_postgres_db.models import ExampleModel
from sqlmodel import select
from strands import Agent, tool


@tool(name="listPostgresEntities")
def list_postgres_entities() -> list[ExampleModel]:
    """List entities stored in the Postgres database"""
    with session_context("/opt/global-bundle.pem") as session:
        return list(session.exec(select(ExampleModel)).all())


@contextmanager
def get_agent():
    py_project_mcp_server = PyProjectMcpServerClientStrands.create()
    with py_project_mcp_server:
        yield Agent(
            name="MyAgent",
            description="MyAgent Strands Agent",
            system_prompt="""
You are an assistant that helps users explore entities stored in the Postgres and MySQL databases.
Use your tools to answer questions about the entities stored there.
""",
            tools=[list_postgres_entities, *py_project_mcp_server.list_tools_sync()],
            hooks=[log_model_errors],
        )
