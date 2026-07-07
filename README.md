# aws-nx-poc

Proof-of-concept Nx workspace ([@aws/nx-plugin-for-aws](https://awslabs.github.io/nx-plugin-for-aws)) built to explore the **`py#rdb`** generator: what it scaffolds for a Python service talking to a relational database on AWS, and the connection/SSL details that come with connecting to Aurora directly vs. through RDS Proxy.

## What this branch demonstrates

Two Aurora Serverless v2 clusters are generated with `py#rdb`:

- **`postgres_db`** — Aurora PostgreSQL, consumed via [psycopg](https://www.psycopg.org/) + [SQLModel](https://sqlmodel.tiangolo.com/).
- **`my_sql_db`** — Aurora MySQL, consumed via [PyMySQL](https://pymysql.readthedocs.io/) + SQLModel.

Each generated database package contains:

- `connection.py` — builds a SQLAlchemy engine, authenticating with **IAM database auth** (`rds.generate_db_auth_token`) rather than a static password.
- `migration_handler.py` — runs Alembic migrations (`alembic upgrade head`) from a Lambda, triggered once per deploy via a CDK `Trigger`.
- `create_db_user_handler.py` — a CloudFormation custom resource Lambda that creates/reconciles the least-privilege, IAM-authenticated application DB user.
- `Dockerfile.migration` / `Dockerfile.create-db-user` — both handlers run as container image Lambdas (`DockerImageFunction`), since Alembic/psycopg/PyMySQL don't need to ship as a zip.

The shared CDK construct for both databases is `AuroraDatabase` ([packages/common/constructs/src/core/rdb/aurora.ts](packages/common/constructs/src/core/rdb/aurora.ts)), instantiated per-engine by [`PostgresDb`](packages/common/constructs/src/app/dbs/postgres-db.ts) and [`MySqlDb`](packages/common/constructs/src/app/dbs/my-sql-db.ts).

### RDS Proxy vs. direct connection, and why SSL differs

`AuroraDatabase` takes an `enableRdsProxy` flag (see `DEV_DATABASE_PROPS` in [application-stack.ts](packages/infra/src/stacks/application-stack.ts)), and this is the crux of what the branch is illustrating:

- **Through RDS Proxy** (`enableRdsProxy: true`): the proxy presents a certificate chained to a publicly trusted root (Amazon Trust Services), so the default OS/`certifi` trust store verifies it fine. No extra CA handling needed.
- **Direct to the Aurora cluster endpoint** (`enableRdsProxy: false`, the current setting here): the cluster presents a certificate chained to a **private, self-signed "Amazon RDS \<region\> Root CA"** — never published to any public trust store. Verifying it (`sslmode=verify-full` for Postgres, `ssl_verify_cert=True, ssl_verify_identity=True` for MySQL) requires explicitly loading Amazon's [RDS CA bundle](https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem) as the trusted root.

That bundle is wired in two different ways depending on how the Lambda is packaged:

- **Container image Lambdas** (`CreateDbUserHandler`, `MigrationHandler`, `my_agent`, `mcp_server`): the bundle is fetched straight into the image via `ADD` in the Dockerfile and read from `/opt/global-bundle.pem` at runtime.
- **Zip-based Lambdas** (`api1`, `api2`): the bundle is mounted via a shared Lambda Layer, [`RdsCaLayer`](packages/common/constructs/src/core/rdb/rds-ca-layer.ts), which downloads the same bundle at synth/bundling time.

`get_engine(rds_ca=...)` in each `connection.py` accepts an optional CA path: pass it when connecting directly to the cluster, omit it (falls back to the system trust store) when going through the proxy.

## Consumers

Four different compute types connect to these databases, to cover the range of ways a Python service on AWS typically talks to RDS:

| Package | Type | Talks to |
| --- | --- | --- |
| [`api1`](packages/api1) | FastAPI on Lambda (`py#api`) | `postgres_db` |
| [`api2`](packages/api2) | FastAPI on Lambda (`py#api`) | `my_sql_db` |
| [`my_agent`](packages/py_project/aws_nx_poc_py_project/my_agent) | Bedrock AgentCore agent | `postgres_db` |
| [`mcp_server`](packages/py_project/aws_nx_poc_py_project/mcp_server) | Bedrock AgentCore MCP server | `my_sql_db` |

## Sandbox-only settings

`DEV_DATABASE_PROPS` in [application-stack.ts](packages/infra/src/stacks/application-stack.ts) intentionally disables deletion protection, credential rotation, RDS Proxy, and Performance Insights so the stack is cheap and fast to iterate on. Remove that override before treating any of this as a production reference.

## Common tasks

```sh
# Build a single project
pnpm nx build <project-name>

# Build everything
pnpm nx run-many --target build --all

# Run any target against a project
pnpm nx <target> <project-name>

# Lint (and autofix) everything
pnpm nx run-many --target lint --configuration=fix --all

# Deploy the sandbox stack
pnpm nx deploy infra
```

[Learn more about this workspace setup and the @aws/nx-plugin](https://awslabs.github.io/nx-plugin-for-aws).
