# Fintech Pay

**Fintech Pay** is a merchant dashboard — a back-office app for businesses that accept online payments. A shop owner, SaaS billing team, or finance ops person logs in here to watch money come in, debug failed charges, create payment links, and check when payouts land.

Customers never see this UI. They pay on Razorpay checkout or a payment link URL. This app sits on top of that, scoped to **one merchant account at a time**.

---

## What it is (and isn't)

| It is | It isn't |
|-------|----------|
| A merchant operations dashboard | A customer checkout page |
| Per-merchant: your data only | A Razorpay admin panel for all merchants |
| Backed by Postgres + Razorpay test/live keys | A standalone payment processor |
| AI that reads **your** live stats | A generic ChatGPT wrapper |

Payment processing runs through **Razorpay**. The app stores transaction records, link metadata, settlements, and merchant settings in **PostgreSQL** (Neon in dev).

---

## Pages and what each one does

### Dashboard (`/`)

The home view after login.

- **Stat cards** — month-to-date revenue, transaction count, success rate, active payment links. These come from a dedicated stats endpoint and do **not** change when you switch chart periods (avoids layout jump).
- **Revenue chart** — 7d / 30d / 90d toggle. Only the chart shimmers while a new period loads; the stat row stays put.
- **Success rate gauge** — visual snapshot for the selected period.
- **Country map + currency breakdown** — where money is coming from.
- **Recent transactions** — last 10 rows; click one to open the detail drawer.
- **AI nudge** — first visit only: a small popup above the chat button pointing users to the assistant.

### Transactions (`/transactions`)

Full ledger for the merchant.

- **Search** — by transaction ID or description.
- **Filters** — status (success / failed / pending), currency, date range. Dates are validated client and server (no start-after-end, no future dates).
- **Clear filters** — one button resets to defaults (shared pattern across filtered pages).
- **Infinite scroll** — loads 10 at a time via cursor pagination.
- **Export CSV** — downloads `fintechpay-transactions.csv` for the current filter set.
- **Transaction detail** — amount, status, payment state (`created` → `authorized` → `captured` / `failed` / `retrying`), Razorpay ID, country, method, idempotency key, retry count.
- **Retry failed payment** — POST to retry a failed transaction (where applicable).

### Analytics (`/analytics`)

Deeper charts than the dashboard home.

- Revenue by country (bar chart)
- Success rate over time (line chart)
- Payment method split (pie chart)
- Peak-hours heatmap — which days and hours see the most volume
- Period selector: 7d / 30d / 90d

All aggregation runs in SQL (`lib/analytics.ts`), not in the browser.

### Intelligence (`/ai-intelligence`)

Rule-based insights plus light forecasting — no LLM on this page.

- **Anomalies** — flags like success-rate drops, volume spikes, failure clusters, zero-transaction days (last 30 days of data).
- **7-day revenue forecast** — simple projection from recent daily averages.
- **Insight cards** — e.g. best revenue day, top country, riskiest payment method.
- **Forecast chart** — historical + projected revenue.

Cached server-side with `unstable_cache` (5-minute TTL, per-user tags).

### Payment Links (`/payment-links`)

Create and manage Razorpay payment links.

- **Create link** — title, amount, currency, optional expiry. Calls Razorpay API and saves link + short URL to DB.
- **Grid or list view**
- **Filter** — search, status (active / expired / paid), month
- **Per-link actions** — copy URL, enable/disable (for expired links you can reactivate)

Supported currencies in the app: INR, USD, EUR, GBP, SGD, AED (seed and forms).

### Settlements (`/settlements`)

Payout history for the merchant.

- List of settlements with amount, currency, status (`pending` / `processing` / `settled`)
- Summary cards: pending payout total, next expected settlement date
- Cursor-paginated list

### AI Assistant (`/ai-assistant`)

Full-page chat, separate from the floating widget.

- **Streaming chat** via Groq (`/api/ai/chat`)
- **Live merchant context** — revenue, anomalies, payment links, settlements injected into the system prompt from real DB data
- **RAG notes** — paste text (policies, refund rules, etc.); embedded with Cohere and retrieved during chat (`/api/ai/embed`)
- **Suggested questions** — 8 starter prompts
- Markdown rendering in assistant replies

### Settings (`/settings`)

Merchant account configuration.

- **Profile** — name, avatar URL, business name
- **API key** — auto-generated per user; view masked, regenerate
- **Webhook URL** — where Fintech Pay sends test events; **Test webhook** fires a `fintechpay.webhook.test` payload
- Razorpay webhook ingestion is at `/api/razorpay/webhook` (signature-verified, updates transactions)

### Auth (`/login`, `/register`, `/forgot-password`)

- Email + password auth, bcrypt-hashed
- JWT in httpOnly cookie (`fintechpay_token`), 7-day TTL
- Login supports "remember me" (stores email/password in localStorage — demo convenience)
- Forgot password is UI-only (no email backend wired)

---

## Floating AI widget

On every dashboard page (bottom-right corner):

- Compact chat panel (~360×480px)
- Same intelligence API as quick queries (`/api/intelligence/query`) with streaming
- 3 short suggested questions
- Onboarding nudge on first dashboard visit (dismissed via localStorage `fintechpay_ai_nudge_dismissed`)

The full AI Assistant page adds persistent chat history, RAG, and longer suggested prompts.

---

## Data model

One `User` = one merchant. Everything else belongs to that user.

| Model | Purpose |
|-------|---------|
| `User` | email, password, businessName, apiKey, webhookUrl |
| `Transaction` | amount, currency, status, paymentState, country, method, razorpayId, idempotencyKey, retryCount |
| `PaymentLink` | title, amount, razorpayLinkId, shortUrl, status, expiresAt |
| `Settlement` | payout amount, status, settledAt |
| `AiSession` / `AiMessage` | full-page chat history |
| `Chunk` | embedded text chunks for RAG (float array per chunk) |

Seed data (`npm run prisma:seed`): demo merchant `demo@fintechpay.in` / `demo123`, ~380 transactions over ~90 days, 5 payment links, 3 settlements, multi-currency multi-country mix.

---

## API routes

All dashboard APIs require a valid session cookie unless noted.

| Route | Method | What it does |
|-------|--------|--------------|
| `/api/auth/login` | POST | Sign in |
| `/api/auth/register` | POST | Create merchant account |
| `/api/auth/logout` | POST | Clear cookie |
| `/api/auth/me` | GET | Current user |
| `/api/dashboard/stats` | GET | MTD stats (decoupled from chart period) |
| `/api/analytics?period=30d` | GET | Chart + breakdown data |
| `/api/transactions` | GET | Paginated, filterable ledger |
| `/api/transactions/[id]` | GET | Single transaction |
| `/api/transactions/[id]` | POST | Retry failed transaction |
| `/api/transactions/filters` | GET | Available currencies for filters |
| `/api/payment-links` | GET/POST | List / create links |
| `/api/payment-links/[id]` | PATCH | Update link status |
| `/api/settlements` | GET | Paginated settlements |
| `/api/intelligence` | GET | Anomalies, forecast, insights |
| `/api/intelligence/query` | POST | Streaming AI Q&A (floating widget) |
| `/api/notifications` | GET | Anomaly list for topbar bell |
| `/api/ai/chat` | POST | Streaming full-page chat |
| `/api/ai/embed` | POST | Embed merchant notes for RAG |
| `/api/settings/profile` | PATCH | Update profile |
| `/api/settings/api-key` | POST | Regenerate API key |
| `/api/settings/webhook` | PATCH | Save webhook URL |
| `/api/settings/webhook/test` | POST | Send test payload to webhook URL |
| `/api/razorpay/create-link` | POST | Internal Razorpay link creation |
| `/api/razorpay/webhook` | POST | Razorpay payment events (no session) |

---

## How data flows

```
Browser (React + TanStack Query)
    ↓ cookie auth
API routes (app/api/*)
    ↓
lib/* (analytics, transactions, intelligence, assistant, payment-links)
    ↓
Prisma → PostgreSQL          Razorpay API (links, webhooks)
                             Groq API (chat / query)
                             Cohere API (embeddings for RAG)
```

**Caching**

- Client: React Query, 5-minute stale time, `keepPreviousData`, no refetch on tab switch or remount by default.
- Server: `unstable_cache` on analytics, intelligence, dashboard stats (tagged per user; invalidated on mutations via `lib/cache.ts`).
- Sidebar hover prefetches route data into the query cache (`lib/prefetch-dashboard.ts`).

**Auth**

- Layout calls `getSessionUser()` → verify JWT → load user row from DB (with connection retry for Neon cold starts).
- API routes use `requireSessionUser()` or `requireSessionUserId()` — JWT-only ID lookup where a full user row isn't needed.

**Resilience**

- DB unreachable → friendly retry screen (`DatabaseUnavailable`), not a raw Prisma error.
- Neon: use **direct** connection string locally (host without `-pooler`). Drop `channel_binding=require` if connections fail.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Database | PostgreSQL + Prisma 5 |
| Payments | Razorpay Node SDK |
| AI chat / query | Groq (`groq-sdk`) |
| Embeddings | Cohere (`cohere-ai`) |
| Client state | TanStack Query v5 |
| Styling | Tailwind CSS v4, Radix UI primitives |
| Charts | Recharts (dynamic import, no SSR) |
| Toasts | Sonner |
| Themes | next-themes (light / dark / system in topbar) |

---

## Local setup

### Prerequisites

- Node 20+
- PostgreSQL (Neon free tier works)
- Razorpay test keys
- Groq API key (AI features)
- Cohere API key (optional — only needed for RAG doc upload)

### Install and run

```bash
npm install
```

Create `.env`:

```env
DATABASE_URL="postgresql://user:pass@host/neondb?sslmode=require"
JWT_SECRET="long-random-string"

RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."

GROQ_API_KEY="gsk_..."
COHERE_API_KEY="..."   # optional, for /ai-assistant doc upload
```

```bash
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo account:** `demo@fintechpay.in` / `demo123`

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint, zero warnings |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run prisma:migrate` | Apply migrations |
| `npm run prisma:seed` | Reset demo data for `demo@fintechpay.in` |
| `npx prisma migrate reset --force` | Wipe DB, migrate, seed (destructive) |

---

## Project structure

```
app/
  (auth)/                 Login, register, forgot password
  (dashboard)/            Merchant pages (shared sidebar + topbar + floating AI)
    page.tsx              Dashboard home (server shell → dashboard-client)
    transactions/         Ledger
    analytics/            Charts
    ai-intelligence/      Anomalies + forecast
    payment-links/        Link management
    settlements/          Payouts
    ai-assistant/         Full chat + RAG upload
    settings/             Profile, API key, webhook
  api/                    REST handlers (see table above)
  layout.tsx              Root layout, fonts, providers
  globals.css             Theme tokens, interact-premium, shimmer skeletons

components/
  dashboard/              Home charts and stat cards
  transactions/           Filters, rows, detail drawer
  analytics/              Analytics chart bundle
  intelligence/           Forecast chart
  payment-links/          Create modal, link cards
  assistant/              Suggestion chips (client-safe)
  ai/                     Chat bubbles, input, typing indicator
  layout/                 Sidebar, topbar, loaders, prefetcher
  shared/                 Floating AI, clear filters, DB unavailable screen
  ui/                     Radix + Tailwind primitives

hooks/                    React Query hooks per feature
lib/
  analytics.ts            SQL aggregations + cached getters
  intelligence.ts         Anomaly detection + forecast
  assistant.ts            Server-only: builds LLM context from live data
  assistant-suggestions.ts Client-safe suggestion strings
  transactions.ts           Query builders + pagination
  payment-links.ts          Razorpay link creation
  auth.ts                   JWT, cookies, session
  brand.ts                  Product name, demo email, cookie keys
  prefetch-dashboard.ts   Sidebar hover prefetch
  date-range.ts             Shared date filter validation
  filters.ts                hasActiveFilters helper
  cache.ts                  revalidateTag on mutations
  db-errors.ts              Connection error detection
  prisma-retry.ts           Retry wrapper for Neon wake-up

prisma/
  schema.prisma           Models
  seed.ts                 Demo merchant + realistic data
```


---

## UI and UX conventions

- **Loading** — skeleton shimmer components per page (`ContentAreaLoader`, `skeleton.tsx`); chart-only loading on period change.
- **Interactions** — `interact-premium`, `field-premium`, `focus-premium` in `globals.css`; no focus rings/outlines on click.
- **Filters** — `ClearFiltersButton` + `hasActiveFilters()` everywhere filters exist.
- **Theming** — CSS variables in `globals.css`; Bricolage Grotesque + Schibsted Grotesk fonts.

---

## Current limitations (honest list)

- Razorpay integration is test-mode oriented; production hardening (idempotency, reconciliation jobs) is not fully built out.
- Forgot-password flow is cosmetic — no email service.
- "Remember me" stores password in localStorage (fine for demo, not for production).
- Forecast and anomalies are heuristic, not ML models.
- Single-tenant per login — no org/team roles or multi-user merchant accounts.
- `COHERE_API_KEY` required only if you use the doc-upload panel on AI Assistant.

---

## License

Private project. Check with the repo owner before redistributing.
