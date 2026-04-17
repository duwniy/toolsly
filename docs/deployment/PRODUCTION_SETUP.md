# Production Setup Guide

Instructions for deploying the Toolsly platform to Render (Backend) and Vercel (Frontend).

## 1. Backend Deployment (Render)

1. **Create New Web Service**: Connect your Toolsly repository.
2. **Environment**: Select `Docker`.
3. **Region**: Choose the one closest to your Supabase instance.
4. **Environment Variables**:
    - `SPRING_PROFILES_ACTIVE`: `prod`
    - `SPRING_DATASOURCE_URL`: Your Supabase connection string (`jdbc:postgresql://...`)
    - `SPRING_DATASOURCE_USERNAME`: Supabase user (usually `postgres`)
    - `SPRING_DATASOURCE_PASSWORD`: Supabase password.
    - `JWT_SECRET`: A long random string for token signing.
    - `ALLOWED_ORIGINS`: Your Vercel domain (e.g., `https://toolsly-web.vercel.app`).
    - `PORT`: 8080 (Render usually sets this automatically).

## 2. Frontend Deployment (Vercel)

1. **Import Project**: Select the `web` directory as the root.
2. **Framework Preset**: `Vite`.
3. **Environment Variables**:
    - `VITE_API_URL`: Your Render service URL (e.g., `https://toolsly-api.onrender.com`).

## 3. Database (Supabase)

1. Ensure the database is accessible from the Render IP range (or allow all IPs during initial setup).
2. The `prod` profile will automatically run Flyway migrations on startup to ensure the schema is correct.

## 4. Configuration Sheet Summary

| Variable | Platform | Description |
|----------|----------|-------------|
| `SPRING_PROFILES_ACTIVE` | Render | Set to `prod` |
| `SPRING_DATASOURCE_URL` | Render | Supabase JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Render | Supabase User |
| `SPRING_DATASOURCE_PASSWORD` | Render | Supabase Password |
| `JWT_SECRET` | Render | Secure JWT Key |
| `ALLOWED_ORIGINS` | Render | Vercel URL (for CORS) |
| `VITE_API_URL` | Vercel | Render API URL |
