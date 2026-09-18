# Role-Based Learning Dashboard

A full-stack role-based dashboard built as part of the **Neolytix take-home assessment**. Provides region-scoped data for Admin, North Manager, and South Manager roles using Next.js, Express.js, PostgreSQL, JWT authentication, and HTTP-only cookies.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [1. Setup](#1-setup)
- [2. Login Credentials](#2-login-credentials)
- [3. Approach and Design Decisions](#3-approach-and-design-decisions)
- [4. Working With AI](#4-working-with-ai)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, Tailwind CSS, Zustand, Axios, Recharts, Lucide React |
| Backend | Node.js v24.15.0, Express.js, JWT, cookies, bcryptjs |
| Database | PostgreSQL (hosted on Render.com), `pg` |

---

## 1. Setup

### Prerequisites

- Node.js v24.15.0
- npm
- Git

> No local PostgreSQL installation is required. The database is hosted on **Render.com** and the connection string is already configured in `backend/.env`.

---

### Clone

```bash
git clone https://github.com/DevSingh28/role-based-dashboard-assignment.git
cd role-based-dashboard-assignment
```

---

### Backend

```bash
cd backend
npm install
```

The repository already includes `backend/.env` with the Render.com PostgreSQL connection string:

```env
PORT=5112
DATABASE_URL=<render-postgresql-connection-string>
JWT_TOKEN_SECRET=<jwt-secret>
NODE_ENV=development
```

The database is already populated with the schema, seed data, and evaluation accounts — **no setup or seed scripts need to be run**.

```bash
npm run dev
# http://localhost:5112
```

---

### Frontend

```bash
cd frontend
npm install
```

The repository already includes `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5112/api
```

```bash
npm run dev
# http://localhost:3000
```

---

### Fresh Database — Optional

If you want to reproduce the database independently on a local or separate PostgreSQL instance:

1. Create an empty PostgreSQL database
2. Update `DATABASE_URL` in `backend/.env`
3. Run:

```bash
npm run setup-db
npm run seed
```

The setup script applies `backend/db/schema.sql`. The seed script loads `backend/providedData/data.json` inside a transaction — if anything fails, it rolls back entirely.

---

## 2. Login Credentials

| Role | Email | Password | Region Access |
|---|---|---|---|
| Admin | `admin@gmail.com` | `admin1` | All regions |
| North Manager | `northmanager@gmail.com` | `north1` | North only |
| South Manager | `southmanager@gmail.com` | `south1` | South only |

- **Admin** — can view all regions and use the region filter (All, North, South, East)
- **North Manager** — restricted to North region only, backend-enforced
- **South Manager** — restricted to South region only, backend-enforced

---

## 3. Approach and Design Decisions

### Data Modeling

The provided JSON has enrollments nested inside each student. These were normalized into four relational tables:

```
┌──────────┐       ┌─────────────┐       ┌─────────┐
│ students │──────<│ enrollments │>──────│ courses │
└──────────┘       └─────────────┘       └─────────┘

┌───────┐
│ users │  (auth only, separate from students)
└───────┘
```

Key constraints:
- Foreign keys: `enrollments.student_id → students.id` and `enrollments.course_id → courses.id`
- Composite unique on `(student_id, course_id)` — prevents duplicate enrollments
- Indexes on `students.region`, `enrollments.student_id`, `enrollments.course_id`

Normalization eliminates duplicated course data, enables clean aggregation queries, and lets foreign keys enforce referential integrity.

---

### Authentication

On login, the server issues a JWT stored in an **HTTP-only cookie**. Client-side JavaScript cannot read the token. Protected routes use middleware to read the cookie, verify the JWT, and attach `req.user` before the handler runs.

---

### Role-Based Data Scoping

The core security principle: **region restrictions are enforced on the backend, not the frontend.**

A manager's region comes from their JWT (`req.user.region`) and is injected directly into SQL as a parameter:

```sql
WHERE s.region = $1
```

The frontend region selector is a UX feature for Admins only. If a North Manager manually sends:

```
GET /api/dashboard/revenue?region=South
```

the backend returns `403 Forbidden`. Managers cannot bypass this through API manipulation or frontend state changes.

---

### Revenue Calculation

Revenue is calculated from enrollment fees, joined across students and courses:

```sql
SELECT c.category, SUM(e.fee_paid) AS total_revenue
FROM enrollments e
JOIN students s ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id
WHERE s.region = $1   -- omitted for admin all-regions view
GROUP BY c.category
ORDER BY c.category;
```

The same endpoint and the same `RevenueChart` component are used for all roles — only the data scope differs.

---

### Additional Insights

`GET /api/dashboard/insights` returns overview stats (total students, enrollments, completion rate, average rating), completion breakdown by category, and course health — all subject to the same region scoping as the revenue endpoint. Managers cannot use additional metrics to indirectly access another region's data.

## 4. Working With AI

AI tools were used for exploring implementation approaches, debugging, reviewing SQL queries, and discussing authentication and authorization patterns. All suggestions were reviewed and tested before being integrated.

### An AI Mistake I Caught

During development, an AI-generated implementation initially created a new PostgreSQL client connection for each database request instead of reusing connections through a connection pool.

This could lead to unnecessary connection creation, increased database overhead, and poor scalability as the number of requests grows.

I caught this during my review of the database layer and changed the implementation to use PostgreSQL's `Pool` from the `pg` library. Queries now reuse pooled connections instead of creating a new database connection for every request.

This reinforced the importance of reviewing AI-generated code for resource management and understanding how the underlying database connection lifecycle works rather than accepting generated code without verification.
---

## Database Schema

Full schema: `backend/db/schema.sql`

ER Diagram: [https://dbdiagram.io/d/6aac317030933601dfda1b3f](https://dbdiagram.io/d/6aac317030933601dfda1b3f)

---

## Project Structure

```
role-based-dashboard-assignment/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.local
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── db/
│   │   ├── dbconnect.js
│   │   └── schema.sql
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── scripts/
│   │   └── seed.js
│   │   └── setupDatabase.js
│   ├── providedData/
│   │   └── data.json
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## Quick Start

```bash
git clone https://github.com/DevSingh28/role-based-dashboard-assignment.git
```

**Terminal 1 — Backend**
```bash
cd role-based-dashboard-assignment/backend
npm install
npm run dev
```

**Terminal 2 — Frontend**
```bash
cd role-based-dashboard-assignment/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with any of the credentials above.
