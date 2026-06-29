import "server-only";

import type { GroqChatMessage } from "@/lib/groq";
import { getAnalytics, getDashboardStats } from "@/lib/analytics";
import { getIntelligence, type Anomaly } from "@/lib/intelligence";
import { prisma } from "@/lib/prisma";
import type { BreakdownPoint } from "@/types/domain";

const dayInMs = 24 * 60 * 60 * 1000;

const PRODUCT_GUIDE = `Fintech Pay Product Guide:
- Dashboard (/): MTD revenue, success rate, active payment links, revenue chart (7d/30d/90d), recent transactions, country & currency breakdown.
- Transactions (/transactions): Search by ID/description, filter by status (success/failed/pending), currency, date range; export CSV; view transaction detail with Razorpay ID, payment state, retries.
- Analytics (/analytics): Revenue by country, success rate over time, payment method pie chart, peak-hours heatmap (busiest days/times).
- Intelligence (/ai-intelligence): AI anomalies (success rate drops, volume spikes, failures), 7-day revenue forecast, insight cards (best day, top country, riskiest payment method).
- Payment Links (/payment-links): Create Razorpay payment links with title, amount, currency, expiry; grid/list view; filter by status and date; enable/disable expired links.
- Settlements (/settlements): Payout history, pending payout total, next settlement date.
- AI Assistant (/ai-assistant): Full chat with merchant notes (RAG embeddings for custom policies).
- Settings (/settings): Business name, API key, webhook URL, profile.
- Floating "Ask Fintech Pay Intelligence" button: Quick AI Q&A available on every dashboard page.
- Payments run through Razorpay (test mode). Transaction statuses: success, failed, pending. Payment states: created, authorized, captured, failed, retrying.`;

const ASSISTANT_SYSTEM_PROMPT = `You are Fintech Pay Intelligence — the smart in-app copilot for this merchant's Fintech Pay dashboard.

You receive LIVE merchant data and the Fintech Pay product guide. Answer anything about:
• Their payments, revenue, success rates, trends, and anomalies
• Analytics breakdowns (countries, currencies, methods, peak hours)
• Payment links, settlements, and dashboard metrics
• How to use Fintech Pay features and where to find things in the app

Rules:
1. Ground answers in the merchant context — cite real numbers and dates.
2. For how-to or navigation questions, use the product guide.
3. Be proactive: flag anomalies, risks, and opportunities when relevant to the question.
4. Use **bold** for key metrics. Use bullet points for multi-part answers.
5. If asked something unrelated to Fintech Pay or this merchant's payments, politely redirect.
6. Stay concise and executive (roughly 80–180 words unless the user asks for detail).`;

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * dayInMs);
}

function formatBreakdown(items: BreakdownPoint[], limit = 5): string {
  if (items.length === 0) return "None";
  return items
    .slice(0, limit)
    .map((item) => `${item.name}: ${item.revenue} revenue (${item.value} txns)`)
    .join("; ");
}

function formatAnomalies(anomalies: Anomaly[]): string {
  if (anomalies.length === 0) return "No anomalies detected in the last 30 days.";
  return anomalies
    .slice(0, 6)
    .map((a) => `• [${a.severity.toUpperCase()}] ${a.date}: ${a.description}`)
    .join("\n");
}

function formatInsights(
  insights: { title: string; value: string; description: string }[],
): string {
  return insights
    .map((i) => `• ${i.title}: **${i.value}** — ${i.description}`)
    .join("\n");
}

function findPeakHour(
  peakHours: { day: string; hour: number; volume: number }[],
): string {
  const peak = peakHours.reduce(
    (best, point) => (point.volume > best.volume ? point : best),
    peakHours[0] ?? { day: "N/A", hour: 0, volume: 0 },
  );
  if (peak.volume === 0) return "No peak hour data";
  return `${peak.day} at ${String(peak.hour).padStart(2, "0")}:00 (${peak.volume} txns)`;
}

async function getPaymentLinksSummary(userId: string) {
  const [total, active, expired] = await Promise.all([
    prisma.paymentLink.count({ where: { userId } }),
    prisma.paymentLink.count({ where: { userId, status: "active" } }),
    prisma.paymentLink.count({ where: { userId, status: "expired" } }),
  ]);

  const recent = await prisma.paymentLink.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { title: true, amount: true, currency: true, status: true },
  });

  return { total, active, expired, recent };
}

async function getSettlementsSummary(userId: string) {
  const [pendingAgg, total, latest] = await Promise.all([
    prisma.settlement.aggregate({
      where: { userId, status: { in: ["pending", "processing"] } },
      _sum: { amount: true },
    }),
    prisma.settlement.count({ where: { userId } }),
    prisma.settlement.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { amount: true, currency: true, status: true, settledAt: true },
    }),
  ]);

  return {
    pendingPayout: Number((pendingAgg._sum.amount ?? 0).toFixed(2)),
    total,
    latest,
  };
}

async function getFocusDaySummary(userId: string, focusDate: string): Promise<string> {
  let targetDate = new Date(focusDate);
  if (Number.isNaN(targetDate.getTime())) {
    return "Invalid focus date provided.";
  }

  const startOfDay = startOfUtcDay(targetDate);
  const endOfDay = addDays(startOfDay, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      createdAt: { gte: startOfDay, lt: endOfDay },
    },
    select: {
      amount: true,
      status: true,
      country: true,
      paymentMethod: true,
      currency: true,
      description: true,
    },
  });

  if (transactions.length === 0) {
    return `No transactions on ${focusDate}.`;
  }

  const successful = transactions.filter((tx) => tx.status === "success").length;
  const failed = transactions.length - successful;
  const revenue = transactions
    .filter((tx) => tx.status === "success")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return `Focus day ${focusDate}:
- ${transactions.length} transactions | ${successful} success | ${failed} failed
- Revenue: ${revenue.toFixed(2)}
- Success rate: ${((successful / transactions.length) * 100).toFixed(1)}%`;
}

export async function buildAssistantContext(
  userId: string,
  options?: { focusDate?: string },
): Promise<string> {
  const [
    user,
    dashboardStats,
    analytics,
    intelligence,
    paymentLinks,
    settlements,
    focusDaySummary,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        businessName: true,
        email: true,
        webhookUrl: true,
      },
    }),
    getDashboardStats(userId),
    getAnalytics(userId, "30d"),
    getIntelligence(userId),
    getPaymentLinksSummary(userId),
    getSettlementsSummary(userId),
    options?.focusDate
      ? getFocusDaySummary(userId, options.focusDate)
      : Promise.resolve(null),
  ]);

  const merchantName = user?.businessName ?? user?.name ?? "Merchant";
  const recentLinks =
    paymentLinks.recent.length > 0
      ? paymentLinks.recent
          .map(
            (link) =>
              `"${link.title}" ${link.amount} ${link.currency} (${link.status})`,
          )
          .join("; ")
      : "None";

  const latestSettlement = settlements.latest
    ? `${settlements.latest.amount} ${settlements.latest.currency} (${settlements.latest.status}${settlements.latest.settledAt ? `, settled ${settlements.latest.settledAt.toISOString().slice(0, 10)}` : ""})`
    : "None";

  const sections = [
    `=== MERCHANT PROFILE ===`,
    `Business: ${merchantName}`,
    `Email: ${user?.email ?? "N/A"}`,
    `Webhook configured: ${user?.webhookUrl ? "Yes" : "No"}`,
    ``,
    `=== DASHBOARD (MONTH TO DATE) ===`,
    `Revenue: ${dashboardStats.totalRevenue}`,
    `Transactions: ${dashboardStats.totalTransactions}`,
    `Success rate: ${dashboardStats.successRate}%`,
    `Active payment links: ${dashboardStats.activePaymentLinks}`,
    ``,
    `=== ANALYTICS (LAST 30 DAYS) ===`,
    `Total revenue: ${analytics.totalRevenue} | Transactions: ${analytics.totalTransactions}`,
    `Success rate: ${analytics.successRate}%`,
    `Top countries: ${formatBreakdown(analytics.countryBreakdown)}`,
    `Top currencies: ${formatBreakdown(analytics.currencyBreakdown)}`,
    `Payment methods: ${formatBreakdown(analytics.paymentMethodBreakdown)}`,
    `Busiest time: ${findPeakHour(analytics.peakHours)}`,
    ``,
    `=== AI INTELLIGENCE ===`,
    `7-day forecast total: ${intelligence.forecastTotal}`,
    `Insights:\n${formatInsights(intelligence.insights)}`,
    `Anomalies:\n${formatAnomalies(intelligence.anomalies)}`,
    ``,
    `=== PAYMENT LINKS ===`,
    `Total: ${paymentLinks.total} | Active: ${paymentLinks.active} | Expired: ${paymentLinks.expired}`,
    `Recent: ${recentLinks}`,
    ``,
    `=== SETTLEMENTS ===`,
    `Pending payout: ${settlements.pendingPayout}`,
    `Total settlement records: ${settlements.total}`,
    `Latest: ${latestSettlement}`,
  ];

  if (focusDaySummary) {
    sections.push(``, `=== FOCUS DATE ===`, focusDaySummary);
  }

  sections.push(``, `=== PRODUCT GUIDE ===`, PRODUCT_GUIDE);

  return sections.join("\n");
}

export async function buildAssistantMessages(
  userId: string,
  query: string,
  options?: {
    focusDate?: string;
    history?: GroqChatMessage[];
    ragContext?: string;
  },
): Promise<GroqChatMessage[]> {
  const context = await buildAssistantContext(userId, {
    focusDate: options?.focusDate,
  });

  const systemContent = [
    ASSISTANT_SYSTEM_PROMPT,
    "",
    "=== LIVE MERCHANT CONTEXT ===",
    context,
    options?.ragContext ?? "",
  ]
    .filter(Boolean)
    .join("\n");

  const history = (options?.history ?? []).filter(
    (message) => message.role === "user" || message.role === "assistant",
  );

  return [
    { role: "system", content: systemContent },
    ...history,
    { role: "user", content: query },
  ];
}
