FROM maven:3.9.11-eclipse-temurin-21 AS builder
WORKDIR /workspace

COPY . .

RUN mvn clean package -pl identity-service -am -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl wget && \
    addgroup -S skillinfinity && adduser -S skillinfinity -G skillinfinity

WORKDIR /app
COPY --from=builder /workspace/identity-service/target/identity-service-1.0.0-SNAPSHOT.jar /app/app.jar

# JVM optimization flags
ENV JAVA_OPTS="-XX:+UseZGC \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+UseStringDeduplication \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/tmp/heapdump.hprof \
    -Djava.security.egd=file:/dev/./urandom \
    -Dfile.encoding=UTF-8 \
    -Dnetworkaddress.cache.ttl=60 \
    -Dnetworkaddress.cache.negative.ttl=10"

EXPOSE 8081
USER skillinfinity

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8081/actuator/health/liveness || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
