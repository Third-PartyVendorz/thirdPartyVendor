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


