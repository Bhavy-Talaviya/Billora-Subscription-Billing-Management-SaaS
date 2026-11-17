import { PrismaClient, BillingInterval, SubscriptionStatus, InvoiceStatus, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Billora database seed...");

  // Clean existing records in reverse dependency order
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.price.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();

  console.log("🧹 Cleaned existing database tables.");

  // 1. Seed 12 Customers
  const customerData = [
    {
      name: "Acme Technologies Inc.",
      email: "billing@acme.com",
      phone: "+1 (555) 234-5678",
      company: "Acme Technologies",
      billingAddress: "100 Market Street, Suite 400",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "United States",
      notes: "Enterprise tier client with high API throughput.",
    },
    {
      name: "Starlight Digital Media",
      email: "finance@starlight.io",
      phone: "+1 (555) 345-6789",
      company: "Starlight Media",
      billingAddress: "55 Hudson Yards, 28th Fl",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "United States",
      notes: "Annual subscriber on Professional tier.",
    },
    {
      name: "Nexus Web Agency",
      email: "accounts@nexus.dev",
      phone: "+44 20 7946 0912",
      company: "Nexus Digital Agency",
      billingAddress: "142 Shoreditch High St",
      city: "London",
      state: "Greater London",
      postalCode: "E1 6JE",
      country: "United Kingdom",
      notes: "Trial completed successfully, monthly billing.",
    },
    {
      name: "Vanguard Creative Studios",
      email: "payments@vanguard.co",
      phone: "+1 (555) 456-7890",
      company: "Vanguard Studios",
      billingAddress: "800 Wilshire Blvd",
      city: "Los Angeles",
      state: "CA",
      postalCode: "90017",
      country: "United States",
      notes: "Past due invoice follow-up pending.",
    },
    {
      name: "Hyperion Research Labs",
      email: "alex@hyperion.com",
      phone: "+1 (555) 567-8901",
      company: "Hyperion Labs",
      billingAddress: "250 Kendall Street",
      city: "Cambridge",
      state: "MA",
      postalCode: "02142",
      country: "United States",
      notes: "Dedicated support add-on attached.",
    },
    {
      name: "Zenith Intelligence AI",
      email: "jchen@zenith.ai",
      phone: "+1 (555) 678-9012",
      company: "Zenith Intelligence",
      billingAddress: "400 Pine Street",
      city: "Seattle",
      state: "WA",
      postalCode: "98101",
      country: "United States",
      notes: "Temporary subscription pause requested.",
    },
    {
      name: "Krypton Web Solutions",
      email: "billing@kryptonweb.net",
      phone: "+49 30 1234567",
      company: "Krypton Systems GmbH",
      billingAddress: "Friedrichstraße 176",
      city: "Berlin",
      state: "Berlin",
      postalCode: "10117",
      country: "Germany",
      notes: "EU VAT registered customer.",
    },
    {
      name: "Solaris Cloud Systems",
      email: "devops@solaris.cloud",
      phone: "+1 (555) 789-0123",
      company: "Solaris Cloud Corp",
      billingAddress: "1200 17th Street",
      city: "Denver",
      state: "CO",
      postalCode: "80202",
      country: "United States",
      notes: "High volume metered billing user.",
    },
    {
      name: "Apex Logistics Group",
      email: "invoices@apexlogistics.com",
      phone: "+1 (555) 890-1234",
      company: "Apex Global Logistics",
      billingAddress: "300 South Wacker Dr",
      city: "Chicago",
      state: "IL",
      postalCode: "60606",
      country: "United States",
      notes: "Annual enterprise contract.",
    },
    {
      name: "Quantum Software Labs",
      email: "admin@quantumsoft.ca",
      phone: "+1 (416) 555-0199",
      company: "Quantum Labs Canada",
      billingAddress: "100 King St West",
      city: "Toronto",
      state: "ON",
      postalCode: "M5X 1A9",
      country: "Canada",
      notes: "Canadian tax jurisdiction exempt.",
    },
    {
      name: "Horizon Data Partners",
      email: "finance@horizondata.co",
      phone: "+1 (555) 901-2345",
      company: "Horizon Analytics",
      billingAddress: "700 Louisiana St",
      city: "Houston",
      state: "TX",
      postalCode: "77002",
      country: "United States",
      notes: "Custom reporting subscriber.",
    },
    {
      name: "BluePeak E-Commerce",
      email: "billing@bluepeak.store",
      phone: "+61 2 9876 5432",
      company: "BluePeak Retail Pty",
      billingAddress: "2 Park Street",
      city: "Sydney",
      state: "NSW",
      postalCode: "2000",
      country: "Australia",
      notes: "International customer on Starter tier.",
    },
  ];

  const createdCustomers = [];
  for (const c of customerData) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);
  }
  console.log(`✅ Created ${createdCustomers.length} customers.`);

  // 2. Seed 6 Products
  const productData = [
    {
      name: "Billora Starter Platform",
      description: "Essential recurring billing and invoice generation for emerging startups.",
      active: true,
    },
    {
      name: "Billora Professional Suite",
      description: "Full billing lifecycle automation, dunning recovery, and multi-currency support.",
      active: true,
    },
    {
      name: "Billora Enterprise Platform",
      description: "Custom contracts, dedicated SLA, unlimited seats, and compliance auditing.",
      active: true,
    },
    {
      name: "Advanced Revenue Analytics Add-on",
      description: "Cohort retention analysis, predictive LTV models, and MRR waterfall reports.",
      active: true,
    },
    {
      name: "Custom Branded Customer Portal",
      description: "White-labeled self-service invoice and subscription management for end customers.",
      active: true,
    },
    {
      name: "Enterprise Dedicated Support SLA",
      description: "24/7 priority support channel with 15-minute response time guarantee.",
      active: true,
    },
  ];

  const createdProducts = [];
  for (const p of productData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }
  console.log(`✅ Created ${createdProducts.length} products.`);

  // 3. Seed 10 Pricing Plans
  const priceData = [
    // Starter prices
    {
      productId: createdProducts[0].id,
      amount: 49.0,
      currency: "USD",
      billingInterval: BillingInterval.MONTHLY,
      active: true,
    },
    {
      productId: createdProducts[0].id,
      amount: 468.0, // $39/mo
      currency: "USD",
      billingInterval: BillingInterval.YEARLY,
      active: true,
    },
    // Professional prices
    {
      productId: createdProducts[1].id,
      amount: 129.0,
      currency: "USD",
      billingInterval: BillingInterval.MONTHLY,
      active: true,
    },
    {
      productId: createdProducts[1].id,
      amount: 1188.0, // $99/mo
      currency: "USD",
      billingInterval: BillingInterval.YEARLY,
      active: true,
    },
    // Enterprise prices
    {
      productId: createdProducts[2].id,
      amount: 249.0,
      currency: "USD",
      billingInterval: BillingInterval.MONTHLY,
      active: true,
    },
    {
      productId: createdProducts[2].id,
      amount: 2388.0, // $199/mo
      currency: "USD",
      billingInterval: BillingInterval.YEARLY,
      active: true,
    },
    // Add-on: Analytics
    {
      productId: createdProducts[3].id,
      amount: 59.0,
      currency: "USD",
      billingInterval: BillingInterval.MONTHLY,
      active: true,
    },
    {
      productId: createdProducts[3].id,
      amount: 588.0,
      currency: "USD",
      billingInterval: BillingInterval.YEARLY,
      active: true,
    },
    // Add-on: Customer Portal
    {
      productId: createdProducts[4].id,
      amount: 39.0,
      currency: "USD",
      billingInterval: BillingInterval.MONTHLY,
      active: true,
    },
    // Add-on: Dedicated SLA Support (One-time Setup)
    {
      productId: createdProducts[5].id,
      amount: 500.0,
      currency: "USD",
      billingInterval: BillingInterval.ONE_TIME,
      active: true,
    },
  ];

  const createdPrices = [];
  for (const pr of priceData) {
    const price = await prisma.price.create({ data: pr });
    createdPrices.push(price);
  }
  console.log(`✅ Created ${createdPrices.length} prices.`);

  // 4. Seed 15 Subscriptions
  const now = new Date();
  const subConfigs = [
    { custIdx: 0, priceIdx: 5, status: SubscriptionStatus.ACTIVE, startMonthsAgo: 12, periodDays: 365 },
    { custIdx: 1, priceIdx: 3, status: SubscriptionStatus.ACTIVE, startMonthsAgo: 8, periodDays: 365 },
    { custIdx: 2, priceIdx: 2, status: SubscriptionStatus.ACTIVE, startMonthsAgo: 3, periodDays: 30 },
    { custIdx: 3, priceIdx: 0, status: SubscriptionStatus.PAST_DUE, startMonthsAgo: 5, periodDays: 30 },
    { custIdx: 4, priceIdx: 4, status: SubscriptionStatus.ACTIVE, startMonthsAgo: 10, periodDays: 30 },
    { custIdx: 5, priceIdx: 2, status: SubscriptionStatus.PAUSED, startMonthsAgo: 6, periodDays: 30 },
    { custIdx: 6, priceIdx: 2, status: SubscriptionStatus.ACTIVE, startMonthsAgo: 4, periodDays: 30 },
    { custIdx: 7, priceIdx: 4, status: SubscriptionStatus.ACTIVE, startMonthsAgo: 7, periodDays: 30 },
    { custIdx: 8, priceIdx: 5, status: SubscriptionStatus.ACTIVE, startMonthsAgo: 14, periodDays: 365 },
    { custIdx: 9, priceIdx: 3, status: SubscriptionStatus.ACTIVE, startMonthsAgo: 2, periodDays: 365 },
    { custIdx: 10, priceIdx: 0, status: SubscriptionStatus.CANCELLED, startMonthsAgo: 9, periodDays: 30 },
    { custIdx: 11, priceIdx: 0, status: SubscriptionStatus.ACTIVE, startMonthsAgo: 1, periodDays: 30 },
    { custIdx: 0, priceIdx: 6, status: SubscriptionStatus.ACTIVE, startMonthsAgo: 10, periodDays: 30 }, // Second sub for Acme
    { custIdx: 4, priceIdx: 6, status: SubscriptionStatus.ACTIVE, startMonthsAgo: 4, periodDays: 30 }, // Second sub for Hyperion
    { custIdx: 1, priceIdx: 8, status: SubscriptionStatus.ACTIVE, startMonthsAgo: 6, periodDays: 30 }, // Second sub for Starlight
  ];

  const createdSubs = [];
  for (let i = 0; i < subConfigs.length; i++) {
    const cfg = subConfigs[i];
    const startDate = new Date(now.getTime() - cfg.startMonthsAgo * 30 * 24 * 60 * 60 * 1000);
    const periodStart = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const periodEnd = new Date(periodStart.getTime() + cfg.periodDays * 24 * 60 * 60 * 1000);
    const nextBill = cfg.status === SubscriptionStatus.ACTIVE ? periodEnd : null;

    const sub = await prisma.subscription.create({
      data: {
        customerId: createdCustomers[cfg.custIdx].id,
        priceId: createdPrices[cfg.priceIdx].id,
        status: cfg.status,
        startDate,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        nextBillingDate: nextBill,
        cancelledAt: cfg.status === SubscriptionStatus.CANCELLED ? new Date() : null,
        pausedAt: cfg.status === SubscriptionStatus.PAUSED ? new Date() : null,
      },
    });
    createdSubs.push(sub);
  }
  console.log(`✅ Created ${createdSubs.length} subscriptions.`);

  // 5. Seed 15 Invoices and Invoice Items
  const invoiceConfigs = [
    { custIdx: 0, subIdx: 0, status: InvoiceStatus.PAID, subtotal: 2388.0, discount: 0, tax: 0, total: 2388.0, desc: "Billora Enterprise Platform (Annual)", daysAgo: 30 },
    { custIdx: 1, subIdx: 1, status: InvoiceStatus.PAID, subtotal: 1188.0, discount: 50.0, tax: 0, total: 1138.0, desc: "Billora Professional Suite (Annual)", daysAgo: 25 },
    { custIdx: 2, subIdx: 2, status: InvoiceStatus.PAID, subtotal: 129.0, discount: 0, tax: 25.8, total: 154.8, desc: "Billora Professional Suite (Monthly)", daysAgo: 20 },
    { custIdx: 3, subIdx: 3, status: InvoiceStatus.OVERDUE, subtotal: 49.0, discount: 0, tax: 4.9, total: 53.9, desc: "Billora Starter Platform (Monthly)", daysAgo: 45 },
    { custIdx: 4, subIdx: 4, status: InvoiceStatus.PAID, subtotal: 249.0, discount: 0, tax: 0, total: 249.0, desc: "Billora Enterprise Platform (Monthly)", daysAgo: 15 },
    { custIdx: 5, subIdx: 5, status: InvoiceStatus.PAID, subtotal: 129.0, discount: 0, tax: 0, total: 129.0, desc: "Billora Professional Suite (Monthly)", daysAgo: 60 },
    { custIdx: 6, subIdx: 6, status: InvoiceStatus.PAID, subtotal: 129.0, discount: 0, tax: 24.51, total: 153.51, desc: "Billora Professional Suite (Monthly)", daysAgo: 10 },
    { custIdx: 7, subIdx: 7, status: InvoiceStatus.PENDING, subtotal: 249.0, discount: 0, tax: 0, total: 249.0, desc: "Billora Enterprise Platform (Monthly)", daysAgo: 5 },
    { custIdx: 8, subIdx: 8, status: InvoiceStatus.PAID, subtotal: 2388.0, discount: 200.0, tax: 0, total: 2188.0, desc: "Billora Enterprise Platform (Annual)", daysAgo: 70 },
    { custIdx: 9, subIdx: 9, status: InvoiceStatus.PAID, subtotal: 1188.0, discount: 0, tax: 154.44, total: 1342.44, desc: "Billora Professional Suite (Annual)", daysAgo: 40 },
    { custIdx: 10, subIdx: 10, status: InvoiceStatus.PAID, subtotal: 49.0, discount: 0, tax: 0, total: 49.0, desc: "Billora Starter Platform (Monthly)", daysAgo: 90 },
    { custIdx: 11, subIdx: 11, status: InvoiceStatus.PENDING, subtotal: 49.0, discount: 0, tax: 4.9, total: 53.9, desc: "Billora Starter Platform (Monthly)", daysAgo: 3 },
    { custIdx: 0, subIdx: 12, status: InvoiceStatus.PAID, subtotal: 59.0, discount: 0, tax: 0, total: 59.0, desc: "Advanced Revenue Analytics Add-on", daysAgo: 12 },
    { custIdx: 4, subIdx: 13, status: InvoiceStatus.PAID, subtotal: 59.0, discount: 0, tax: 0, total: 59.0, desc: "Advanced Revenue Analytics Add-on", daysAgo: 8 },
    { custIdx: 1, subIdx: 14, status: InvoiceStatus.DRAFT, subtotal: 39.0, discount: 0, tax: 0, total: 39.0, desc: "Custom Branded Customer Portal Add-on", daysAgo: 1 },
  ];

  const createdInvoices = [];
  for (let i = 0; i < invoiceConfigs.length; i++) {
    const inv = invoiceConfigs[i];
    const issueDate = new Date(now.getTime() - inv.daysAgo * 24 * 60 * 60 * 1000);
    const dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    const invoiceNum = `INV-2026-${String(i + 1).padStart(3, "0")}`;

    const createdInv = await prisma.invoice.create({
      data: {
        customerId: createdCustomers[inv.custIdx].id,
        subscriptionId: createdSubs[inv.subIdx].id,
        invoiceNumber: invoiceNum,
        issueDate,
        dueDate,
        subtotal: inv.subtotal,
        discount: inv.discount,
        tax: inv.tax,
        total: inv.total,
        status: inv.status,
        notes: `Standard payment terms: Net 14 days. Thank you for your business.`,
        items: {
          create: [
            {
              description: inv.desc,
              quantity: 1,
              unitPrice: inv.subtotal,
              amount: inv.subtotal,
            },
          ],
        },
      },
    });
    createdInvoices.push(createdInv);
  }
  console.log(`✅ Created ${createdInvoices.length} invoices with invoice line items.`);

  // 6. Seed Payment History
  const paymentMethods = [
    "Visa ending in 4242",
    "Mastercard ending in 8812",
    "ACH Direct Debit (Chase)",
    "American Express ending in 3001",
    "Visa ending in 1099",
  ];

  let paymentCount = 0;
  for (let i = 0; i < createdInvoices.length; i++) {
    const inv = createdInvoices[i];
    const cfg = invoiceConfigs[i];

    if (inv.status === InvoiceStatus.PAID) {
      await prisma.payment.create({
        data: {
          invoiceId: inv.id,
          customerId: inv.customerId,
          amount: inv.total,
          paymentMethod: paymentMethods[i % paymentMethods.length],
          status: PaymentStatus.SUCCEEDED,
          transactionReference: `TXN-88${String(i + 10).padStart(3, "0")}-US`,
          paidAt: new Date(inv.issueDate.getTime() + 2 * 60 * 60 * 1000), // Paid 2 hours after issuance
        },
      });
      paymentCount++;
    } else if (inv.status === InvoiceStatus.OVERDUE) {
      // Failed payment attempt
      await prisma.payment.create({
        data: {
          invoiceId: inv.id,
          customerId: inv.customerId,
          amount: inv.total,
          paymentMethod: "Visa ending in 1099",
          status: PaymentStatus.FAILED,
          transactionReference: `TXN-88${String(i + 10).padStart(3, "0")}-FAIL`,
          paidAt: null,
        },
      });
      paymentCount++;
    } else if (inv.status === InvoiceStatus.PENDING && i === 7) {
      // Pending payment attempt
      await prisma.payment.create({
        data: {
          invoiceId: inv.id,
          customerId: inv.customerId,
          amount: inv.total,
          paymentMethod: "ACH Direct Debit (Wells Fargo)",
          status: PaymentStatus.PENDING,
          transactionReference: `TXN-88${String(i + 10).padStart(3, "0")}-PEND`,
          paidAt: null,
        },
      });
      paymentCount++;
    }
  }

  console.log(`✅ Created ${paymentCount} payment records.`);
  console.log("🎉 Billora database successfully seeded with realistic development data!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error while seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
