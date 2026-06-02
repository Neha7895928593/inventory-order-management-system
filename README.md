# Inventory & Order Management System

A full-stack inventory and order management application built with React, FastAPI, and PostgreSQL. The system supports product management, customer records, order processing, inventory tracking, and a dashboard for operational visibility.

## Tech Stack

- Frontend: React + Vite
- Backend: FastAPI
- Database: PostgreSQL
- Containerization: Docker
- Orchestration: Docker Compose

## Core Features

- Product management
  - create, list, view, update, and delete products
  - unique SKU validation
- Customer management
  - create, list, view, and delete customers
  - unique email validation
- Order management
  - create, list, view, and delete orders
  - automatic total calculation
  - automatic stock reduction on order creation
  - stock restoration on order deletion
- Inventory controls
  - prevents negative stock
  - prevents orders beyond available inventory
  - low-stock tracking on the dashboard
- Frontend experience
  - responsive admin interface
  - form validation
  - status and error feedback

## Project Structure

```text
.
├── backend
├── frontend
├── docker-compose.yml
└── .env.example
```

## Running Locally

### Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Available services:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8000`
- API documentation: `http://localhost:8000/docs`

### Backend Only

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend Only

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

### Root / Docker Compose

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `FRONTEND_ORIGIN`
- `LOW_STOCK_THRESHOLD`

### Backend

- `DATABASE_URL`
- `FRONTEND_ORIGIN`
- `LOW_STOCK_THRESHOLD`

### Frontend

- `VITE_API_BASE_URL`

## Business Rules

- product SKU must be unique
- customer email must be unique
- product quantity cannot be negative
- orders cannot be created when stock is insufficient
- order totals are calculated by the backend

## Deployment

The application can be deployed with a split frontend/backend setup:

- Backend: Render, Railway, or Fly.io
- Frontend: Vercel or Netlify

Recommended deployment flow:

1. Deploy PostgreSQL or use a managed PostgreSQL instance.
2. Deploy the FastAPI backend with the required environment variables.
3. Deploy the React frontend and point `VITE_API_BASE_URL` to the live backend.
4. Verify API access, dashboard loading, and order creation on the deployed URLs.
