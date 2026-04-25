import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type Currency = "USD" | "EUR" | "GBP" | "INR" | "SGD" | "AED";
type Country = "US" | "UK" | "DE" | "IN" | "SG" | "AE" | "AU" | "CA";
type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";
type TransactionStatus = "success" | "failed" | "pending";
type PaymentLinkStatus = "active" | "expired" | "paid";
type SettlementStatus = "pending" | "processing" | "settled";

type CountryProfile = {
  country: Country;
  currencies: readonly Currency[];
  amountRange: readonly [number, number];
};

const dayInMs = 24 * 60 * 60 * 1000;

const countryProfiles: readonly CountryProfile[] = [
  { country: "US", currencies: ["USD"], amountRange: [29, 1850] },
  { country: "UK", currencies: ["GBP", "EUR"], amountRange: [24, 1400] },
  { country: "DE", currencies: ["EUR"], amountRange: [22, 1320] },
  { country: "IN", currencies: ["INR"], amountRange: [999, 155000] },
  { country: "SG", currencies: ["SGD", "USD"], amountRange: [39, 2200] },
  { country: "AE", currencies: ["AED", "USD"], amountRange: [120, 8200] },
  { country: "AU", currencies: ["USD", "GBP"], amountRange: [35, 1750] },
  { country: "CA", currencies: ["USD", "GBP"], amountRange: [32, 1650] },
];

const descriptions: readonly string[] = [
  "SaaS subscription payment",
  "Annual platform renewal",
  "Developer API usage invoice",
  "Marketplace seller payout collection",
  "Cross-border checkout payment",
  "Enterprise onboarding fee",
  "Usage-based billing cycle",
  "Premium support add-on",
  "Payment link checkout",
  "Hosted checkout session",
];

const paymentLinkSeeds: readonly {
  title: string;
  amount: number;
  currency: Currency;
  status: PaymentLinkStatus;
  expiresInDays: number | null;
}[] = [
  {
    title: "Enterprise onboarding invoice",
    amount: 2499,
    currency: "USD",
    status: "active",
    expiresInDays: 14,
  },
  {
    title: "Q2 renewal collection",
    amount: 1850,
    currency: "GBP",
    status: "paid",
    expiresInDays: null,
  },
  {
    title: "India reseller subscription",
    amount: 125000,
    currency: "INR",
    status: "active",
    expiresInDays: 7,
  },
  {
    title: "Singapore pilot checkout",
    amount: 3200,
    currency: "SGD",
    status: "expired",
    expiresInDays: -3,
  },
  {
    title: "Dubai integration milestone",
    amount: 8600,
    currency: "AED",
    status: "active",
    expiresInDays: 21,
  },
];

function createSeededRandom(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
}

const random = createSeededRandom(42_019);

function pickOne<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("Cannot pick from an empty collection.");
  }

  const index = Math.floor(random() * items.length);
  const item = items[index];

  if (item === undefined) {
    throw new Error("Selected item was unexpectedly missing.");
  }

  return item;
}

function moneyBetween(min: number, max: number): number {
  return Number((min + random() * (max - min)).toFixed(2));
}

function createStatusPool(): TransactionStatus[] {
  return [
    ...Array<TransactionStatus>(170).fill("success"),
    ...Array<TransactionStatus>(20).fill("failed"),
    ...Array<TransactionStatus>(10).fill("pending"),
  ].sort(() => random() - 0.5);
}

function paymentMethodForCountry(country: Country): PaymentMethod {
  if (country === "IN") {
    return pickOne(["upi", "card", "netbanking", "wallet"]);
  }

  if (country === "SG" || country === "AE") {
    return pickOne(["card", "wallet", "netbanking"]);
  }

  return pickOne(["card", "card", "wallet", "netbanking"]);
}

function createdAtWithinLast90Days(): Date {
  const daysAgo = Math.floor(random() * 90);
  const minutesAgo = Math.floor(random() * 24 * 60);

  return new Date(Date.now() - daysAgo * dayInMs - minutesAgo * 60 * 1000);
}

function buildTransactions(
  userId: string,
): Prisma.TransactionCreateManyInput[] {
  const statusPool = createStatusPool();

  return statusPool.map((status, index) => {
    const profile = pickOne(countryProfiles);
    const currency = pickOne(profile.currencies);
    const paymentMethod = paymentMethodForCountry(profile.country);
    const suffix = String(index + 1).padStart(4, "0");

    return {
      userId,
      amount: moneyBetween(profile.amountRange[0], profile.amountRange[1]),
      currency,
      status,
      country: profile.country,
      paymentMethod,
      razorpayId:
        status === "pending"
          ? null
          : `pay_test_${suffix}_${profile.country.toLowerCase()}`,
      description: `${pickOne(descriptions)} - ${profile.country}`,
      createdAt: createdAtWithinLast90Days(),
    };
  });
}

function buildPaymentLinks(
  userId: string,
): Prisma.PaymentLinkCreateManyInput[] {
  return paymentLinkSeeds.map((link, index) => {
    const suffix = String(index + 1).padStart(3, "0");

    return {
      userId,
      title: link.title,
      amount: link.amount,
      currency: link.currency,
      razorpayLinkId: `plink_test_${suffix}`,
      shortUrl: `https://rzp.io/i/paysense-${suffix}`,
      status: link.status,
      expiresAt:
        link.expiresInDays === null
          ? null
          : new Date(Date.now() + link.expiresInDays * dayInMs),
      createdAt: new Date(Date.now() - (index + 2) * dayInMs),
    };
  });
}

function buildSettlements(userId: string): Prisma.SettlementCreateManyInput[] {
  const settlements: readonly {
    amount: number;
    currency: Currency;
    status: SettlementStatus;
    settledAt: Date | null;
    createdAt: Date;
  }[] = [
    {
      amount: 18420.5,
      currency: "USD",
      status: "pending",
      settledAt: null,
      createdAt: new Date(Date.now() - 1 * dayInMs),
    },
    {
      amount: 940000,
      currency: "INR",
      status: "processing",
      settledAt: null,
      createdAt: new Date(Date.now() - 4 * dayInMs),
    },
    {
      amount: 12650.75,
      currency: "EUR",
      status: "settled",
      settledAt: new Date(Date.now() - 9 * dayInMs),
      createdAt: new Date(Date.now() - 11 * dayInMs),
    },
  ];

  return settlements.map((settlement) => ({
    userId,
    amount: settlement.amount,
    currency: settlement.currency,
    status: settlement.status,
    settledAt: settlement.settledAt,
    createdAt: settlement.createdAt,
  }));
}

async function main(): Promise<void> {
  const password = await bcrypt.hash("demo123", 12);

  await prisma.user.deleteMany({
    where: {
      email: "demo@paysense.in",
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "demo@paysense.in",
      name: "Aarav Mehta",
      businessName: "PaySense Demo Store",
      password,
      webhookUrl: "https://example.com/api/paysense/webhook",
    },
  });

  await prisma.transaction.createMany({
    data: buildTransactions(user.id),
  });

  await prisma.paymentLink.createMany({
    data: buildPaymentLinks(user.id),
  });

  await prisma.settlement.createMany({
    data: buildSettlements(user.id),
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
