from collections.abc import Generator
from typing import Annotated

from aws_nx_poc_my_sql_db.connection import get_session
from fastapi import Depends
from sqlmodel import Session


def get_session_dep() -> Generator[Session]:
    # Pass rds_ca if connecting directly to the RDS cluster without an RDS Proxy.
    yield from get_session()


SessionDep = Annotated[Session, Depends(get_session_dep)]
