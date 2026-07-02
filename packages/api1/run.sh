#!/bin/bash
exec python -m uvicorn aws_nx_poc_api1.main:app --host 0.0.0.0 --port ${PORT:-8000}
