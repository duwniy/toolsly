# Frontend Architecture: Toolsly (React + Vite)

This document defines the architectural standards for the Toolsly web application.

## 📁 Directory Structure
```
web/
├── src/
│   ├── api/            # Axios instance, interceptors, and API hooks
│   ├── components/     # Reusable UI components (atoms, molecules)
│   ├── config/         # App constants, environment variables
│   ├── context/        # React Context providers (Auth, Theme)
│   ├── hooks/          # Custom utility hooks
│   ├── layouts/        # Page layouts (Main, Admin, Auth)
│   ├── pages/          # Page-level components
│   ├── types/          # TypeScript interfaces/types
│   ├── utils/          # Helper functions
│   └── main.tsx        # Entry point
```

## 🎨 Design System: Monochrome Premium
- **Primary Palette**: Deep Blacks (`#000000`), Clean Whites (`#FFFFFF`), and nuanced Grays (`#1A1A1A`, `#F5F5F5`).
- **Accent**: Subtle Slate or Blue for interactive elements (`#3B82F6`).
- **Typography**: Inter (Sans-serif) for high readability.

## 🔄 State Management
- **Server State**: `TanStack Query` (React Query) for fetching, caching, and syncing.
- **Global UI State**: React Context API (Auth, Notifications).
- **Local State**: `useState` / `useReducer`.

## 📡 API Layer
- **Axios**: Configured with a base URL and an interceptor to automatically attach the JWT token from `localStorage`.
- **Hooks**: Use custom hooks for each entity (e.g., `useOrders()`, `useEquipment()`).

## 🛠️ Component Naming
- Use **PascalCase** for components (`Button.tsx`, `OrderGrid.tsx`).
- Use **camelCase** for hooks (`useAuth.ts`) and utils.
- Components should be modular and follow the Single Responsibility Principle.
