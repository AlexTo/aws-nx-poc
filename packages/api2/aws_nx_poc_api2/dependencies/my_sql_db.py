from collections.abc import AsyncGenerator
from typing import Annotated

from aws_nx_poc_my_sql_db.connection import session_context
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession


async def get_session() -> AsyncGenerator[AsyncSession]:
    async with session_context() as session:
        yield session


MySqlDbSession = Annotated[AsyncSession, Depends(get_session)]
