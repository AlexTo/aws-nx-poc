from collections.abc import AsyncGenerator
from typing import Annotated

from aws_nx_poc_my_sql_db.connection import session_context
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession


async def get_session_dep() -> AsyncGenerator[AsyncSession]:
    async with session_context() as session:
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_session_dep)]
