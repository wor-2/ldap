<div align="center">

# 🛡️ AD Manager

### Active Directory Super User Management System

[![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk&logoColor=white)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen?logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

A production-grade **Active Directory management platform** that lets a Super User create AD groups, manage user accounts, assign fine-grained permissions, and audit every action — all through a stunning dark glassmorphism UI.

</div>

---

## Architecture

```
Browser (React Vite :3000 / nginx :80 prod)
        │  Bearer JWT
        ▼
Spring Boot REST API (:8080)
  ├── LDAPS :636 ──► OpenLDAP (Users / Groups / SuperUsers OUs)
  └── JDBC  ──────► PostgreSQL 16 (permissions / audit_logs / app_users)
```

---

## Features

| Category | Feature |
|----------|---------|
| 🔐 Authentication | LDAP bind via LDAPS, JWT (24 h), stateless |
| 👥 AD Groups | Create, search, delete; add / remove members |
| 👤 AD Users | List, search, create accounts; view groups + permissions |
| 🔑 Permissions | 12 built-in types; custom permissions; assign with expiry; revoke |
| 📋 Audit Log | Full history; searchable; paginated; live 30-second refresh |
| 📊 Dashboard | Real-time counts; activity feed; quick-action tiles |
| 🚀 Production | Multi-stage Docker builds; nginx SPA; health checks; env-var secrets |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend language | Java 17 |
| Backend framework | Spring Boot 3.2.5 |
| Security | Spring Security + jjwt 0.12.3 |
| LDAP SDK | UnboundID LDAP SDK 6.0.11 |
| ORM | Spring Data JPA / Hibernate 6 |
| Database | PostgreSQL 16 |
| Connection pool | HikariCP |
| Monitoring | Spring Boot Actuator |
| Frontend framework | React 18 + Vite 5 |
| Routing | React Router DOM 6 |
| State | Zustand 4.4 (persisted) |
| HTTP | Axios 1.6 |
| Icons | Lucide React |
| CSS | Vanilla CSS — glassmorphism design system |
| Containerisation | Docker Compose (dev + prod) |
| Prod web server | nginx:alpine |

---

## Project Structure

```
h:/ldap/
├── docker-compose.yml          ← Dev: OpenLDAP + PostgreSQL + admin UIs
├── docker-compose.prod.yml     ← Prod overrides: backend + frontend containers
├── .env.example                ← Template — copy to .env
├── .gitignore
├── README.md
├── ldap/bootstrap/
│   └── 01-structure.ldif       ← Initial OUs + superuser + sample users + groups
├── backend/
│   ├── Dockerfile              ← Multi-stage production image
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/admanager/
│       │   ├── config/         ← LDAP pool, JWT, Security filter chain
│       │   ├── model/          ← AppUser, Permission, UserPermission, AuditLog
│       │   ├── dto/            ← Request + Response DTOs
│       │   ├── repository/     ← JPA repositories
│       │   ├── service/        ← LDAP ops, auth, permissions, audit
│       │   ├── controller/     ← REST endpoints
│       │   └── exception/      ← Global error handler
│       └── resources/
│           ├── application.properties          ← Dev config
│           ├── application-prod.properties     ← Prod config (env-var driven)
│           └── data.sql                        ← 12 permission seed rows
└── frontend/
    ├── Dockerfile              ← node build → nginx serve
    ├── nginx.conf              ← SPA routing + API proxy + gzip
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── store/authStore.js
        ├── services/           ← auth, group, user, permission, audit, dashboard
        ├── components/         ← Layout, Modal, Toast, StatsCard, ProtectedRoute
        ├── pages/              ← Login, Dashboard, Groups, GroupDetail, Users,
        │                          Permissions, Audit
        └── styles/global.css   ← Full design system (600+ lines)
```

---

## Quick Start — Development

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Java 17 — [adoptium.net](https://adoptium.net/)
- Maven 3.9+ — [maven.apache.org](https://maven.apache.org/download.cgi)
- Node.js 18+ — [nodejs.org](https://nodejs.org/)

### 1. Start Infrastructure

```powershell
cd h:\ldap
docker compose up -d
docker compose ps          # wait until all show "Up"
```

Starts: OpenLDAP (:389/:636), phpLDAPadmin (:8081), PostgreSQL (:5432), pgAdmin (:5050)

### 2. Start Backend

```powershell
cd h:\ldap\backend
mvn spring-boot:run
```

Backend at **http://localhost:8080** — verify: `curl http://localhost:8080/actuator/health`

### 3. Start Frontend

```powershell
cd h:\ldap\frontend
npm install
npm run dev
```

App at **http://localhost:3000** — login with `superuser` / `Admin@1234`

---

## Production Deployment

### 1. Prepare Secrets

```powershell
copy h:\ldap\.env.example h:\ldap\.env
# Edit .env — set all passwords and generate JWT_SECRET:
# openssl rand -base64 64
```

### 2. Build & Launch

```powershell
cd h:\ldap
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env up -d --build
```

Starts everything including the compiled backend and nginx-served frontend.

| Service | URL |
|---------|-----|
| App | http://localhost |
| Backend API | http://localhost:8080 |
| phpLDAPadmin | https://localhost:8081 |
| pgAdmin | http://localhost:5050 |
| Backend health | http://localhost:8080/actuator/health |

---

## Configuration Reference

### Key Environment Variables

| Variable | Dev Default | Description |
|----------|-------------|-------------|
| `LDAP_HOST` | `localhost` | LDAP server host |
| `LDAP_PORT` | `636` | LDAPS port |
| `LDAP_BIND_DN` | `cn=admin,dc=admanager,dc=local` | Admin DN |
| `LDAP_BIND_PASSWORD` | `Admin@1234` | Admin password |
| `LDAP_BASE_DN` | `dc=admanager,dc=local` | Search base |
| `POSTGRES_DB` | `admanagerdb` | Database name |
| `POSTGRES_USER` | `admanager` | DB username |
| `POSTGRES_PASSWORD` | `AdManager@1234` | DB password |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/admanagerdb` | Full JDBC URL |
| `JWT_SECRET` | (dev default) | Base64 HMAC secret (min 32 bytes) |
| `JWT_EXPIRATION_MS` | `86400000` | Token TTL (default 24 h) |
| `SPRING_PROFILES_ACTIVE` | — | Set to `prod` in production |

### Connecting to Real Active Directory

```env
LDAP_HOST=dc.company.com
LDAP_PORT=636
LDAP_BIND_DN=CN=SvcAccount,OU=Service Accounts,DC=company,DC=com
LDAP_BIND_PASSWORD=YourPassword
LDAP_BASE_DN=DC=company,DC=com
```

Also update `ldap.users-ou`, `ldap.groups-ou` in `application.properties`.

> **Note**: Real AD uses `sAMAccountName` not `uid`. Update the LDAP filter in `AuthService.java`.

---

## API Reference

All endpoints require `Authorization: Bearer <JWT>` except `/api/auth/**`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | LDAP bind → returns JWT |
| `GET` | `/api/auth/me` | Current user info |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Counts: users, groups, permissions, audit entries |

### Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/groups?q=` | List / search groups |
| `POST` | `/api/groups` | Create group |
| `DELETE` | `/api/groups/{dn}` | Delete group |
| `GET` | `/api/groups/{dn}/members` | List member DNs |
| `POST` | `/api/groups/{dn}/members` | Add member `{userDn}` |
| `DELETE` | `/api/groups/{dn}/members?userDn=` | Remove member |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users?q=` | List / search users |
| `GET` | `/api/users/{username}` | User + groups + permissions |
| `POST` | `/api/users` | Create LDAP user |

### Permissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/permissions` | Catalog |
| `POST` | `/api/permissions` | Create permission |
| `DELETE` | `/api/permissions/{id}` | Delete |
| `POST` | `/api/permissions/assign` | Assign to user |
| `DELETE` | `/api/permissions/assign/{id}` | Revoke |
| `GET` | `/api/permissions/user/{uid}` | User's active permissions |

### Audit

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/audit?page=0&size=20&search=` | Paginated audit log |

### Health (Actuator)

| Endpoint | Description |
|----------|-------------|
| `GET /actuator/health` | Service health |
| `GET /actuator/info` | Build info |

---

## Default Credentials

> ⚠️ **Change all passwords before deploying to production!**

### App Login

| Username | Password | Role |
|----------|----------|------|
| `superuser` | `Admin@1234` | SUPER_USER |
| `jdoe` | `Password@123` | USER |
| `asmith` | `Password@123` | USER |
| `bjohnson` | `Password@123` | USER |

### Services

| Service | URL | Credentials |
|---------|-----|-------------|
| phpLDAPadmin | https://localhost:8081 | `cn=admin,dc=admanager,dc=local` / `Admin@1234` |
| pgAdmin | http://localhost:5050 | `admin@admanager.local` / `Admin@1234` |
| PostgreSQL | localhost:5432 | `admanager` / `AdManager@1234` |

---

## Security Notes

1. **Change all default passwords** in `.env` before first production deployment
2. **Generate a strong JWT secret**: `openssl rand -base64 64`
3. **Use HTTPS** — put nginx behind Traefik or Caddy with Let's Encrypt
4. **Replace self-signed LDAP certs** — set `ldap.trust-all-certs=false` and provide CA
5. **Restrict Actuator** — prod profile only exposes `health` and `info`
6. **Network isolation** — do not expose LDAP/PostgreSQL ports publicly in production
7. **Add `@PreAuthorize`** annotations for SUPER_USER-only write operations as needed

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| OpenLDAP won't start | `docker logs openldap-ad` — check for port conflicts |
| Bootstrap data not loaded | `docker compose down -v && docker compose up -d` (removes volumes) |
| Backend can't connect to LDAP | Ensure Docker containers are healthy; check `ldap.host` setting |
| Backend can't connect to PostgreSQL | `docker compose ps postgres` — wait for `healthy` status |
| JWT error on startup | Regenerate `JWT_SECRET` with `openssl rand -base64 64` |
| Frontend 401 loop | Clear `localStorage` in DevTools → Application tab |
| Prod backend not starting | Check env vars are set; `docker compose logs backend` |

### Full Reset

```powershell
# Remove all containers AND data volumes
docker compose -f docker-compose.yml down -v
docker compose up -d
```

---

## Development Commands

```powershell
# Backend
cd h:\ldap\backend
mvn spring-boot:run          # Dev server
mvn test                     # Run tests
mvn package -DskipTests      # Build JAR

# Frontend
cd h:\ldap\frontend
npm run dev                  # Dev + HMR
npm run build                # Production bundle
npm run preview              # Preview bundle locally

# Docker
docker compose up -d                     # Start dev infra
docker compose down                      # Stop (keep volumes)
docker compose down -v                   # Stop + delete volumes
docker compose logs -f openldap-ad       # Stream LDAP logs
docker compose logs -f admanager-postgres  # Stream PG logs
```

---

## License

MIT © 2024 — [wor-2/ldap](https://github.com/wor-2/ldap)
