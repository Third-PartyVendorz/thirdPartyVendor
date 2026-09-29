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
  docker exec "$POSTGRES" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
    DELETE FROM orders WHERE user_id IN (SELECT user_id FROM users WHERE email = 'LukeBSheldonB@example.com');
    DELETE FROM users WHERE email = 'LukeBSheldonB@example.com';
  " >/dev/null 2>&1 || true
  # Clean up Docker containers and images
  docker rm -f "$POSTGRES" "$SERVICE_CONTAINER" >/dev/null 2>&1 || true
  docker network rm "$NETWORK" >/dev/null 2>&1 || true
  docker rmi "$SERVICE_IMAGE" >/dev/null 2>&1 || true
}
trap cleanup EXIT


echo "== Stage: Network =="
docker network rm "$NETWORK" >/dev/null 2>&1 || true
docker network create "$NETWORK" >/dev/null 2>&1 || true


echo "== Start Postgres Container =="
docker rm -f "$POSTGRES" >/dev/null 2>&1 || true
docker run -d \
  --name "$POSTGRES" \
  --network "$NETWORK" \
  -e POSTGRES_USER="$POSTGRES_USER" \
  -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  -e POSTGRES_DB="$POSTGRES_DB" \
  -p "$POSTGRES_PORT":5432 \
  "$POSTGRES_IMAGE" >/dev/null 2>&1


echo "== Stage: Build Service Image =="
docker rmi "$SERVICE_IMAGE" >/dev/null 2>&1 || true
docker build -t "$SERVICE_IMAGE" .


echo "== Stage: Run Service Container =="
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
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:$SERVICE_PORT/auth/authenticate" \
    -H "Content-Type: application/json" -d '{}' || true)
  if [ "$code" != "000" ]; then break; fi
  echo "Attempt $i/30: Service health check returned $code, retrying..."
  sleep 2
done


echo "== Stage: Service Ready =="
if [ "$code" = "000" ]; then
  echo "Service did not start in time (health check returned: $code)"
  exit 1
else
  echo "Service is up and running (health check returned: $code)"
fi


echo "== Stage: End-to-End Authenticated Order =="
echo "== Register User =="
curl -X POST http://localhost:$SERVICE_PORT/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Luke",
    "lastName": "Sheldon",
    "phoneNumber": "745-3383",
    "dateOfBirth": "2004-01-01",
    "email": "LukeBSheldonB@example.com",
    "password": "SecurePassword123!"
  }'
echo "== User Registered =="

echo "== Authenticate User =="
TOKEN=$(curl -s -X POST http://localhost:$SERVICE_PORT/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "LukeBSheldonB@example.com",
    "password": "SecurePassword123!"
  }' | jq -r '.jwtToken')
echo "== User Authenticated =="

echo "== Stage: Create Order =="
curl -X POST http://localhost:$SERVICE_PORT/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "assetId": 10,
    "orderIntent": "BUY",
    "quantity": 100,
    "orderPrice": null,
    "orderCurrency": "USD"
  }'
echo "== Order Created =="

echo "== Stage: Confirm It Actually Landed in Postgres =="
docker exec -it $POSTGRES psql -U $POSTGRES_USER -d "$POSTGRES_DB" -c "SELECT o.*, u.* FROM orders o JOIN users u ON o.user_id = u.user_id WHERE u.email = 'lukebsheldonb@example.com';"
echo "== Confirmed Orders in Postgres =="