# ─────────────────────────────────────────────
# STAGE 1: Build
# Maven + JDK 17 compiles and packages the app.
# This stage is discarded — only the JAR is kept.
# ─────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml first — Docker caches this layer.
# Dependencies are only re-downloaded if pom.xml changes.
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build the fat JAR (skipping tests —
# tests run in the Jenkins pipeline, not in Docker build)
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─────────────────────────────────────────────
# STAGE 2: Run
# Minimal JRE-only image — no Maven, no source.
# Results in a much smaller production image.
# ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Non-root user — security best practice
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only the compiled fat JAR from stage 1
# Matches artifactId=task-manager, version=1.0.0 from pom.xml
COPY --from=build /app/target/task-manager-1.0.0.jar app.jar

USER appuser

# App runs on plain HTTP — Nginx handles TLS externally
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
