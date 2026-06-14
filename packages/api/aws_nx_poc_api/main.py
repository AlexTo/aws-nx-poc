import uvicorn
from pydantic import BaseModel

from .init import app, tracer


class EchoOutput(BaseModel):
    message: str


@app.get("/echo")
@tracer.capture_method
def echo(message: str) -> EchoOutput:
    return EchoOutput(message=f"{message}")


if __name__ == "__main__":
    uvicorn.run("aws_nx_poc_api.main:app", port=8000)
