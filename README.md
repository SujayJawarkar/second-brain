<div align="center">

# ⚡ Kortex

### Your AI-Powered Second Brain

**Save anything. Understand everything. Remember what matters.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-kortex-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://kortex-frontend-mocha.vercel.app/)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://second-brain-backend-xqqh.onrender.com/health)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Made with](https://img.shields.io/badge/Made%20with-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<br/>

![Kortex Dashboard](https://res.cloudinary.com/pixiscode/image/upload/v1775246687/Screenshot_15_jzciyp.png)

<br/>

</div>

---

## What is Kortex?

Kortex is not a bookmarking app.

It is a **knowledge engine** — a system that understands what you save, connects related ideas across sources, and resurfaces the right knowledge at the right time. Built for researchers, PMs, founders, and students who collect information obsessively but struggle to retrieve it when it matters.

- **Save** any URL, PDF, or note in seconds
- **Understand** — AI extracts topics, generates summaries, chunks content into searchable pieces
- **Connect** — semantic similarity builds a knowledge graph automatically
- **Resurface** — spaced repetition + topic relevance brings forgotten knowledge back

---

## Features
> Note: There are still some features that are not implemented yet,

### Free Tier

- ✅ Save up to 100 items (URLs + notes)
- ✅ Keyword search across your knowledge base
- ✅ Auto-tagging and summarisation via Groq Llama 3.1
- ✅ Real-time processing status via SSE
- ✅ Dark / light mode
- ✅ Browser extension (coming soon)

### Pro Tier (₹299/month)

- ✅ Unlimited items
- ✅ Hybrid semantic + keyword search (vector + BM25 with RRF)
- ✅ PDF ingestion (up to 20MB)
- ✅ Interactive knowledge graph
- ✅ Related items panel
- ✅ Daily resurfacing digest
- ✅ Priority processing

---

## Tech Stack

### Frontend

| Tool                         | Purpose                       |
| ---------------------------- | ----------------------------- |
| React 18 + Vite + TypeScript | UI framework                  |
| Tailwind CSS(v3) + Shadcn/ui     | Styling and components        |
| TanStack Query               | Server state management       |
| Zustand                      | Client state management       |
| D3.js                        | Knowledge graph visualisation |
| React Router                 | Client-side routing           |

### Backend

| Tool                              | Purpose                        |
| --------------------------------- | ------------------------------ |
| Node.js 20 + Express + TypeScript | API server                     |
| Drizzle ORM                       | Type-safe database queries     |
| PostgreSQL (Supabase)             | Primary database               |
| Qdrant Cloud                      | Vector database for embeddings |
| Redis Streams (Upstash)           | Async job queue                |
| Cloudflare R2                     | Object storage for PDFs        |

### AI Pipeline

| Tool                          | Purpose                                      |
| ----------------------------- | -------------------------------------------- |
| Xenova/transformers.js        | Local embeddings (all-MiniLM-L6-v2, 384-dim) |
| Groq API — Llama 3.1          | Tag extraction + summarisation (free)        |
| OpenAI text-embedding-3-small | Pro tier embeddings (1536-dim)               |
| GPT-4o-mini                   | Pro tier tagging                             |
| Jina Reader API               | URL → clean markdown                         |

### Infrastructure

| Tool       | Purpose                |
| ---------- | ---------------------- |
| Render.com | Backend hosting        |
| Vercel     | Frontend hosting       |
| Razorpay   | Payments (India-first) |
| Resend.com | Transactional email    |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Clients                          │
│         Web App · Mobile PWA · Browser Extension        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              API Gateway (Express)                      │
│         Rate limit · JWT Auth · Plan gating             │
└──┬──────────┬──────────┬──────────┬─────────────────────┘
   │          │          │          │
   ▼          ▼          ▼          ▼
Ingest     Search     Graph     Resurface
  API        API       API        API
   │
   ▼
┌─────────────────────────────────────────────────────────┐
│                  Redis Streams                          │
│         ingest → embed → tag → link pipeline            │
└──┬──────────┬──────────┬──────────┬─────────────────────┘
   │          │          │          │
   ▼          ▼          ▼          ▼
Parser    Embedder   Tagger    Linker
Worker    Worker     Worker    Worker
   │          │          │          │
   ▼          ▼          ▼          ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│  PG  │  │Qdrant│  │  PG  │  │  PG  │
└──────┘  └──────┘  └──────┘  └──────┘
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Git
- Accounts on: Supabase, Upstash, Qdrant Cloud, Groq, HuggingFace

### 1. Clone the repo

```bash
git clone https://github.com/SujayJawarkar/kortex-secondBrain.git
```

### 2. Backend setup

```bash
cd ./backend
npm install
cp .env.example .env
# Fill in your environment variables
npm run db:push
npm run dev
```

### 3. Frontend setup

```bash
cd ./frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000/api/v1
npm run dev
```

### 4. Open the app

```
Frontend: http://localhost:5173
Backend:  http://localhost:3000/health
```

---

## Environment Variables

### Backend `.env`

```env
# Server
PORT=3000
NODE_ENV=development

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres

# Redis (Upstash)
REDIS_URL=rediss://xxxx.upstash.io:6379

# Vector DB (Qdrant Cloud)
QDRANT_URL=https://xxxx.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key

# AI — Free tier (demo mode)
AI_MODE=free
HUGGINGFACE_API_KEY=hf_xxxx
GROQ_API_KEY=gsk_xxxx

# AI — Pro tier (production)
OPENAI_API_KEY=sk-xxxx

# Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Payments (Razorpay)
RAZORPAY_KEY_ID=rzp_xxxx
RAZORPAY_KEY_SECRET=xxxx

# Email (Resend)
RESEND_API_KEY=re_xxxx

# Auth
JWT_SECRET=your_random_secret_min_32_chars
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## API Reference

| Method | Endpoint                    | Auth     | Description             |
| ------ | --------------------------- | -------- | ----------------------- |
| POST   | `/api/v1/auth/register`     | None     | Create account          |
| POST   | `/api/v1/auth/login`        | None     | Login + get JWT         |
| POST   | `/api/v1/items`             | Required | Save URL or note        |
| POST   | `/api/v1/items/pdf`         | Pro      | Upload PDF              |
| GET    | `/api/v1/items`             | Required | List all items          |
| GET    | `/api/v1/items/:id`         | Required | Get single item         |
| DELETE | `/api/v1/items/:id`         | Required | Delete item             |
| GET    | `/api/v1/search?q=...`      | Required | Search knowledge base   |
| GET    | `/api/v1/graph`             | Pro      | Knowledge graph         |
| GET    | `/api/v1/graph/related/:id` | Pro      | Related items           |
| GET    | `/api/v1/resurface`         | Pro      | Today's resurface picks |
| GET    | `/api/v1/stream`            | Required | SSE real-time updates   |
| POST   | `/api/v1/billing/subscribe` | Required | Start Pro subscription  |
| POST   | `/api/v1/billing/webhook`   | Razorpay | Payment events          |

---

## Processing Pipeline

```
User saves URL
     │
     ▼
POST /items → 202 Accepted (immediate)
     │
     ▼
Redis Stream: "ingest"
     │
     ▼
Parser Worker
  • Fetches URL via Jina Reader API
  • Extracts clean markdown
  • Splits into 512-token chunks with 64-token overlap
     │
     ▼
Redis Stream: "embed"
     │
     ▼
Embed Worker
  • Generates 384-dim vectors (free) or 1536-dim (pro)
  • Upserts to Qdrant
  • Marks item status: ready
  • Fires SSE event → frontend updates live
     │
     ├──► Redis Stream: "tag"
     │         │
     │         ▼
     │    Tag Worker
     │      • Groq Llama 3.1 extracts 3-7 topics
     │      • Generates 2-3 sentence summary
     │
     └──► Redis Stream: "link"
               │
               ▼
          Link Worker
            • Computes cosine similarity vs existing items
            • Creates edges in item_links (threshold: 0.25)
            • Builds knowledge graph incrementally
```

---

## Deployment

### Backend → Render

1. Push to GitHub
2. New Web Service on Render → connect repo
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add all environment variables
6. Set up keep-alive cron at [cron-job.org](https://cron-job.org) → ping `/health` every 10 min

### Frontend → Vercel

1. Push to GitHub
2. Import project on Vercel
3. Framework: Vite
4. Add `VITE_API_URL` environment variable
5. Deploy

---

## Roadmap

- [x] URL + note ingestion
- [x] PDF ingestion
- [x] Semantic search (hybrid RRF)
- [x] Knowledge graph
- [x] Real-time SSE updates
- [x] Dark / light mode
- [x] Item detail drawer
- [x] Daily resurfacing digest
- [ ] Razorpay billing
- [x] Browser extension (Chrome)
- [ ] YouTube transcript ingestion
- [ ] AI chat over knowledge base (RAG)
- [x] Tweet Save from Extension
- [ ] Mobile app

---

## Project Structure

```
backend/
├── src/
│   ├── config/          # env, redis, qdrant, multer, ai config
│   ├── db/              # drizzle schema + client
│   ├── middleware/       # auth, requirePro, rate limiting
│   ├── routes/          # express routers
│   ├── services/        # business logic
│   ├── workers/         # redis stream consumers
│   ├── utils/           # queue, SSE manager
│   ├── types/           # shared TypeScript types
│   └── server.ts        # single entry — API + all workers
├── drizzle/             # migration files
├── .env.example
└── package.json

frontend/
├── src/
│   ├── api/             # axios client + endpoint functions
│   ├── components/
│   │   ├── layout/      # AppLayout, AuthLayout
│   │   └── items/       # SaveBar, ItemCard
│   ├── hooks/           # useAuth, useItems, useSSE
│   ├── lib/             # theme provider
│   ├── pages/           # Dashboard, Search, Graph, Login, Register
│   ├── store/           # Zustand auth store
│   └── types/           # shared TypeScript types
└── package.json
```
---
## Browser Extension

Kortex ships with a Chrome extension that lets you save any webpage or write
a quick note without switching tabs.

### Installation

> The extension is not yet on the Chrome Web Store. Install it manually
> using the unpacked folder method.

1. Open Chrome and go to `chrome://extensions`

2. Enable **Developer mode** using the toggle in the top-right corner

3. Click on **Load unpacked** and select the extension folder path.

4. The Kortex icon will appear in your browser toolbar
   (pin it for easy access — click the puzzle icon → pin Kortex)

---

### Sign In

On first launch the extension will ask you to sign in.

1. Click the Kortex icon in the toolbar
2. Enter the same email and password you use on the Kortex web app
3. Click **Sign in**
4. You will stay signed in across browser sessions

> Don't have an account? Create one free at
> [Kortex](https://kortex-frontend-mocha.vercel.app/)

---

### Save the Current Page

1. Open any webpage you want to save
2. Click the Kortex icon in the toolbar
3. The current tab's URL and title are auto-filled
4. Click **Save** — the page is queued for processing instantly
5. Open the Kortex dashboard to see it appear in real time

---

### Save a Manual Note

1. Click the Kortex icon in the toolbar
2. Switch to the **Note** tab
3. Type or paste your note
4. Click **Save**

### Save a Tweet
1. Open x.com & Sign in
2. Near the tweet's share button you will see the Kortex icon
3. Click the icon and the extension will automatically save it as url in Kortex

---

### Troubleshooting

**Extension not saving?**
Make sure you are signed in — click the icon and check if the sign-in
screen appears.

**"Invalid token" error?**
Sign out and sign back in. Tokens expire after 7 days.

**Page saved but not appearing on dashboard?**
Check your internet connection. Processing takes up to 15 seconds for URLs.
The item will appear automatically once ready.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add youtube ingestion"`
4. Push and open a PR

---

## License

MIT © 2026

---

<div align="center">

Built with ❤️ by **Sujay** 

⭐ Star this repo if Kortex helps you think better

</div>
