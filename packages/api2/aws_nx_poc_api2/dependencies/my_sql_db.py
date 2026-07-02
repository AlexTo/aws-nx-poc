from typing import Annotated

from aws_nx_poc_my_sql_db.connection import get_session
from fastapi import Depends
from sqlmodel import Session

SessionDep = Annotated[Session, Depends(get_session)]
