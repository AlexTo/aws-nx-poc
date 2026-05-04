# aws-nx-poc

## Local development

### 1. Build

```sh
pnpm build
```

### 3. Run database migrations

Run migrations against both local databases (each command starts its Docker container automatically):

```sh
pnpm exec nx run @aws-nx-poc/mysqldb:prisma migrate dev
pnpm exec nx run @aws-nx-poc/postgresdb:prisma migrate dev
```

### 4. Start the app

Starts the website, API, and both databases:

```sh
pnpm exec nx run @aws-nx-poc/website:serve-local
```
