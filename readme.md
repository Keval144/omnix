# OmniX

<p align="center">
  <img src="frontend/public/logo.png" alt="OmniX Logo" width="200"/>
</p>

> AI-powered data analysis platform with chat, notebooks, and datasets.

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion |
| **Backend** | FastAPI, Python 3, SQLAlchemy 2.0 (async), Alembic |
| **Database** | PostgreSQL (Neon) |
| **Auth** | Better-auth (JWT) |
| **AI/ML** | iFlow LLM API (Qwen3-235b), ChromaDB, scikit-learn, pandas, papermill |

## Project Structure

```
omnix/
├── frontend/          # Next.js application
│   ├── app/           # App Router pages
│   ├── components/    # UI components (shadcn, chats, landing)
│   ├── lib/           # Auth, API client, db utilities
│   ├── hooks/         # Custom React hooks
│   ├── drizzle/       # Database schema
│   └── public/        # Static assets
├── backend/           # FastAPI application
│   ├── routers/      # API route handlers
│   ├── schemas/       # Pydantic request/response models
│   ├── models/       # SQLAlchemy ORM models
│   ├── services/     # Business logic
│   ├── llm/          # LLM client (iFlow)
│   ├── rag/          # RAG / vector store (ChromaDB)
│   ├── storage/      # File storage (datasets, notebooks)
│   ├── db/           # Database session management
│   └── alembic/      # Database migrations
```

## Prerequisites

- **Node.js** 20+
- **Python** 3.10+
- **pnpm** 8+
- **PostgreSQL** 15+ (or Neon cloud)

## Setup

### 1. Clone & install dependencies

```bash
# Frontend
cd frontend
pnpm install

# Backend
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment variables

```bash
# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your values

# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

### 3. Database setup

**Frontend (Drizzle ORM):**
```bash
cd frontend
pnpm db:generate   # Generate migrations
pnpm db:push      # Push schema to database
```

**Backend (Alembic):**
```bash
cd backend
alembic upgrade head
```

### 4. Run the application

**Development (two terminals):**

```bash
# Terminal 1 - Frontend
cd frontend
pnpm dev
# Opens at http://localhost:3000

# Terminal 2 - Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
# API at http://localhost:8000
```

### 5. Auth key generation (optional)

```bash
cd frontend
pnpm auth:generate
```

## Scripts

### Frontend (`cd frontend`)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Format code with Biome |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:push` | Push schema to database |
| `pnpm db:pull` | Pull schema from database |

### Backend (`cd backend`)

```bash
alembic upgrade head       # Run migrations
alembic revision --autogenerate -m "message"  # Create migration
alembic downgrade -1       # Rollback one migration
```

## API Endpoints

| Route | Description |
|-------|-------------|
| `GET /` | Health check |
| `GET /debug/storage` | Storage debug |
| `POST /api/auth/**` | Auth routes (Better-auth) |
| `/api/projects` | Projects CRUD |
| `/api/datasets` | Datasets CRUD |
| `/api/notebooks` | Notebooks CRUD |
| `/api/chat` | Chat sessions |
| `/api/rag` | RAG knowledge base |

## Environment Variables Reference

### Backend

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_URL` | Frontend URL for auth |
| `BETTER_AUTH_JWKS_URL` | JWKS endpoint for JWT verification |
| `STORAGE_ROOT` | Root path for file storage |
| `DATA_STORAGE_URL_PREFIX` | URL prefix for storage |
| `IFLOW_API_KEY` | iFlow API key for LLM |
| `IFLOW_MODEL` | LLM model name |
| `DB_POOL_*` | Database connection pool settings |

### Frontend

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret for JWT signing |
| `BETTER_AUTH_URL` | Frontend URL for auth |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_DATA_STORAGE_URL` | Storage URL |
