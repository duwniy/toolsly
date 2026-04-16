# 🔧 Toolsly — Tools Rental Automation System

A full-stack application for managing industrial tool rentals, including order processing, inventory tracking, pricing engine, branch logistics, and penalty calculations.

## Tech Stack

| Layer     | Technology                                        |
|-----------|---------------------------------------------------|
| Backend   | Spring Boot 3.2, Java 21, Spring Security, JPA    |
| Frontend  | React 18, TypeScript, Vite, TailwindCSS, Recharts |
| Database  | PostgreSQL 16, Flyway migrations                  |
| DevOps    | Docker, Docker Compose                            |

## Quick Start

### Prerequisites
- **Java 21** (or Docker)
- **Node.js 18+** and **npm**
- **PostgreSQL 16** (or use Docker Compose)

### Option 1: Docker Compose (recommended)

```bash
# Clone and start everything
docker compose up -d

# Backend will be at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
```

### Option 2: Local Development

#### 1. Database
Ensure PostgreSQL is running and create a `.env` file at the project root:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/toolsly
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver
application.security.jwt.secret-key=your_jwt_secret_hex
application.security.jwt.expiration=86400000
```

#### 2. Backend
```bash
./mvnw spring-boot:run
```

#### 3. Frontend
```bash
cd web
npm install
npm run dev
# Frontend at http://localhost:5173
```

## API Documentation

Once the backend is running, interactive API docs are available via Swagger:

- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## Business Rules

| Rule            | Description                                                     |
|-----------------|-----------------------------------------------------------------|
| Damage Penalty  | 10% of market value for WORN, 50% for BROKEN items              |
| Overdue Penalty | +50% of daily rental rate for each overdue day                   |
| Capacity Check  | Returns are blocked if target branch storage is at full capacity |
| Optimistic Lock | Concurrent order modifications are rejected with a 409 Conflict  |

## Project Structure

```
toolsly/
├── src/main/java/com/duwniy/toolsly/
│   ├── controller/     # REST controllers + GlobalExceptionHandler
│   ├── entity/         # JPA entities
│   ├── repository/     # Spring Data JPA repositories
│   ├── service/        # Business logic
│   ├── security/       # JWT auth & Spring Security config
│   └── config/         # Application configuration
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/   # Flyway SQL migrations
├── web/                # React frontend (Vite + TypeScript)
├── docs/               # Project documentation & analysis
├── Dockerfile
├── docker-compose.yml
└── pom.xml
```

## License

Private project — all rights reserved.
