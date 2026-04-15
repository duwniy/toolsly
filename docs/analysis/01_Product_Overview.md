# 01. Product Overview: Toolsly

## Project Vision
**Toolsly** is an enterprise-grade automation system for tool rental businesses. It aims to streamline the lifecycle of tool management, from inventory tracking across multiple branches to reservation management and automated billing.

## Core Objectives
1. **Inventory Management**: Real-time tracking of tool instances (Items) and their specifications (Models).
2. **Multi-Branch Support**: Seamless operations across physical locations with storage capacity management.
3. **Resiliency & Performance**: Modern stack with Optimistic Locking for high-concurrency rental operations.
4. **Data Integrity**: Soft locks for reservations and automated State Machine for Order lifecycle.
5. **Pricing Engine**: Automated calculation with weekend markups and bulk discounts.

## Technology Stack
- **Backend**: Java 21 LTS, Spring Boot 3.2+
- **Frontend**: React 18+ (Vite, TypeScript, Tailwind CSS)
- **Database**: PostgreSQL (Persistence with UUIDs, Flyway for migrations)
- **Security**: Spring Security (JWT-based stateless auth)
- **Documentation**: Self-Documenting System (docs/analysis)

## Key Technical Requirements
- **Auditing**: Every entity must track `created_at`, `updated_at`, `created_by`, `updated_by`.
- **Identity**: Usage of `UUID` (v7 preferred or standard v4) for all primary keys to ensure global uniqueness and security.
- **API First**: RESTful API design with comprehensive Swagger/OpenAPI documentation.
