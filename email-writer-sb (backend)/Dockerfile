# Use a lightweight, production-grade JRE
FROM openjdk:17-slim

# Create a work directory inside the container
WORKDIR /app

# Copy your already-built jar from the target folder
COPY target/*.jar app.jar

# Expose the port your Spring Boot app uses
EXPOSE 8080

# Optional JVM flags (can be overridden from Render env vars)
ENV JAVA_OPTS=""

# Start the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
