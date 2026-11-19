# AD Manager — Active Directory Super User Management System

A full-stack application allowing a **Super User** to create AD groups, manage users, add users to groups, and assign fine-grained permissions — built with **Spring Boot (Java)** over **LDAPS** and a **React** frontend.

---

## Architecture

```
React (Vite) ──► Spring Boot REST API ──► OpenLDAP (LDAPS port 636)
    :3000              :8080                   :636 / :389
```

## Credentials

| Service | URL | Username | Password |
|---------|-----|----------|----------|
| React Frontend | http://localhost:3000 | — | — |
| Spring Boot API | http://localhost:8080 | — | — |
| phpLDAPadmin | https://localhost:8081 | cn=admin,dc=admanager,dc=local | Admin@1234 |
| H2 Console | http://localhost:8080/h2-console | sa | (blank) |

**Default Super User login (via AD Manager app):**
- Username: `superuser`
- Password: `Admin@1234`

**Sample Users:**
- `jdoe` / `Password@123`
- `asmith` / `Password@123`
- `bjohnson` / `Password@123`

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the LDAP server)
- [Java 17+](https://adoptium.net/)
- [Maven 3.8+](https://maven.apache.org/download.cgi)
- [Node.js 18+](https://nodejs.org/) & npm

---

## Quick Start

### Step 1: Start the LDAP Server
```powershell
cd h:\ldap
docker compose up -d
```

Wait 20–30 seconds for OpenLDAP to initialise and load the bootstrap LDIF.

Verify it's running:
```powershell
docker ps
```

### Step 2: Start the Spring Boot Backend
```powershell
cd h:\ldap\backend
mvn spring-boot:run
```

Backend starts on **http://localhost:8080**

### Step 3: Start the React Frontend
```powershell
cd h:\ldap\frontend
npm install
npm run dev
```

Frontend starts on **http://localhost:3000**

---

## Features

### Super User Capabilities
| Feature | Description |
|---------|-------------|
| **Create AD Groups** | Create security groups in OpenLDAP |
| **Delete AD Groups** | Remove groups from LDAP |
| **Add Members** | Search and add users to groups |
| **Remove Members** | Remove users from groups |
| **Create AD Users** | Add new user accounts directly to LDAP |
| **Search Users** | Full-text search across uid, cn, mail |
| **Assign Permissions** | Grant app-level permissions to any user |
| **Revoke Permissions** | Remove granted permissions |
| **Create Permissions** | Define custom permission types |
| **View Audit Log** | Full history of all system actions |
| **Dashboard Stats** | Real-time counts of users, groups, permissions |

---

## Project Structure

```
h:/ldap/
├── docker-compose.yml          ← OpenLDAP + phpLDAPadmin
├── ldap/
│   └── bootstrap/
│       └── 01-structure.ldif   ← Initial LDAP OUs + users + groups
├── backend/                    ← Spring Boot application
│   ├── pom.xml
│   └── src/main/java/com/admanager/
│       ├── config/             ← LDAP pool, JWT, Spring Security
│       ├── model/              ← JPA entities (AppUser, Permission, AuditLog)
│       ├── dto/                ← Request/Response DTOs
│       ├── repository/         ← JPA repositories
│       ├── service/            ← Business logic + LDAP operations
│       ├── controller/         ← REST endpoints
│       └── exception/          ← Global error handling
└── frontend/                   ← React + Vite application
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── pages/              ← Login, Dashboard, Groups, Users, Permissions, Audit
        ├── components/         ← Layout, Modal, Toast, StatsCard
        ├── services/           ← Axios API calls
        ├── store/              ← Zustand auth state
        └── styles/             ← Global CSS (dark glassmorphism)
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate (AD bind) → returns JWT |
| GET | `/api/dashboard/stats` | Total counts |
| GET | `/api/groups` | List all groups |
| POST | `/api/groups` | Create a new group |
| DELETE | `/api/groups/{dn}` | Delete a group |
| GET | `/api/groups/{dn}/members` | List group members |
| POST | `/api/groups/{dn}/members` | Add user to group |
| DELETE | `/api/groups/{dn}/members` | Remove user from group |
| GET | `/api/users` | List/search LDAP users |
| GET | `/api/users/{uid}` | Get user details + groups + permissions |
| POST | `/api/users` | Create new LDAP user |
| GET | `/api/permissions` | List permission catalog |
| POST | `/api/permissions` | Create permission definition |
| POST | `/api/permissions/assign` | Assign permission to user |
| DELETE | `/api/permissions/assign/{id}` | Revoke permission |
| GET | `/api/permissions/user/{uid}` | Get user's permissions |
| GET | `/api/audit` | Paginated audit log (supports search) |

---

## Configuration

Edit `h:/ldap/backend/src/main/resources/application.properties` to point to your LDAP server:

```properties
ldap.host=localhost
ldap.port=636
ldap.bind-dn=cn=admin,dc=admanager,dc=local
ldap.bind-password=Admin@1234
ldap.base-dn=dc=admanager,dc=local
```

For a **real Active Directory** server, change:
```properties
ldap.host=your-ad-server.domain.com
ldap.port=636
ldap.bind-dn=CN=SvcAccount,OU=Users,DC=domain,DC=com
ldap.bind-password=your-password
ldap.base-dn=DC=domain,DC=com
ldap.users-ou=OU=Users,DC=domain,DC=com
ldap.groups-ou=OU=Groups,DC=domain,DC=com
```

---

## Troubleshooting

### OpenLDAP won't start
```powershell
docker logs openldap-ad
```

### LDAP connection refused
Make sure Docker Desktop is running and port 636 is not blocked by firewall.

### Bootstrap data not loaded
```powershell
docker compose down -v && docker compose up -d
```
(The `-v` removes volumes so it re-initialises)

### Backend fails to connect to LDAP
Ensure the Docker container is healthy before starting the backend:
```powershell
docker compose ps
```
