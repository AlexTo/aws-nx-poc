from aws_nx_poc_api.main import app
import json
import os
import sys

os.makedirs(os.path.dirname(sys.argv[1]), exist_ok=True)
with open(sys.argv[1], "w") as f:
    json.dump(app.openapi(), f)
