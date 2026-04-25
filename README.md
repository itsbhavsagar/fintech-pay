# PaySense — Merchant Payment Dashboard

**Real-time payment analytics and AI-powered insights for merchants.** Inspired by [xPay](https://www.ycombinator.com/companies/xpay) (YC W24), built as a portfolio project to demonstrate senior-level full-stack engineering for fintech products.

🔗 [Live Demo](#) (Coming soon) | 📖 [GitHub](#) | [📝 Technical Blog Post](#)

---

## Screenshots

| Dashboard                                                                          | Transactions                                                           |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Real-time revenue, transaction volume, success rates, and payment method breakdown | Advanced search, filtering, cursor pagination, and transaction details |
| ![Dashboard](./docs/dashboard.png)                                                 | ![Transactions](./docs/transactions.png)                               |

| Analytics                                                                             | Payment Intelligence                                                   |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Revenue by country, success rate trends, peak hours heatmap, payment method breakdown | AI anomaly detection, 7-day revenue forecast, natural language queries |
| ![Analytics](./docs/analytics.png)                                                    | ![Intelligence](./docs/intelligence.png)                               |

---

## What It Does

**PaySense** gives merchants complete visibility into their payment ecosystem. Designed for high-volume businesses processing payments across multiple countries, currencies, and payment methods.

**Payment Tracking & Monitoring** — Dashboard displays key metrics in real time: total revenue, transaction volume, success rates, and currency/country breakdowns. Detailed transaction ledger with full search, filtering, and cursor pagination for large datasets.

**Deep Analytics** — Understand payment performance across dimensions: revenue by country, success rate trends over time, payment method effectiveness, and peak transaction hours (24×7 heatmap). All computed from real transaction data, never mock.

**AI-Powered Intelligence** — Detect payment anomalies automatically: days when success rates drop below 70%, transaction volume spikes, currencies with high failure rates. 7-day revenue forecasts use linear regression on historical data. Ask natural language questions about your payments ("Why did success rate drop on Apr 15?") and get answers grounded in actual transaction data, streamed in real time via Groq.

**Revenue Operations** — Generate shareable payment links with Razorpay integration. Track link status (Active, Paid, Expired), monitor settlements (Pending, Processing, Settled), and manage payouts. Real API integration with Razorpay, not simulated.

**Conversational Analytics** — AI Assistant persists multi-turn conversations tied to sessions. Embedding-based retrieval (Cohere RAG) lets merchants upload their own merchant notes—invoice templates, refund policies, payment troubleshooting guides—and reference them in queries.

---

## Tech Stack

| Layer                       | Technology                                                  |
| --------------------------- | ----------------------------------------------------------- |
| **Frontend**                | Next.js 14 (App Router), TypeScript, TailwindCSS, Shadcn/ui |
| **State Management**        | TanStack Query v5, React Context                            |
| **Charts & Visualizations** | Recharts, Lucide Icons                                      |
| **Backend**                 | Next.js API Routes, TypeScript                              |
| **Database**                | PostgreSQL (Neon), Prisma ORM                               |
| **AI & LLMs**               | Groq (llama-3.1-8b-instant), Cohere Embeddings              |
| **Payments**                | Razorpay (test integration)                                 |
| **Authentication**          | NextAuth-style JWT (custom implementation)                  |
| **Deployment**              | Vercel (frontend), serverless functions                     |

---

## Features

### Dashboard

- **Real-time metrics**: Total revenue, transaction count, success rate, average transaction value
- **Period selector**: View data for last 7, 30, or 90 days
- **Revenue chart**: Area chart showing daily revenue trends with 30-day period
- **Success rate gauge**: Visual indicator of payment reliability
- **Payment method breakdown**: Pie chart of transactions by card, netbanking, UPI, etc.
- **Recent transactions table**: Last 10 transactions with status, country, amount, method
- **Country map heatmap**: Geographic distribution of transactions
- **Expandable transaction details**: Click any transaction to see full context

### Transactions

- **Advanced search**: Full-text search across description, transaction ID, merchant notes
- **Multi-filter dashboard**: Status (Success/Failed/Pending), currency, country, date range
- **Cursor pagination**: Efficient pagination for large transaction sets (no offset-based skipping)
- **Sortable columns**: Click headers to sort by amount, date, success rate
- **Transaction detail modal**: Full record including payment method, failure reason, fees, metadata
- **Export functionality**: Download transaction subset as CSV for accounting
- **Real-time sync**: Updates reflect in UI within seconds of settlement

### Analytics

- **Revenue by country**: Stacked bar chart showing top revenue-generating countries with filters
- **Success rate over time**: Line chart tracking success rate daily, identify drop-off periods
- **Payment method breakdown**: Pie chart with transaction counts and revenue per method
- **Peak hours heatmap**: 24×7 transaction distribution by day of week and hour
- **Currency analysis**: Revenue and transaction volume broken down by currency
- **Period comparison**: Toggle between 7d/30d/90d periods
- **Downloadable insights**: Export analytics snapshot with date range and filters

### Payment Intelligence (AI)

- **Anomaly Detection**: Analyzes last 30 days of transactions to identify:
  - Success rate drops below 70% (severity: Critical/Warning)
  - Transaction volume spikes 2× above average (severity: Info)
  - Currencies with >25% failure rates (severity: Critical/Warning)
  - Countries with zero transactions vs. previous week
- **7-Day Revenue Forecast**: Linear regression model trained on 30-day revenue history, predicts next 7 days with predicted total
- **Top Insights Cards**:
  - Best performing day (highest avg success rate by day of week)
  - Highest revenue country (total revenue this month)
  - Payment method to watch (highest failure rate)
- **Natural Language Queries**: Ask "Why did my success rate drop on Apr 15?" and get real-time streamed response analyzing that day's transactions, failure reasons, top affected countries/methods
- **Grounded in Real Data**: All insights computed from actual transactions in your database, no hallucinations

### AI Assistant

- **Multi-turn conversations**: Persistent chat sessions tied to user account
- **Transaction context injection**: System automatically builds context from your last 30 days of transaction data
- **Merchant notes (RAG)**:
  - Upload custom documents (invoices, refund policies, troubleshooting guides)
  - Cohere embeddings index your documents
  - Relevant sections automatically injected into chat context
  - Ask questions like "What's my refund policy for international payments?"
- **Streaming responses**: Answers stream in real time via Groq for instant feedback
- **Session management**: Browse past conversations, revisit previous questions
- **12-turn history**: Last 12 messages auto-loaded as context for coherence

### Payment Links

- **Razorpay integration**: Create shareable payment links via real Razorpay API
- **Link management dashboard**: View all payment links with title, amount, currency, status
- **Link status tracking**: Active → Customer pays → Paid/Expired states
- **Expiration control**: Set expiration dates on links
- **Share functionality**: Copy short URL or generate QR code
- **Real payments**: Links are live in Razorpay test environment (use test card: 4111 1111 1111 1111)

### Settlements

- **Payout tracking**: View pending, processing, and settled payouts
- **Settlement status timeline**: When payments moved between states
- **Bulk settlement**: View net settlement amount after fees
- **Currency-wise breakdown**: Separate settlement tracks for each currency

### Settings

- **Profile management**: Update business name, email, account info
- **API key generation**: Create/revoke API keys for merchant integrations
- **Webhook configuration**: Set custom webhook URL for transaction events
- **Webhook testing**: Send test webhook payload to validate endpoint
- **Theme toggle**: Dark/light mode with system preference detection

---

## Project Structure

```
fintech-pay/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard
│   │   ├── transactions/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── ai-intelligence/page.tsx    # NEW: Payment Intelligence
│   │   ├── ai-assistant/page.tsx
│   │   ├── payment-links/page.tsx
│   │   ├── settlements/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── ai/chat/route.ts            # AI Assistant streaming
│       ├── ai/embed/route.ts           # RAG embedding upload
│       ├── intelligence/
│       │   ├── route.ts                # NEW: GET anomalies, forecast, insights
│       │   └── query/route.ts          # NEW: POST natural language query
│       ├── analytics/route.ts
│       ├── auth/{login,me,register}/route.ts
│       ├── payment-links/route.ts
│       ├── razorpay/
│       │   ├── create-link/route.ts
│       │   └── webhook/route.ts
│       ├── settings/{api-key,profile,webhook}/route.ts
│       ├── settlements/route.ts
│       └── transactions/{id/,}/route.ts
├── components/
│   ├── ai/
│   │   ├── AITypingIndicator.tsx
│   │   ├── ChatBubble.tsx
│   │   └── ChatInput.tsx
│   ├── dashboard/
│   │   ├── CountryMap.tsx
│   │   ├── CurrencyBreakdownChart.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── StatsCard.tsx
│   │   ├── SuccessRateGauge.tsx
│   │   └── TransactionTable.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── Topbar.tsx
│   ├── payment-links/
│   │   ├── CreateLinkModal.tsx
│   │   └── LinkCard.tsx
│   ├── transactions/
│   │   ├── TransactionDetail.tsx
│   │   ├── TransactionFilters.tsx
│   │   └── TransactionRow.tsx
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── status-badge.tsx
│       ├── table.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
├── hooks/
│   ├── useAnalytics.ts
│   ├── useAIChat.ts
│   ├── useIntelligence.ts              # NEW: Payment Intelligence hook
│   ├── usePaymentLinks.ts
│   └── useTransactions.ts
├── lib/
│   ├── analytics.ts                    # Dashboard stats computation
│   ├── api.ts                          # Error handling utilities
│   ├── auth.ts                         # JWT auth, session validation
│   ├── cohere.ts                       # Embedding and RAG
│   ├── fetcher.ts                      # SWR/React Query fetch wrapper
│   ├── groq.ts                         # Groq LLM streaming
│   ├── mappers.ts                      # DTO transformations
│   ├── payment-links.ts                # Razorpay link helpers
│   ├── prisma.ts                       # Prisma client singleton
│   ├── razorpay.ts                     # Razorpay SDK wrapper
│   └── utils.ts                        # Formatting, date helpers
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                         # Database seed script
│   └── migrations/
├── types/
│   └── domain.ts                       # Shared TypeScript types
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json                     # Shadcn config
├── .env.example
└── README.md
```

---

## Database Schema

**User** — Merchant account; email unique; apiKey and webhookUrl for external integrations

**Transaction** — Payment record; amount, currency, country, paymentMethod, status, razorpayId; indexed on (userId, createdAt) for analytics queries

**PaymentLink** — Shareable payment link; razorpayLinkId for integration; status tracks (Active/Paid/Expired); expiresAt for expiration logic

**Settlement** — Payout record; amount, currency, status (Pending/Processing/Settled), settledAt timestamp

**AiSession** — Persistent chat session; tied to User; messages stored in AiMessage

**AiMessage** — Chat message; role (user/system/assistant), content, createdAt; indexed on (sessionId, createdAt)

**Chunk** — RAG document chunk; embedding (pgvector), userId; text content for semantic search via Cohere

---

## AI Architecture

### AI Assistant: Transaction Context Injection

- **Context Builder** (`buildMerchantContext` in `lib/analytics.ts`): Fetches user's last 30 days of transactions, computes total revenue, transaction count, success rate, breakdown by country/currency/method. Returns markdown formatted context string.
- **Query Handling** (`app/api/ai/chat/route.ts`): POST receives user message, retrieves session + last 12 messages, builds fresh context, injects into system prompt, streams response via Groq
- **Streaming** (`lib/groq.ts`): `streamChat()` uses Groq SDK with streaming=true, yields chunks to caller, max 300 tokens per response
- **Persistence**: AiMessage records stored in PostgreSQL, associated with AiSession, enabling multi-turn coherence

### Payment Intelligence: Real-Time Anomaly Detection

- **Anomaly Computation** (`computeAnomalies` in `app/api/intelligence/route.ts`):
  - Fetches 30-day transaction window
  - Groups by day: calculates daily success rate, transaction volume
  - Detects drops <70% success or 2× volume spikes (severity: critical/warning/info)
  - Analyzes currency-wise failure rates, flags >25% failures
  - Returns sorted by severity
- **Forecast** (`calculateForecast`): Simple linear regression on 30 daily revenues, predicts 7 days, returns data points with `isForecast: true` flag for chart rendering
- **Insights** (`GET /api/intelligence`): Best performing day by success rate, highest revenue country, riskiest payment method
- **Natural Language Query** (`POST /api/intelligence/query`):
  - Accepts query + optional date parameter
  - Fetches relevant transactions (specific date or last 7 days)
  - Builds context: transaction count, success rate, top countries/methods, failure reasons
  - Streams Groq response (system: "You are a payment analyst...under 80 words")
  - Grounded entirely in provided data (prevents hallucinations)

### RAG for Merchant Notes

- **Upload Flow** (`POST /api/ai/embed`):
  - User uploads document (text, markdown, PDF parsed to text)
  - Split into chunks (512 token windows with 64 token overlap)
  - Cohere `embed-english-v3.0` generates embedding (1024-dim vector)
  - Chunks stored in PostgreSQL with embedding, userId, and raw text
- **Retrieval** (`retrieveRelevantChunks` in `lib/cohere.ts`):
  - User query embedded via Cohere
  - Cosine similarity search (pgvector) against user's chunks
  - Top K chunks returned (typically K=3)
  - Injected into AI chat system prompt
- **Example**: "What's my refund policy?" → Retrieves chunks from uploaded refund policy doc → LLM answers with reference

---

## Getting Started

### Prerequisites

- **Node.js 20+** — For Next.js 14 and modern tooling
- **PostgreSQL** — Local or [Neon](https://neon.tech) cloud (recommended for this project)
- **Groq API Key** — Get free at [console.groq.com](https://console.groq.com)
- **Cohere API Key** — Get free at [cohere.com](https://cohere.com/dashboard)
- **Razorpay Account** — Sign up at [razorpay.com](https://razorpay.com) (use test mode)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd fintech-pay

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see next section)

# Run database migrations
npx prisma migrate deploy

# Seed database with demo user and transactions
npx prisma db seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to login.

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/paysense

# Authentication (JWT)
JWT_SECRET=your-secure-random-string-min-32-chars
JWT_EXPIRY=7d

# Groq LLM
GROQ_API_KEY=gsk_...

# Cohere Embeddings
COHERE_API_KEY=your-cohere-key

# Razorpay (Test Keys)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_SECRET=your-razorpay-secret

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: Stripe (not implemented, for future)
# STRIPE_SECRET_KEY=sk_test_...
```

**Explanation:**

- `DATABASE_URL`: Connection string for PostgreSQL (Neon provides this on free tier)
- `JWT_SECRET`: Generate with `openssl rand -base64 32` — sign session JWTs
- `GROQ_API_KEY`: Free tier includes 10K tokens/day — sufficient for development
- `COHERE_API_KEY`: Free tier supports embedding + retrieval
- `RAZORPAY_*`: Test keys from Razorpay dashboard — all charges are simulated

### Seed Data

```bash
npx prisma db seed
```

Creates:

- **1 Demo User**: `demo@paysense.in` / `demo123`
- **200 Transactions**: Distributed across 90 days, multiple currencies (INR, USD, EUR, GBP), countries (India, US, UK, Singapore, Germany)
- **5 Payment Links**: Mix of Active/Paid/Expired states
- **3 Settlements**: Pending/Processing/Settled
- **Sample Merchant Notes**: Document chunk for RAG testing

**Login and explore:**

```
Email: demo@paysense.in
Password: demo123
```

All charts, analytics, AI features use this seeded data.

---

## Known Limitations

- **Rate Limiting**: In-memory implementation (good for development). Production needs Redis for distributed rate limiting across multiple server instances.
- **Razorpay Webhooks**: Local testing requires ngrok tunnel; `npm run tunnel:dev` or manual ngrok setup. Production auto-verifies webhook signature.
- **Revenue Forecast**: Linear regression is simple and sufficient for portfolio demo. Production should use ARIMA, Prophet, or fine-tuned ML model trained on merchant-specific seasonality.
- **RAG Scalability**: PostgreSQL pgvector works for <1M embeddings. Production needs dedicated vector DB (Pinecone, Weaviate).
- **Concurrent Sessions**: No session conflict detection. If same user logs in from 2 tabs, last write wins. Production needs optimistic locking or conflict resolution.
- **File Upload**: RAG document upload limited to 1MB text. Production needs chunking for large PDFs.
- **Transaction Sync**: Manual seed only. Production integrates live webhook streaming from payment processor.

---

## What I'd Add in Production

**Scalability:**

- Redis for distributed rate limiting, session caching, real-time notifications
- pgvector → Pinecone/Weaviate for vector DB at scale
- Dedicated job queue (Bull, RabbitMQ) for async embedding, forecasting
- CDN for analytics charts (memoize expensive aggregations)

**Payment Processing:**

- Multi-merchant support with role-based access control (RBAC)
- Webhook signature verification with retry logic
- Real Razorpay settlement reconciliation
- Support for additional payment processors (Stripe, Square)

**AI & Anomaly Detection:**

- ML model for revenue forecasting (ARIMA, Prophet, LightGBM)
- Anomaly detection via Isolation Forest or Autoencoders (not heuristics)
- Real-time alerting: Slack/email notifications for critical anomalies
- Custom anomaly thresholds per merchant (learn their baseline)

**Analytics:**

- Data warehouse (Snowflake/BigQuery) for historical analysis
- Scheduled daily/weekly/monthly report generation (PDF email)
- Custom dashboard builder (let merchants drag-drop widgets)
- A/B testing framework for payment method recommendations

**Security & Compliance:**

- SOC2 Type II audit trail
- PCI DSS compliance (tokenization, no storing raw card data)
- Encryption at rest + in transit (TLS 1.3)
- Audit logging for all data access

**Operations:**

- Admin panel for support team (view any merchant, troubleshoot)
- Usage analytics and billing
- Feature flags for gradual rollout
- Monitoring & alerting (Datadog, New Relic)

---

## Built By

**Bhavsagar** — Full Stack Product Engineer

🔗 **Links:**

- [GitHub](https://github.com/bhavsagar)
- [LinkedIn](https://linkedin.com/in/bhavsagar)
- [Portfolio](https://bhavsagar.dev)
- [AI LMS Live Demo](https://ai-lms.vercel.app)

---

## License

MIT — Feel free to fork and build on this.

---

**Last Updated:** April 2026
