# Production Setup Guide

Instructions for deploying the Toolsly platform to Render (Backend) and Vercel (Frontend).

## 1. Backend Deployment (Render)

1. **Create New Web Service**: Connect your Toolsly repository.
2. **Environment**: Select `Docker`.
3. **Region**: Choose the one closest to your Supabase instance.
4. **Environment Variables**:
    - `SPRING_PROFILES_ACTIVE`: `prod`
    - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require`
    - `SPRING_DATASOURCE_USERNAME`: `postgres.liavyzwqrmprnituzktw`
    - `SPRING_DATASOURCE_PASSWORD`: Your Database Password (the one you set during project creation).
    - `APPLICATION_SECURITY_JWT_SECRET_KEY`: A long random string for token signing.
    - `ALLOWED_ORIGINS`: Your Vercel domain (e.g., `https://toolsly-web.vercel.app`).
    - `PORT`: 8080 (Render sets this automatically).

## 2. Frontend Deployment (Vercel)

1. **Import Project**: Select the `web` directory as the root.
2. **Framework Preset**: `Vite`.
3. **Environment Variables**:
    - `VITE_API_URL`: Your Render service URL (e.g., `https://toolsly-api.onrender.com`).

## 3. Database (Supabase)

1. Ensure the database is accessible from the Render IP range (or allow all IPs during initial setup).
2. The `prod` profile will automatically run Flyway migrations on startup to ensure the schema is correct.
3. **Supabase Agent Skills (Optional)**:
   - For improved tool efficiency, you can run: `npx skills add supabase/agent-skills`.

## 4. Configuration Sheet Summary

| Variable | Platform | Description |
|----------|----------|-------------|
| `SPRING_PROFILES_ACTIVE` | Render | Set to `prod` |
| `SPRING_DATASOURCE_URL` | Render | `jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Render | `postgres.liavyzwqrmprnituzktw` |
| `SPRING_DATASOURCE_PASSWORD` | Render | Your Supabase Database Password |
| `APPLICATION_SECURITY_JWT_SECRET_KEY` | Render | Secure JWT Key |
| `ALLOWED_ORIGINS` | Render | Vercel URL (for CORS) |
| `VITE_API_URL` | Vercel | Render API URL |
