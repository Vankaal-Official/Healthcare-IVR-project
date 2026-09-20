# Van-Kaal Healthcare Appointment Reminder API

Production-grade backend foundation for the Van-Kaal × ZocDoc Healthcare Appointment Reminder platform built with NestJS, TypeScript, PostgreSQL, and Prisma.

---

## Features Implemented

- **NestJS Modular Architecture**: Domain-driven structure (`auth`, `tenants`, `appointments`, `reminders`, `health`, `common`).
- **PostgreSQL & Prisma ORM**: Multi-tenant relational schema with `Tenant`, `Practice`, `ApiKey`, `Appointment`, and `Reminder` tables.
- **Strict API Versioning**: `/v1` global prefix across all customer endpoints.
- **API Key Security**: Server-to-server authentication using HMAC-SHA256 hashed keys (no plain-text secrets in the database). Supports `Authorization: Bearer <key>` and `X-API-Key`.
- **Tenant & Practice Isolation**: Every query and appointment is scoped strictly by tenant and practice IDs.
- **Reminder Decision Engine**: Calculates reminder timings according to Section 6 of the architecture spec:
  - `> 60 min`: Standard T-60 SMS and T-30 IVR schedule.
  - `30–60 min`: Immediate SMS and T-30 IVR schedule.
  - `5–30 min`: Immediate SMS and immediate IVR.
  - `< 5 min`: Immediate SMS, voice skipped (insufficient lead time).
  - `Past appointments`: Reminders suppressed.
- **HIPAA-Compliant PHI Masking**: Terminal and HTTP interceptor redacting patient phone numbers (`+1415***1234`), patient names (`J*** D**`), and credentials.
- **Global Error Handling**: Standardized, sanitized error envelopes without exposing internal database errors or stack traces.
- **Interactive OpenAPI / Swagger**: Live documentation and testing UI at `/docs`.

---

## Quick Start Guide (For Team Members)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+ or v22+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)

### 2. Setup Environment
Copy the example environment file:
```bash
cp .env.example .env
```

### 3. Start Database & Cache Containers
Ensure Docker Desktop is open, then start PostgreSQL and Redis:
```bash
docker compose up -d
```

### 4. Install Dependencies & Migrate Database
```bash
npm install
npx prisma db push
npm run prisma:seed
```

The seed script will print the test credentials:
```text
Tenant ID: ...
Practice ID: practice_001
API Key: vk_live_test_key_van_kaal_2026
```

### 5. Start the Application
```bash
# Development mode with hot-reload
npm run start:dev

# Run automated tests
npm test
```

### 6. Test via Swagger UI
Open your browser to:
**`http://localhost:3000/docs`**

1. Click the green **Authorize** 🔓 button at the top right.
2. Enter the test API key: `vk_live_test_key_van_kaal_2026`.
3. Test any endpoint (e.g. `POST /v1/appointments`).

---

