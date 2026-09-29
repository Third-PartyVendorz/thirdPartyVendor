#!/usr/bin/env bash
set -euo pipefail

NETWORK=tpv-net
POSTGRES=tpv-postgres
POSTGRES_IMAGE=postgres:17
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=tpvdb
POSTGRES_PORT=5432
SERVICE_IMAGE=thirdparty:latest
SERVICE_CONTAINER=tpv-api
SERVICE_PORT=8081
APP_JWT_SECRET=3deb18f27146742f1d6d7ccd218818bb1ee80ca7ce2b5737d70a391fdf226c54
APP_JWT_EXPIRATION_MS=86400000


cleanup() {
  echo "== Teardown =="
  docker rm -f "$POSTGRES" "$SERVICE_CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT


echo "== Stage: Network =="
docker network create "$NETWORK" >/dev/null 2>&1 || true


echo "== Start Postgres Container =="
docker run -d \
  --name "$POSTGRES" \
  --network "$NETWORK" \
  -e POSTGRES_USER="$POSTGRES_USER" \
  -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  -e POSTGRES_DB="$POSTGRES_DB" \
  -p "$POSTGRES_PORT":5432 \
  "$POSTGRES_IMAGE" >/dev/null 2>&1


echo "== Stage: Build Images =="
docker rmi "$SERVICE_IMAGE" >/dev/null 2>&1 || true
docker build -t "$SERVICE_IMAGE" .


echo "== Stage: Run Containers =="
docker rm -f "$SERVICE_CONTAINER" >/dev/null 2>&1 || true
docker run -d \
  -p "$SERVICE_PORT":8081 \
  --network "$NETWORK" \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://$POSTGRES:5432/$POSTGRES_DB \
  -e SPRING_DATASOURCE_USERNAME="$POSTGRES_USER" \
  -e SPRING_DATASOURCE_PASSWORD="$POSTGRES_PASSWORD" \
  -e APP_JWT_SECRET="$APP_JWT_SECRET" \
  -e APP_JWT_EXPIRATION_MS="$APP_JWT_EXPIRATION_MS" \
  --name "$SERVICE_CONTAINER" \
  "$SERVICE_IMAGE"











echo "== Stage: Wait for Service =="
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:$SERVICE_PORT/orders" \
    -H "Content-Type: application/json" -d '{}' || true)
  if [ "$code" != "000" ]; then break; fi
  sleep 2
done

echo "== Stage: Service Ready =="
if [ "$code" = "000" ]; then
  echo "Service did not start in time"
  exit 1
else
  echo "Service is up and running"
fi





