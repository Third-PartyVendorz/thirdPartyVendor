FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Copy the pom first and download dependencies as their own layer - Docker
# caches this layer and skips re-downloading the entire dependency tree
# every time only the source code changes (Sprint 1's caching idea, applied
# to a Dockerfile instead of a CI pipeline).
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# Stage 2: run. A JRE (no compiler, no Maven, no build tools) - smaller
# image, smaller attack surface. Only the built jar crosses the boundary
# between stages; the Maven layer above never ships.
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /build/target/api-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
