FROM maven:3.9.11-eclipse-temurin-21 AS builder
WORKDIR /workspace

COPY . .

# Shared Maven cache mount: dependencies download once and are reused by every service image
RUN --mount=type=cache,target=/root/.m2 mvn clean package -pl review-service -am -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl wget && \
    addgroup -S skillinfinity && adduser -S skillinfinity -G skillinfinity

WORKDIR /app
COPY --from=builder /workspace/review-service/target/review-service-1.0.0-SNAPSHOT.jar /app/app.jar

ENV JAVA_OPTS="-XX:+UseG1GC \
    -XX:MaxRAMPercentage=50.0 \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/tmp/heapdump.hprof \
    -Djava.security.egd=file:/dev/./urandom \
    -Dfile.encoding=UTF-8 \
    -Dnetworkaddress.cache.ttl=60 \
    -Dnetworkaddress.cache.negative.ttl=10"

EXPOSE 8089
USER skillinfinity

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8089/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
