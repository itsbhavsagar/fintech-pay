# Fintech Pay

A merchant dashboard for people who take online payments and need one place to see what's going on.

If you run a store or SaaS and use Razorpay, this is the screen you open to check revenue, dig into failed transactions, create payment links, and see when money actually hits your bank. Your customers never see it — they only hit checkout or a payment link.

---

## What it's for

You're not logging into Razorpay, spreadsheets, and a separate analytics tool. You log in here and get the operational view: how much came in, what broke, what's pending payout, and whether anything looks off.

Built as a single-merchant app. One login = one business. Not a platform admin tool.

---

## What's in it

**Dashboard** — revenue, success rate, active links, revenue chart (7 / 30 / 90 days), recent transactions, country and currency breakdown.

**Transactions** — search and filter the full ledger, export CSV, open a transaction to see Razorpay ID, payment state, retries. Failed ones can be retried from the UI.

**Analytics** — deeper charts: revenue by country, success rate over time, payment methods, busiest hours.

**Intelligence** — flags weird patterns (success rate drops, spikes, quiet days), a simple 7-day revenue forecast, and a few quick insight cards. Rule-based, not AI.

**Payment links** — create Razorpay links (amount, currency, expiry), copy them, filter the list, switch grid/list view.

**Settlements** — payout history and what's still pending.

**AI assistant** — full chat page that answers questions using your real account data (revenue, links, settlements, anomalies). You can also paste notes (refund policy, etc.) and it'll use them in replies.

**Floating chat button** — same AI idea, smaller panel in the bottom-right corner on every dashboard page. Shows a one-time nudge on first visit if you haven't opened it.

**Settings** — profile, business name, API key, webhook URL with a test button.

**Auth** — register, login, forgot-password screen (password reset isn't wired to email yet).

---

## Demo

After seeding the database:

- **Email:** `demo@fintechpay.in`
- **Password:** `demo123`

```bash
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Needs `.env` with `DATABASE_URL`, `JWT_SECRET`, Razorpay test keys, and `GROQ_API_KEY` for the AI bits.

If login shows a service error toast, your Postgres host may have changed — copy a fresh connection string from the Neon dashboard. Use the **pooled** URL (`-pooler` in the host) if direct fails, or direct if pooler fails.
