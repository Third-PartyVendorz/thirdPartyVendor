# thirdPartyVendor

Trading app designed and developed by Third Party Vendor

## Local Setup

### 1. Start Postgres

```bash
docker pull postgres:17

docker run -d \
  --name tpv-postgres \
  -e POSTGRES_DB=tpvdb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:17
```

If the database doesn't get created automatically, run:

```bash
docker exec -it tpv-postgres psql -U postgres -c "CREATE DATABASE tpvdb;"
```

### 2. Run the app

```bash
cd api
mvn spring-boot:run
```

> Make sure to `git pull` every time you start working to get the latest DB migrations.

### 3. Access Database

```bash
docker exec -it tpv-postgres psql -U postgres

\c tpvdb
```

## Updating the Database Schema (Flyway)

Schema changes are managed with Flyway migration files in `api/src/main/resources/db/migration`. Flyway runs automatically on app startup and applies any migrations that haven't been run yet.

To make a schema change:

1. Add a new file in `db/migration` named with the next version number, e.g. `V5__add_notes_to_holdings.sql` (versions must always increase, never reuse or edit an old one).
2. Write the SQL for your change in that file. One file can contain multiple statements if they belong to the same change.
3. Run `mvn spring-boot:run` (or `mvn clean spring-boot:run` if you renamed/deleted any migration files) to apply it.

**Rules:**
- Never edit or rename a migration file that has already been run against a shared database — Flyway tracks applied migrations by version and checksum, and changing a file afterwards will break it.
- If you renamed or deleted a migration file locally, run `mvn clean` before restarting so stale copies in `target/classes` don't get applied alongside the new one.


