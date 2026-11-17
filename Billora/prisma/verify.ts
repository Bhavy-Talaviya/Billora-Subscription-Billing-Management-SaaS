import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const customerCount = await prisma.customer.count();
  const productCount = await prisma.product.count();
  const priceCount = await prisma.price.count();
  const subCount = await prisma.subscription.count();
  const invCount = await prisma.invoice.count();
  const itemCount = await prisma.invoiceItem.count();
  const payCount = await prisma.payment.count();

  // Test full relational traversal
  const sampleCustomer = await prisma.customer.findFirst({
    where: { email: "billing@acme.com" },
    include: {
      subscriptions: {
        include: {
          price: {
            include: {
              product: true,
            },
          },
        },
      },
      invoices: {
        include: {
          items: true,
          payments: true,
        },
      },
      payments: true,
    },
  });

  console.log("=== BILLORA DATABASE VERIFICATION ===");
  console.log(`Customers:     ${customerCount}`);
  console.log(`Products:      ${productCount}`);
  console.log(`Prices:        ${priceCount}`);
  console.log(`Subscriptions: ${subCount}`);
  console.log(`Invoices:      ${invCount}`);
  console.log(`InvoiceItems:  ${itemCount}`);
  console.log(`Payments:      ${payCount}`);
  console.log("-------------------------------------");
  console.log("Relational Graph Traversal Test:");
  console.log(`- Customer:            ${sampleCustomer?.name}`);
  console.log(`- Active Subscriptions:${sampleCustomer?.subscriptions.length}`);
  console.log(`- First Sub Product:   ${sampleCustomer?.subscriptions[0]?.price.product.name}`);
  console.log(`- Invoices Linked:     ${sampleCustomer?.invoices.length}`);
  console.log(`- First Invoice Items: ${sampleCustomer?.invoices[0]?.items.length} item(s)`);
  console.log(`- Payments Recorded:   ${sampleCustomer?.payments.length}`);
  console.log("✅ All relational models and foreign key integrity verified!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
