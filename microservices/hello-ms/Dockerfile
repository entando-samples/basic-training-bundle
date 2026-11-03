# Recipe for the container image that Entando runs in the cluster.
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/hello-ms.jar app.jar
# Entando expects every microservice on port 8081.
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
