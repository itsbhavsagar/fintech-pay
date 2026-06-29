import { DEMO_EMAIL, PRODUCT_NAME, PRODUCT_SLUG } from "../lib/brand";
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

const transactionCount = 380;

function createStatusPool(count: number): TransactionStatus[] {
  const successCount = Math.round(count * 0.85);
  const failedCount = Math.round(count * 0.1);
  const pendingCount = count - successCount - failedCount;

  return [
    ...Array<TransactionStatus>(successCount).fill("success"),
    ...Array<TransactionStatus>(failedCount).fill("failed"),
    ...Array<TransactionStatus>(pendingCount).fill("pending"),
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

const businessHourWeights: readonly number[] = [
  1, 1, 1, 1, 1, 1, 2, 4, 8, 12, 14, 15, 13, 11, 14, 15, 14, 12, 9, 6, 4, 3, 2, 1,
];

function pickWeightedHour(): number {
  const total = businessHourWeights.reduce((sum, weight) => sum + weight, 0);
  let roll = random() * total;

  for (let hour = 0; hour < businessHourWeights.length; hour += 1) {
    roll -= businessHourWeights[hour] ?? 0;
    if (roll <= 0) {
      return hour;
    }
  }

  return 12;
}

function dailyTransactionCount(daysAgo: number, dayOfWeek: number): number {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const baseMin = isWeekend ? 1 : 3;
  const baseMax = isWeekend ? 4 : 8;
  let count = baseMin + Math.floor(random() * (baseMax - baseMin + 1));

  if (daysAgo < 7) {
    count += 2 + Math.floor(random() * 3);
  } else if (daysAgo < 30) {
    count += 1 + Math.floor(random() * 2);
  }

  if (daysAgo === 0) {
    count = Math.max(count, 6);
  }

  return count;
}

function buildTransactionTimestamps(targetCount: number): Date[] {
  const timestamps: Date[] = [];
  const today = new Date();
  const startOfToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  for (let daysAgo = 89; daysAgo >= 0; daysAgo -= 1) {
    const dayStart = new Date(startOfToday.getTime() - daysAgo * dayInMs);
    const dayOfWeek = dayStart.getUTCDay();
    const count = dailyTransactionCount(daysAgo, dayOfWeek);

    for (let index = 0; index < count; index += 1) {
      const hour = pickWeightedHour();
      const minute = Math.floor(random() * 60);
      const second = Math.floor(random() * 60);

      timestamps.push(
        new Date(
          Date.UTC(
            dayStart.getUTCFullYear(),
            dayStart.getUTCMonth(),
            dayStart.getUTCDate(),
            hour,
            minute,
            second,
          ),
        ),
      );
    }
  }

  timestamps.sort((left, right) => left.getTime() - right.getTime());

  if (timestamps.length > targetCount) {
    const step = timestamps.length / targetCount;
    return Array.from({ length: targetCount }, (_, index) => {
      const picked = timestamps[Math.floor(index * step)];
      if (picked === undefined) {
        throw new Error("Failed to sample transaction timestamps.");
      }
      return picked;
    });
  }

  while (timestamps.length < targetCount) {
    const daysAgo = Math.floor(Math.pow(random(), 1.5) * 30);
    const dayStart = new Date(startOfToday.getTime() - daysAgo * dayInMs);
    const hour = pickWeightedHour();
    timestamps.push(
      new Date(
        Date.UTC(
          dayStart.getUTCFullYear(),
          dayStart.getUTCMonth(),
          dayStart.getUTCDate(),
          hour,
          Math.floor(random() * 60),
          Math.floor(random() * 60),
        ),
      ),
    );
  }

  return timestamps.sort((left, right) => left.getTime() - right.getTime());
}

function buildTransactions(
  userId: string,
): Prisma.TransactionCreateManyInput[] {
  const statusPool = createStatusPool(transactionCount);
  const timestamps = buildTransactionTimestamps(transactionCount);

  return statusPool.map((status, index) => {
    const profile = pickOne(countryProfiles);
    const currency = pickOne(profile.currencies);
    const paymentMethod = paymentMethodForCountry(profile.country);
    const suffix = String(index + 1).padStart(4, "0");
    const createdAt = timestamps[index];

    if (createdAt === undefined) {
      throw new Error(`Missing timestamp for transaction ${index + 1}.`);
    }

    const updatedAt = new Date(
      createdAt.getTime() + Math.floor(random() * 15 * 60 * 1000),
    );

    return {
      userId,

      amount:
        currency === "INR"
          ? Math.round(
              moneyBetween(profile.amountRange[0], profile.amountRange[1]),
            )
          : Math.round(
              moneyBetween(profile.amountRange[0], profile.amountRange[1]) *
                100,
            ),

      currency,
      status,

      paymentState:
        status === "success"
          ? "captured"
          : status === "failed"
            ? "failed"
            : "created",

      country: profile.country,
      paymentMethod,

      razorpayId:
        status === "pending"
          ? null
          : `pay_test_${suffix}_${profile.country.toLowerCase()}`,

      idempotencyKey: `idem_${userId}_${suffix}`,

      retryCount: status === "failed" ? 1 + Math.floor(random() * 3) : 0,
      lastRetryAt:
        status === "failed"
          ? new Date(createdAt.getTime() + Math.floor(random() * 2 * 60 * 60 * 1000))
          : null,

      description: `${pickOne(descriptions)} - ${profile.country}`,

      createdAt,
      updatedAt,
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
      shortUrl: `https://rzp.io/i/${PRODUCT_SLUG}-${suffix}`,
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
      email: DEMO_EMAIL,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Aarav Mehta",
      businessName: `${PRODUCT_NAME} Demo Store`,
      password,
      webhookUrl: `https://example.com/api/${PRODUCT_SLUG}/webhook`,
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

  const latestTransaction = await prisma.transaction.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const earliestTransaction = await prisma.transaction.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  console.log(`Seed complete for ${DEMO_EMAIL}`);
  console.log(`  Transactions: ${transactionCount}`);
  console.log(`  Payment links: ${paymentLinkSeeds.length}`);
  console.log(`  Settlements: 3`);
  if (earliestTransaction && latestTransaction) {
    console.log(
      `  Date range: ${earliestTransaction.createdAt.toISOString().slice(0, 10)} → ${latestTransaction.createdAt.toISOString().slice(0, 10)}`,
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
