import uuid

import uvicorn
from aws_nx_poc_py_dynamo_db.entities import ExampleModel
from pydantic import BaseModel

from .init import app, tracer


class ExampleItem(BaseModel):
    id: str
    name: str
    category: str
    created_at: str
    updated_at: str


class AddExampleInput(BaseModel):
    name: str
    category: str


@app.get("/examples")
@tracer.capture_method
def list_examples() -> list[ExampleItem]:
    return [
        ExampleItem(
            id=item.pk.removeprefix("EXAMPLE#"),
            name=item.name,
            category=item.category,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        for item in ExampleModel.list_by_date()
    ]


@app.post("/examples", status_code=201)
@tracer.capture_method
def add_example(body: AddExampleInput) -> ExampleItem:
    item = ExampleModel.create(
        id=str(uuid.uuid4()),
        name=body.name,
        category=body.category,
    )
    return ExampleItem(
        id=item.pk.removeprefix("EXAMPLE#"),
        name=item.name,
        category=item.category,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


if __name__ == "__main__":
    uvicorn.run("aws_nx_poc_api.main:app", port=8000)
