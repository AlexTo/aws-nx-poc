from typing import Annotated

import uvicorn
from aws_nx_poc_my_sql_db.models import ExampleModel
from fastapi import HTTPException, Query
from pydantic import BaseModel
from sqlmodel import select

from .dependencies.my_sql_db import MySqlDbSession
from .init import app, tracer


class EchoOutput(BaseModel):
    message: str


@app.get("/echo")
@tracer.capture_method
def echo(message: Annotated[str, Query(max_length=1024)]) -> EchoOutput:
    return EchoOutput(message=f"{message}")


class ExampleInput(BaseModel):
    name: str
    description: str | None = None


@app.get("/examples", name="listExamples")
@tracer.capture_method
async def list_examples(session: MySqlDbSession) -> list[ExampleModel]:
    result = await session.execute(select(ExampleModel))
    return list(result.scalars().all())


@app.post("/examples", name="addExample")
@tracer.capture_method
async def add_example(example: ExampleInput, session: MySqlDbSession) -> ExampleModel:
    db_example = ExampleModel(name=example.name, description=example.description)
    session.add(db_example)
    await session.commit()
    await session.refresh(db_example)
    return db_example


@app.delete("/examples/{example_id}", name="deleteExample", status_code=204)
@tracer.capture_method
async def delete_example(example_id: int, session: MySqlDbSession) -> None:
    example = await session.get(ExampleModel, example_id)
    if not example:
        raise HTTPException(status_code=404, detail="Example not found")
    await session.delete(example)
    await session.commit()


if __name__ == "__main__":
    uvicorn.run("aws_nx_poc_api2.main:app", port=8000)
