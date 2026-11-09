# Serine Diagnostics

A full-stack diagnostic laboratory web application concept for exploring lab tests, wellness packages, appointment scheduling, and laboratory operations.

## Overview

Serine brings patient-facing discovery and booking together with staff/provider workflows. The frontend is built with React and TypeScript; an Express API provides application endpoints, and Prisma models the PostgreSQL data layer.

> **Project/demo notice:** This repository is a software project, not a medical service. Test descriptions, prices, availability, and results shown by the application should be verified before any real-world use. Do not use this application to make medical decisions.

## Features

### Patient-facing experience
- Browse laboratory tests and view test details, preparation information, specimen details, and turnaround estimates.
- Explore wellness packages and their included tests.
- Start an appointment booking flow, select a location/date/time, and enter patient and order information.
- Review appointment information and appointment summaries.
- Browse location, insurance, home-collection, about, and contact information.
- View frequently ordered tests when the API has usage data available.

### Staff and provider workflows
- Staff authentication and role-based application access.
- Manage laboratory tests and packages.
- Provider-facing order and result workflows.
- Staff management and password-reset flows.
- API endpoints for appointments, locations, tests, packages, users, providers, and contact requests.

The exact features available depend on the configured database, seed data, and user role.

## Technology Stack

**Frontend**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Motion

**Backend**
- Node.js
- Express
- TypeScript (`tsx`)
- Prisma ORM
- PostgreSQL
- JSON Web Tokens (JWT)
- Zod validation
- Resend email integration
- PDFKit for PDF generation

## Architecture

```text
Browser
  |
  | React + TypeScript (Vite)
  | src/
  |
  | HTTP requests (/api)
  v
Express API (server/)
  |-- Authentication and users
  |-- Lab tests and packages
  |-- Locations and appointments
  |-- Provider workflows
  |-- Contact requests
  |
  v
Prisma ORM
  |
  v
PostgreSQL
```

The frontend uses `VITE_API_BASE_URL` to select the API base URL. By default, it points to `http://localhost:3001/api`.

## Requirements

- Node.js (use a current LTS release)
- npm
- PostgreSQL database
- Resend API key only if email functionality is enabled/configured

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mohamed-Yasar/Serine.git
cd Serine
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux**
```bash
cp .env.example .env
```

Update `.env` with your own local values:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
JWT_SECRET="replace_with_a_long_random_secret"
NODE_ENV="development"
PORT=3001
RESEND_API_KEY="replace_with_resend_api_key"
RESEND_FROM_EMAIL="Serine Diagnostics <verified-sender@example.com>"
CONTACT_EMAIL="your-contact@example.com"
```

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: long, unique secret used to sign authentication tokens.
- `PORT`: backend port (defaults to `3001`).
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_EMAIL`: configure email features when needed.

Never commit `.env` or real credentials. The `.env.example` file contains placeholders only.

### 4. Prepare the database

Ensure PostgreSQL is running and `DATABASE_URL` points to the intended database.

Apply Prisma migrations:

```bash
npx prisma migrate deploy
```

Generate the Prisma client if required:

```bash
npx prisma generate
```

The repository includes a Prisma seed script. Review `prisma/seed.ts` and the project configuration before running any seed command against a database:

```bash
npx prisma db seed
```

Only seed a local/development database unless you have reviewed the data and explicitly intend to populate another environment.

### 5. Run the application

Open two terminal windows in the repository.

**Terminal 1 — API server**
```bash
npm run server
```

The API defaults to:

```text
http://localhost:3001
```

Health endpoint:

```text
http://localhost:3001/api/health
```

**Terminal 2 — frontend**
```bash
npm run dev
```

Vite runs on port `3000` with the configured host settings. Open the local URL printed by Vite.

If your API is hosted elsewhere, set `VITE_API_BASE_URL` to the API URL (including `/api`) before building/running the frontend.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite frontend development server |
| `npm run server` | Start the Express API server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the Vite production build |
| `npm run lint` | Run TypeScript type-checking (`tsc --noEmit`) |
| `npm run populate:test-details` | Run the test-detail population script; review its behavior and database target first |

## API Overview

The Express API is mounted under `/api`:

| Route | Purpose |
| --- | --- |
| `/api/health` | API health check |
| `/api/tests` | Laboratory test catalog and management |
| `/api/packages` | Wellness package catalog and management |
| `/api/locations` | Laboratory locations |
| `/api/appointments` | Appointment creation, availability, and management |
| `/api/auth` | Authentication and password-reset flows |
| `/api/users` | User-related operations |
| `/api/provider` | Provider order/result workflows |
| `/api/contact` | Contact/enquiry endpoint |

Refer to `server/routes/` for endpoint behavior, request formats, and authorization requirements.

## Repository Structure

```text
.
├── prisma/
│   ├── migrations/          # PostgreSQL schema migrations
│   ├── schema.prisma        # Prisma data model
│   └── seed.ts              # Seed data
├── public/                  # Static public assets
├── scripts/                 # Utility and data scripts
├── server/
│   ├── index.ts             # Express entry point
│   ├── middleware/           # Authentication middleware
│   ├── routes/               # API route handlers
│   └── validations/           # Request validation schemas
├── src/
│   ├── components/           # UI components and pages
│   ├── context/              # React context providers
│   ├── data/                 # Application/catalog data
│   ├── services/              # API client
│   └── types/                 # TypeScript types
├── .env.example              # Safe environment template
├── package.json
└── vite.config.ts
```

## Security Notes

- Keep `.env`, API keys, database credentials, JWT secrets, and private patient data out of Git.
- Use strong, unique secrets for each environment.
- Restrict CORS to trusted origins before deployment.
- Review authentication, authorization, input validation, logging, and rate limiting before exposing the API publicly.
- Do not use real patient or health information in development/demo data.
- Treat this project as a development/demo application until security, privacy, accessibility, reliability, and applicable healthcare compliance requirements have been independently assessed.

## Contributing

1. Create a branch for your change.
2. Make focused updates.
3. Run `npm run lint` and `npm run build`.
4. Open a pull request describing the change and any relevant testing.

## License

No license is specified yet. Add a `LICENSE` file before granting others permission to use, modify, or distribute this project.
