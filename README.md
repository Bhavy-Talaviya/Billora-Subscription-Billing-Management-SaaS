# 🚀 Billora – Subscription & Billing Management SaaS

<p align="center">
  <b>Manage subscriptions. Simplify billing. Grow your business.</b>
</p>

<p align="center">
  A modern, full-stack subscription and billing management platform built with Next.js, TypeScript, PostgreSQL, and Prisma.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" alt="Prisma"/>
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel" alt="Vercel"/>
</p>

---

## 📖 About the Project

**Billora** is a modern subscription and billing management SaaS application designed for freelancers, startups, and small businesses.

It provides a centralized platform to manage customers, products, pricing plans, recurring subscriptions, invoices, and payment records.

The application simplifies billing operations by bringing essential business workflows together in one place.

Billora also provides a dashboard with financial metrics and analytics to help businesses understand their revenue, monitor subscription activity, and track upcoming renewals.

🎯 **Project Goal:** Build a complete, functional, portfolio-ready full-stack application that demonstrates real-world Next.js development, database management, API development, and professional UI design.

---

## 🎯 Problem Statement

Managing customers, subscriptions, invoices, and payments across multiple platforms can become difficult for growing businesses.

Billora addresses this problem by providing:

- Centralized customer management.
- Product and pricing management.
- Subscription lifecycle management.
- Invoice creation and tracking.
- Simulated payment management.
- Revenue analytics and reporting.

The application focuses on simplifying the complete billing workflow without requiring real payment gateway integration.

---

## ✨ Key Features

### 📊 1. Dashboard & Analytics

- Overview of total customers.
- Active subscription statistics.
- Monthly Recurring Revenue (MRR).
- Annual Recurring Revenue (ARR).
- Total recorded revenue.
- Churn rate.
- Upcoming subscription renewals.
- Pending and overdue invoices.
- Monthly revenue charts.
- Subscription and payment analytics.

### 👥 2. Customer Management

- Create customer profiles.
- View customer information.
- Update customer details.
- Delete customers when safe.
- Search and filter customers.
- View customer subscription history.
- View invoice and payment history.
- Track customer billing activity.

### 📦 3. Product & Pricing Management

- Create and manage products.
- Define multiple pricing plans.
- Support monthly subscriptions.
- Support yearly subscriptions.
- Support one-time pricing.
- Activate and deactivate products.
- Manage pricing plans.

### 🔄 4. Subscription Management

- Create customer subscriptions.
- View subscription details.
- Track subscription start dates.
- Monitor upcoming billing dates.
- Pause subscriptions.
- Resume paused subscriptions.
- Cancel subscriptions.
- Upgrade and downgrade plans.
- Track subscription history.
- Monitor subscription statuses.

**Subscription statuses:**

- 🟢 Active
- 🟡 Paused
- 🔴 Cancelled
- 🟠 Past Due

### 🧾 5. Invoice Management

- Generate invoices.
- Create invoices with multiple line items.
- Calculate subtotal, discounts, taxes, and totals.
- Generate unique invoice numbers.
- Track invoice due dates.
- Manage invoice statuses.
- View invoice details.
- Download invoices as PDF.

**Invoice statuses:**

- Draft
- Pending
- Paid
- Overdue

### 💳 6. Payment Management

- Record simulated payments.
- Track payment amounts.
- Select payment methods.
- Record payment dates.
- Manage payment statuses.
- Support partial payments.
- Maintain payment history.
- Track successful, pending, and failed payments.

**Supported payment methods:**

- Card (masked display only)
- UPI
- Bank Transfer
- Cash

**Payment statuses:**

- 🟢 Successful
- 🟡 Pending
- 🔴 Failed

### 📈 7. Business Analytics

- Monthly revenue trends.
- MRR growth.
- Subscription distribution.
- Payment status distribution.
- Customer growth.
- Upcoming renewals.
- Billing activity reports.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js (App Router) | Full-stack React framework |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| Lucide React | Icons |
| PostgreSQL | Relational database |
| Prisma ORM | Database management |
| Zod | Schema validation |
| React Hook Form | Form management |
| Recharts | Dashboard charts |
| jsPDF | Invoice PDF generation |
| Sonner | Toast notifications |
| date-fns | Date utilities |
| Git & GitHub | Version control |
| Vercel | Deployment |

---

## 📂 Project Structure

```text
billora/
│
├── public/
│   ├── images/
│   └── icons/
│
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── customers/
│   │   │   ├── subscriptions/
│   │   │   ├── products/
│   │   │   ├── pricing/
│   │   │   ├── invoices/
│   │   │   ├── payments/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   │
│   │   ├── api/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── subscriptions/
│   │   ├── products/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── analytics/
│   │   ├── shared/
│   │   └── ui/
│   │
│   ├── lib/
│   │   ├── validations/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── prisma.ts
│   │
│   ├── services/
│   ├── hooks/
│   ├── types/
│   └── config/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── docs/
│   └── screenshots/
│
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

---

## 🗄️ Database Architecture

Billora uses PostgreSQL with Prisma ORM.

### Main Database Models

| Model | Description |
|---|---|
| Customer | Stores customer information |
| Product | Stores products and services |
| Price | Stores pricing plans |
| Subscription | Manages customer subscriptions |
| Invoice | Stores billing invoices |
| InvoiceItem | Stores invoice line items |
| Payment | Stores payment records |

### Database Relationships

- One customer can have multiple subscriptions.
- One customer can have multiple invoices.
- One customer can have multiple payments.
- One product can have multiple pricing plans.
- One pricing plan can be associated with multiple subscriptions.
- One invoice can contain multiple invoice items.
- One invoice can have multiple payment attempts.

---

## ⚙️ Getting Started

Follow these instructions to run Billora locally.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/billora-subscription-management.git
```

### 2. Navigate to the Project

```bash
cd billora-subscription-management
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root.

Copy the contents from `.env.example` and configure your database connection.

```env
DATABASE_URL="your_postgresql_connection_string"
DIRECT_URL="your_direct_database_connection_string"
```

Use only the variables required by your Prisma configuration.

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Run Database Migrations

```bash
npx prisma migrate dev
```

### 7. Seed the Database

```bash
npx prisma db seed
```

Run this command only when the seed script is configured and it is safe to populate your development database.

### 8. Start Development Server

```bash
npm run dev
```

### 9. Open in Browser

```text
http://localhost:3000
```

🎉 Congratulations! Billora is ready for local development.

---

## 🔐 Environment Variables

The application uses environment variables to manage sensitive configuration.

Example `.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

Additional variables should be documented here if introduced during development.

⚠️ Never commit `.env`, `.env.local`, database passwords, API keys, or other secrets to GitHub.

---

## 🧪 Testing

The project aims to maintain code quality through automated testing.

Testing tools:

- **Vitest:** Unit testing.
- **Playwright:** End-to-end testing.
- **ESLint:** Code quality.
- **TypeScript:** Static type checking.

### Run TypeScript Checks

```bash
npx tsc --noEmit
```

### Run ESLint

```bash
npm run lint
```

### Run Production Build

```bash
npm run build
```

### Run Automated Tests

```bash
npm run test
```

Use the test commands configured in `package.json`.

---

## 🔗 API Documentation

Billora uses Next.js API Route Handlers to manage backend operations.

### 👥 Customer APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | Get all customers |
| POST | `/api/customers` | Create customer |
| GET | `/api/customers/[id]` | Get customer details |
| PATCH | `/api/customers/[id]` | Update customer |
| DELETE | `/api/customers/[id]` | Delete customer when safe |

### 📦 Product APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Get products |
| POST | `/api/products` | Create product |
| GET | `/api/products/[id]` | Get product details |
| PATCH | `/api/products/[id]` | Update product |
| DELETE | `/api/products/[id]` | Delete product when safe |

### 🔄 Subscription APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/subscriptions` | Get subscriptions |
| POST | `/api/subscriptions` | Create subscription |
| GET | `/api/subscriptions/[id]` | Get subscription details |
| PATCH | `/api/subscriptions/[id]` | Update subscription |
| POST | `/api/subscriptions/[id]/pause` | Pause subscription |
| POST | `/api/subscriptions/[id]/resume` | Resume subscription |
| POST | `/api/subscriptions/[id]/cancel` | Cancel subscription |
| POST | `/api/subscriptions/[id]/change-plan` | Change pricing plan |

### 🧾 Invoice APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/invoices` | Get invoices |
| POST | `/api/invoices` | Create invoice |
| GET | `/api/invoices/[id]` | Get invoice details |
| PATCH | `/api/invoices/[id]` | Update invoice |
| DELETE | `/api/invoices/[id]` | Delete draft invoice |
| GET | `/api/invoices/[id]/pdf` | Download invoice PDF |

### 💳 Payment APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/payments` | Get payments |
| POST | `/api/payments` | Record payment |
| GET | `/api/payments/[id]` | Get payment details |
| PATCH | `/api/payments/[id]/status` | Update payment status |

### 📊 Dashboard APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Get dashboard metrics |
| GET | `/api/dashboard/revenue` | Get revenue analytics |
| GET | `/api/dashboard/subscriptions` | Get subscription analytics |
| GET | `/api/dashboard/renewals` | Get upcoming renewals |

*Note: This is the planned API structure. Keep this section synchronized with the endpoints actually implemented in the repository.*

---

## 🚀 Deployment

Billora is designed for deployment using Vercel.

### Deployment Steps

1. Push the project to GitHub.
2. Create a Vercel account.
3. Import the Billora GitHub repository.
4. Configure production environment variables.
5. Connect a managed PostgreSQL database.
6. Configure the production build.
7. Apply database migrations.
8. Deploy the application.
9. Verify all application workflows.

### Recommended Services

- **Frontend & Backend Hosting:** Vercel
- **Database:** Neon PostgreSQL
- **Source Code:** GitHub

🌐 **Live Demo:** Coming soon.

🔗 **GitHub Repository:** https://github.com/YOUR_USERNAME/billora-subscription-management

---

## 🔒 Security

Security and data integrity are important parts of Billora.

- Validate incoming requests using Zod.
- Keep database credentials server-side.
- Never expose sensitive environment variables.
- Use safe database transactions.
- Prevent invalid subscription status transitions.
- Preserve historical invoice and payment records.
- Never store real credit card numbers or CVVs.
- Do not collect actual banking credentials.
- Handle errors without exposing internal database details.

**Important:** Billora is an educational subscription management application. It simulates payment operations and does not process real financial transactions.

---

## 🗺️ Future Enhancements

Potential improvements for future versions:

- 📧 Automated email reminders.
- 🤖 AI-generated invoice descriptions.
- 🧠 AI-powered monthly revenue summaries.
- 🌐 Public pricing page.
- 📑 Advanced financial reports.
- 📤 CSV and Excel exports.
- 🔔 In-app notification system.
- 🌙 Dark mode.
- 🌍 Multi-currency support.
- 👤 Role-based access control.
- 🔐 Authentication and authorization.
- 📅 Automated subscription renewal scheduler.

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a new branch.

```bash
git checkout -b feature/your-feature-name
```

3. Make your changes.
4. Commit your changes.

```bash
git commit -m "feat: add your feature"
```

5. Push your branch.

```bash
git push origin feature/your-feature-name
```

6. Open a Pull Request.

---

## 👨‍💻 Author

**Bhavy Talaviya**

Full-Stack Developer | Next.js | React | TypeScript

- GitHub: https://github.com/YOUR_USERNAME
- LinkedIn: Add your LinkedIn profile here

---

## 📄 License

This project is intended for educational and portfolio purposes.

Choose and add an appropriate open-source license before publishing the repository for public reuse.

---

<p align="center">
  <b>⭐ If you find Billora interesting, consider giving this repository a star!</b>
</p>

<p align="center">
  Built with ❤️ using Next.js and TypeScript.
</p>

<p align="center">
  🚀 Billora – Smart Billing. Simple Subscriptions.
</p>
