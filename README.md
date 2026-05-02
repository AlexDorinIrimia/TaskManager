# TaskManager — Docker + TLS + Jenkins

Full local dev stack for the TaskManager Spring Boot API, running entirely in Docker on Windows.

## Architecture

```
Browser (HTTPS :443)
        │
        ▼
   [ Nginx ]  ← cert.pem + key.pem (self-signed)
   TLS termination
        │
        │ HTTP (internal Docker network)
        ▼
[ Spring Boot App :8080 ]
   JWT auth, REST API
   /api/tasks, /api/projects, /api/users
        │
        │ PostgreSQL protocol
        ▼
  [ PostgreSQL :5432 ]

[ Jenkins :8090 ]  ← builds Docker images via mounted docker.sock
```

## Prerequisites

- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
- OpenSSL (one of):
  - Git for Windows — already includes it (use Git Bash)
  - `choco install openssl`
  - [Win32 OpenSSL installer](https://slproweb.com/products/Win32OpenSSL.html)

## Setup (one time)

**1. Generate TLS certificates**

From Git Bash
```bash
bash scripts/setup-certs.sh
```

**2. Start everything**
```powershell
docker compose up -d
```

Docker will build the Spring Boot image, then start all 4 services in the right order (Postgres → App → Nginx, Jenkins in parallel).

## Access

| Service | URL |
|---|---|
| TaskManager API | https://localhost |
| Register user | POST https://localhost/api/users/register |
| Jenkins | http://localhost:8090 |

> **Browser warning:** Self-signed cert → click *Advanced → Proceed to localhost*. Expected for local dev.

## Jenkins First-Run

1. Open http://localhost:8090
2. Get the initial admin password:
   ```powershell
   docker exec taskmanager-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Install suggested plugins
4. Create a **Pipeline** job → *Pipeline script from SCM* → point at your GitHub repo
5. Jenkins picks up the `Jenkinsfile` automatically and runs:
   - Build & Test (inside Maven Docker image)
   - Build Docker Image
   - Trivy Security Scan

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/users/register | Public | Register new user |
| POST | /api/auth/login | Public | Get JWT token |
| GET | /api/tasks | JWT | List all tasks |
| POST | /api/tasks?projectId=1 | JWT | Create task |
| PUT | /api/tasks/{id} | JWT | Update task |
| DELETE | /api/tasks/{id} | JWT | Delete task |
| PUT | /api/tasks/{id}/assign-users | JWT | Assign users |
| GET | /api/projects | JWT | List projects |
| GET | /api/users | JWT | List users |

## Useful Commands

```powershell
# View all running containers
docker compose ps

# View logs
docker compose logs app
docker compose logs nginx
docker compose logs jenkins

# Rebuild app image after code changes
docker compose up -d --build app

# Stop everything
docker compose down

# Stop and wipe all data
docker compose down -v
```

## Project Structure

```
TaskManager/
├── frontend/
│        ├── src/
│        │       ├── componets/       #Sidebar
│        │       ├── pages/           #Tasks, Users, Projects, Dashboard, Login pages
│        │       ├── context/         #Auth context
│        │       ├── services/        #API
│        │       ├── App.jsx
│        │       ├── index.css
│        │       └── index.jsx
│        ├── public/
│        ├── Dockerfile.frontend
│        ├── nginx.frontend.conf
│        ├── packaege.json
│        ├── eslnit.config.js
│        ├── vite.config.js
│        └── index.html
├── src/
│   └── main/
│       ├── java/com/taskmanager/
│       │   ├── config/SecurityConfig.java
│       │   ├── controller/          # TaskController, ProjectController, UserController
│       │   ├── model/               # Task, Project, User
│       │   ├── repository/          # JPA repositories
│       │   ├── security/            # JwtTokenProvider, JwtAuthenticationFilter
│       │   ├── service/             # Business logic
│       │   └── TaskManagerApplication.java
│       └── resources/
│           └── application.properties   ← ADD THIS FILE
├── Dockerfile                           ← Multi-stage build
├── docker-compose.yml                   ← Full stack
├── Jenkinsfile                          ← CI/CD pipeline
├── nginx/
│   └── nginx.conf                       ← TLS reverse proxy
└── scripts/
    └── setup-certs.sh                  ← Cert generator
```
