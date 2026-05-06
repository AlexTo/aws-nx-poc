# ts-rdb-terraform

## Local development

### 1. Build

```sh
pnpm build
```

### 2. Run database migrations

Run migrations against both local databases (each command starts its Docker container automatically):

```sh
pnpm exec nx run @aws-nx-poc/mysqldb:prisma migrate dev
pnpm exec nx run @aws-nx-poc/postgresdb:prisma migrate dev
```

### 3. Start the app

Starts the website, API, and both databases:

```sh
pnpm exec nx run @aws-nx-poc/website:serve-local
```

## AWS deployment

Infrastructure is managed with Terraform via Nx targets. The stack includes a VPC, Aurora Serverless v2 clusters (MySQL + PostgreSQL) with RDS Proxy, API Lambda, CloudFront website, and AppConfig runtime config.

### Prerequisites

- AWS credentials configured in your environment (e.g. via `aws sso login` or assumed role)
- Docker running (required to build and push migration handler images)
- `terraform` CLI installed

### 1. Bootstrap

Creates the S3 bucket used for Terraform remote state. Only needed once per AWS account/region.

```sh
pnpm exec nx run @ts-rdb-terraform/infra:bootstrap
```

### 2. Deploy

Builds all assets, runs `terraform plan`, then `terraform apply`:

```sh
pnpm exec nx run @ts-rdb-terraform/infra:deploy
```

To target a specific environment (defaults to `dev`):

```sh
pnpm exec nx run @ts-rdb-terraform/infra:deploy --configuration=dev
```

### 3. Destroy

```sh
pnpm exec nx run @ts-rdb-terraform/infra:destroy
```

### State locking

Remote state uses S3 native locking (`use_lockfile = true`). If a previous run was interrupted and left a stale lock, force-unlock with the ID shown in the error:

```sh
cd packages/infra/src
terraform force-unlock -force <LOCK_ID>
```
