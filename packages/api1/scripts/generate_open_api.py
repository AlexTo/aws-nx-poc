import json
import os
import sys

from aws_nx_poc_api1.main import app

os.makedirs(os.path.dirname(sys.argv[1]), exist_ok=True)
with open(sys.argv[1], "w") as f:
    json.dump(app.openapi(), f)
