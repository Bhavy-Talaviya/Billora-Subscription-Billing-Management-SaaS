import { PrismaClient, BillingInterval, SubscriptionStatus, InvoiceStatus, PaymentStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Resetting Billora database with a single clean record per table...");

  // 1. Clean existing records in reverse dependency order
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.price.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 All existing records successfully wiped.");

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 14);

  // 2. Create exactly 1 User Account
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const user = await prisma.user.create({
    data: {
      name: "Bhavy Talaviya",
      email: "admin@billora.com",
      passwordHash,
      role: UserRole.ADMIN,
      image: null,
    },
  });
  console.log("👤 Created 1 User: admin@billora.com (Password: Password123!)");

  // 3. Create exactly 1 Customer
  const customer = await prisma.customer.create({
    data: {
      name: "Acme Corporation",
      email: "billing@acme.com",
      phone: "+1 (555) 234-5678",
      company: "Acme Technologies Inc.",
      billingAddress: "100 Market Street, Suite 400",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "United States",
      notes: "Primary seed client for subscription & invoicing demonstration.",
    },
  });
  console.log("🏢 Created 1 Customer: Acme Corporation");

  // 4. Create exactly 1 Product
  const product = await prisma.product.create({
    data: {
      name: "Billora Cloud Platform",
      description: "Full-featured SaaS recurring billing, automated invoicing, and subscription management suite.",
      active: true,
    },
  });
  console.log("📦 Created 1 Product: Billora Cloud Platform");

  // 5. Create exactly 1 Price
  const price = await prisma.price.create({
    data: {
      productId: product.id,
      amount: 49.0,
      currency: "USD",
      billingInterval: BillingInterval.MONTHLY,
      active: true,
    },
  });
  console.log("🏷️  Created 1 Price: $49.00 / month");

  // 6. Create exactly 1 Subscription
  const subscription = await prisma.subscription.create({
    data: {
      customerId: customer.id,
      priceId: price.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      nextBillingDate: nextMonth,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
    },
  });
  console.log("🔄 Created 1 Subscription: ACTIVE ($49.00/mo)");

  // 7. Create exactly 1 Invoice
  const invoice = await prisma.invoice.create({
    data: {
      customerId: customer.id,
      subscriptionId: subscription.id,
      invoiceNumber: "INV-2026-001",
      issueDate: now,
      dueDate: dueDate,
      subtotal: 49.0,
      discount: 0.0,
      tax: 0.0,
      total: 49.0,
      status: InvoiceStatus.PAID,
      notes: "First monthly recurring subscription invoice.",
    },
  });
  console.log("📄 Created 1 Invoice: INV-2026-001 ($49.00 - PAID)");

  // 8. Create exactly 1 Invoice Line Item
  const invoiceItem = await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice.id,
      description: "Billora Cloud Platform - Monthly Subscription (Pro Tier)",
      quantity: 1,
      unitPrice: 49.0,
      amount: 49.0,
    },
  });
  console.log("📝 Created 1 Invoice Line Item: Pro Tier ($49.00)");

  // 9. Create exactly 1 Payment
  const payment = await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      customerId: customer.id,
      amount: 49.0,
      paymentMethod: "CARD",
      status: PaymentStatus.SUCCEEDED,
      transactionReference: "TXN-BILLORA-202601",
      paidAt: now,
    },
  });
  console.log("💳 Created 1 Payment: $49.00 SUCCEEDED (Ref: TXN-BILLORA-202601)");

  console.log("\n✅ Database fresh start complete!");
  console.log("Summary of records:");
  console.log("  • users: 1");
  console.log("  • customers: 1");
  console.log("  • products: 1");
  console.log("  • prices: 1");
  console.log("  • subscriptions: 1");
  console.log("  • invoices: 1");
  console.log("  • invoice_items: 1");
  console.log("  • payments: 1");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
