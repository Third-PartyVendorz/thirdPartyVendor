# thirdPartyVendor
Trading app designed and developed by Third Party Vendor


Steps to set up db locally

docker pull postgres:17

docker run -d \
--name tpv-postgres \
-e POSTGRES_DB=tpvDB \
-e POSTGRES_USER=postgres \
-e POSTGRES_PASSWORD=postgres \
-p 5432:5432 \
postgres:17

make sure it exists by running docker ps

make sure to pull everytine you start working to get latest db changes
