FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml ../pom.xml
COPY common/pom.xml ../common/pom.xml
COPY common/src ../common/src
COPY discovery-server/pom.xml discovery-server/pom.xml
COPY discovery-server/src discovery-server/src
RUN cd .. && mvn clean install -pl discovery-server -am -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl wget && \
    addgroup -S skillinfinity && adduser -S skillinfinity -G skillinfinity

WORKDIR /app
COPY --from=builder /app/discovery-server/target/*.jar app.jar

ENV JAVA_OPTS="-XX:+UseZGC \
    -XX:MaxRAMPercentage=75.0 \
    -Djava.security.egd=file:/dev/./urandom \
    -Dfile.encoding=UTF-8"

EXPOSE 8761
USER skillinfinity

HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
    CMD wget -qO- http://localhost:8761/actuator/health/liveness || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
