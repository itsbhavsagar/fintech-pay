export type TransactionStatus = "success" | "failed" | "pending";
export type PaymentLinkStatus = "active" | "expired" | "paid";
export type SettlementStatus = "pending" | "processing" | "settled";
export type Period = "7d" | "30d" | "90d";
export type ThemePreference = "light" | "dark" | "system";
export type PaymentState =
  | "created"
  | "authorized"
  | "captured"
  | "failed"
  | "retrying";

export type UserDto = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  businessName: string | null;
  apiKey: string;
  webhookUrl: string | null;
  createdAt: string;
};

export type TransactionDto = {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentState: PaymentState;
  country: string;
  paymentMethod: string;
  razorpayId: string | null;
  idempotencyKey: string | null;
  description: string | null;
  createdAt: string;
};

export type PaymentLinkDto = {
  id: string;
  title: string;
  amount: number;
  currency: string;
  razorpayLinkId: string | null;
  shortUrl: string | null;
  status: PaymentLinkStatus;
  expiresAt: string | null;
  createdAt: string;
};

export type SettlementDto = {
  id: string;
  amount: number;
  currency: string;
  status: SettlementStatus;
  settledAt: string | null;
  createdAt: string;
};

export type DailyRevenuePoint = {
  date: string;
  revenue: number;
  transactions: number;
};

export type BreakdownPoint = {
  name: string;
  value: number;
  revenue: number;
};

export type SuccessRatePoint = {
  date: string;
  successRate: number;
};

export type PeakHourPoint = {
  day: string;
  hour: number;
  volume: number;
};

export type AnalyticsDto = {
  dailyRevenue: DailyRevenuePoint[];
  countryBreakdown: BreakdownPoint[];
  currencyBreakdown: BreakdownPoint[];
  successRate: number;
  successRateOverTime: SuccessRatePoint[];
  paymentMethodBreakdown: BreakdownPoint[];
  peakHours: PeakHourPoint[];
  totalRevenue: number;
  totalTransactions: number;
};

export type DashboardStatsDto = {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  activePaymentLinks: number;
};

export type TransactionsResponseDto = {
  transactions: TransactionDto[];
  nextCursor: string | null;
};

export type ChatMessageDto = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type AiSessionDto = {
  id: string;
  messages: ChatMessageDto[];
  createdAt: string;
};
