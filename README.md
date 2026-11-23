# ⚡ Billora – Subscription & Billing Management SaaS

<p align="center">
  <b>Smart Billing. Simple Subscriptions.</b>
</p>

<p align="center">
  A portfolio-grade, full-stack subscription lifecycle and recurring billing management SaaS platform built with Next.js App Router, TypeScript, PostgreSQL, and Prisma ORM.
</p>

<p align="center">
  <a href="#-technology-stack"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
  <a href="#-technology-stack"><img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" /></a>
  <a href="#-technology-stack"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
  <a href="#-technology-stack"><img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" /></a>
  <a href="#-technology-stack"><img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" /></a>
  <a href="#-technology-stack"><img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" /></a>
  <a href="#-technology-stack"><img src="https://img.shields.io/badge/Auth.js-NextAuth%20v5-purple?style=for-the-badge&logo=auth0" alt="Auth.js" /></a>
  <a href="#-deployment-on-vercel"><img src="https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel" /></a>
</p>

<p align="center">
  <b>Repository:</b> <a href="https://github.com/Bhavy-Talaviya/Billora-Subscription-Billing-Management-SaaS">Billora-Github</a> &nbsp;|&nbsp;
  <b>Live Demo:</b> <a href="https://billora-subscription-billing-manage.vercel.app/">Billora-LiveDemo</a>
</p>

---

## 1. About the Project:-

**Billora** is a full-stack SaaS recurring billing and subscription management platform built for modern subscription businesses, digital agencies, SaaS startups, and independent software vendors.

The application unifies the core financial operations of a recurring revenue business: customer onboarding, catalog modeling, pricing plan provisioning, subscription scheduling, multi-item invoicing with automated line item calculation, simulated multi-method payment capture, automated ledger reconciliation, and real-time executive analytics.

Built on the Next.js App Router and PostgreSQL with Prisma ORM, Billora emphasizes data integrity, clean architectural boundaries, strict multi-tenant isolation, and a responsive UI inspired by enterprise billing standards.

---

## 2. Problem Statement:-

Growing digital businesses frequently face operational bottlenecks when managing recurring revenue:

- **Fragmented Tools:** Customer records, subscription terms, invoice histories, and payment logs often live in disjointed spreadsheets or separate apps.
- **Billing Friction:** Manual invoice generation is time-consuming, prone to calculation errors, and lacks automated line-item aggregation.
- **Subscription Lifecycle Complexities:** Handling upgrades, downgrades, mid-cycle plan switches, billing anchors, pauses, and cancellations without data corruption requires strict state management.
- **Lack of Revenue Visibility:** Founders and operators lack immediate visibility into critical metrics such as Monthly Recurring Revenue (MRR), Annual Run Rate (ARR), Average Revenue Per User (ARPU), and churn velocity.

Billora solves these challenges by providing an integrated, ledger-accurate platform that simplifies recurring billing operations into a cohesive experience.

---

## 3. Project Objectives:-

1. **End-to-End Subscription Automation:** Model complete subscription lifecycles from creation and active renewal to plan upgrades, pauses, and cancellations.
2. **Accurate Invoicing & Ledger Records:** Automatically compute line items, tax, discounts, subtotal, and total balances, generating printable PDF invoices on demand.
3. **Multi-Tenancy & Data Privacy:** Scope all database queries, stats, and records to the authenticated tenant account so each organization operates in complete isolation.
4. **Real-Time Financial Intelligence:** Deliver live executive KPIs and growth trends derived directly from PostgreSQL queries without reliance on static dummy figures.
5. **Modern Engineering Standards:** Maintain complete TypeScript type safety, schema validation using Zod, automated Vitest unit testing, and modular services.

---

## 4. Key Features:-

- 🔐 **Authentication & Account Management:** Credentials registration, bcrypt password hashing, JWT sessions, profile updates, and password resets.
- 🏢 **Multi-Tenant Data Isolation:** Automatic tenant scoping across customers, products, plans, subscriptions, invoices, and payments.
- 👥 **Customer Directory:** Full CRM capabilities including billing contact data, country tags, and aggregated customer activity ledgers.
- 📦 **Flexible Product Catalog:** Multi-tier product creation with monthly, yearly, and one-time pricing support.
- 🔄 **Subscription Lifecycle Engine:** Plan transitions, immediate activation, pause/resume mechanisms, and calculated next billing anchors.
- 🧾 **Automated Invoice Engine:** Unique alphanumeric invoice numbers, automated itemization, status tracking, and vector PDF downloads.
- 💳 **Simulated Payment Gateway:** Multi-method payment capture (Credit/Debit Card, UPI, Bank Wire, Cash) with real-time balance reconciliation.
- 📈 **Real-Time Analytics & Cohorts:** Live ARR, MRR, ARPU, LTV, churn rate, 30-second live background synchronization, and CSV ledger exports.

---

## 5. Dashboard and Analytics:-

The Billora **Executive Dashboard** and dedicated **Revenue & Analytics** views provide live financial visibility:

- **Annual Run Rate (ARR):** Real-time annualized projection calculated from active monthly and yearly subscriptions.
- **Monthly Recurring Revenue (MRR):** Normalized monthly recurring volume updated automatically with every subscription modification.
- **Average Revenue Per Account (ARPU):** Real calculation representing revenue density across active subscribers.
- **Customer Lifetime Value (LTV):** Dynamic projection taking into account subscription retention and average tenure.
- **Net Revenue Retention (NRR):** Expansion vs. churn tracking indicator.
- **Visual Growth Trajectory:** Interactive Recharts area chart contrasting actual monthly MRR against milestone growth targets.
- **Subscriber Acquisition vs. Churn:** Dual-bar velocity chart monitoring monthly additions versus account cancellations.
- **Plan Cohort Breakdown:** Performance matrix reporting active customers, MRR contribution, and churn percentage per pricing tier.
- **Live Background Auto-Sync:** Automated 30-second polling indicator keeping dashboard metrics up-to-date with active database transactions.
- **Analytical Ledger CSV Export:** One-click structured CSV export containing executive summaries and monthly cohort rows.

---

## 6. Customer Management:-

The **Customers** module provides a centralized directory for all billing accounts:

- **Customer Profiles:** Store full name, business email, contact number, company name, billing address, city, state, postal code, and country.
- **Customer Activity Ledger:** Detailed drill-down view showing active subscriptions, past invoices, and payment histories for each individual account.
- **Search & Filtering:** Search customers by name, email, or company with instant filtering.
- **Safe Cascade Deletion:** Validation safeguards preventing accidental deletion of customers with pending or active commitments.
- **Pagination & Sorting:** Responsive, paginated tables designed for high data volume.

---

## 7. Product and Pricing Management:-

The **Products & Pricing** module allows operators to model SaaS catalogs:

- **Product Management:** Create, edit, and toggle active/archived status for digital services and SaaS offerings.
- **Multi-Interval Pricing:** Configure pricing plans linked to products with customizable intervals:
  - `MONTHLY` (e.g., $29/month)
  - `YEARLY` (e.g., $290/year)
  - `ONE_TIME` (e.g., $499 lifetime license)
- **Multi-Currency Display:** Configured currency formatting with standard symbols (USD `$`, INR `₹`, EUR `€`, GBP `£`, CAD, AUD).
- **Public & Internal Pricing Cards:** Reusable pricing card components displaying tier highlights, feature checklists, and action buttons.

---

## 8. Subscription Management:-

The **Subscriptions** engine manages recurring commitments:

- **Subscription Provisioning:** Link any customer to an active pricing plan with automated start dates and period anchors (`date-fns`).
- **Initial Invoice Automation:** Creating a subscription automatically creates and associates an initial paid/pending invoice in the transaction ledger.
- **Lifecycle Statuses:**
  - 🟢 `ACTIVE`: Currently running and accumulating revenue.
  - 🟡 `PAUSED`: Temporarily suspended without recurring charges.
  - 🔴 `CANCELLED`: Deactivated with cancellation timestamps recorded for churn metrics.
  - 🟠 `PAST_DUE`: Flagged when overdue invoice terms require intervention.
- **Mid-Cycle Plan Changes:** Upgrade or downgrade subscriptions dynamically with automated price adjustment invoices.
- **Simulated Renewals:** One-click renewal action recalculating `currentPeriodStart`, `currentPeriodEnd`, and `nextBillingDate`.

---

## 9. Invoice Management:-

The **Invoices** module generates and manages billing documents:

- **Automated Calculations:** Item quantity × unit price calculations, customizable taxes, discount deductions, and net balance determination.
- **Unique Identification:** Formatted invoice identification numbers (e.g., `INV-948201-REN`).
- **Invoice Lifecycle:**
  - `DRAFT`: Editable draft prior to distribution.
  - `PENDING`: Issued and awaiting settlement.
  - `PAID`: Fully settled via linked payment records.
  - `OVERDUE`: Flagged when past due date without full settlement.
  - `VOID`: Nullified transaction.
- **Client-Side PDF Generation:** High-resolution invoice PDF generation powered by `jspdf` and `jspdf-autotable`, rendering company details, billed customer data, itemization tables, notes, and payment status badges.

---

## 10. Payment Management:-

The **Payments** module records and tracks transaction collections:

- **Simulated Multi-Method Capture:** Support for varied payment avenues:
  - 💳 Credit / Debit Card (with masked security display)
  - ⚡ Instant UPI / Virtual Payment Address
  - 🏦 Direct Bank Wire Transfer
  - 💵 Cash on Delivery / Counter Settlement
- **Automated Balance Settlement:** Recording a successful payment automatically updates the associated invoice's balance and switches status to `PAID` once the total is satisfied.
- **Transaction Identifiers:** Custom transaction references (e.g., `TX-84920192`) for auditability.
- **Payment Statuses:** `SUCCEEDED`, `PENDING`, `FAILED`, and `REFUNDED`.

---

## 11. Authentication and User Management:-

Billora includes a secure authentication and multi-tenancy subsystem:

- **Auth.js (NextAuth v5 beta):** Modern Next.js App Router authentication utilizing stateless JWT sessions.
- **Credentials Authentication:** Secure registration and login flow using email and password.
- **Password Security:** Multi-factor password requirements (minimum 8 characters, uppercase, lowercase, and numbers) hashed via `bcryptjs`.
- **Password Reset Flow:** Cryptographically secure reset tokens with expiration validation.
- **Tenant Scoping:** Every user profile acts as an isolated workspace tenant; records created in one session are isolated from others.
- **Account Dialogs:** Accessible user menus for updating profile names, avatar images, changing passwords, and logging out.

---

## 12. Technology Stack:-

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | [Next.js](https://nextjs.org/) | `15.1.7` | App Router, Server Actions, Route Handlers |
| **UI Library** | [React](https://react.dev/) | `19.0.0` | Client & Server Component Architecture |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `5.7.3` | End-to-end static typing and interface contracts |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `3.4.17` | Utility-first responsive styling and design system |
| **Components** | [shadcn/ui](https://ui.shadcn.com/) / Radix | Latest | Accessible Dialogs, Dropdowns, Cards, Tooltips |
| **Icons** | [Lucide React](https://lucide.dev/) | `0.475.0` | Consistent iconography across navigation & cards |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | `16+` | Relational database engine |
| **ORM** | [Prisma ORM](https://www.prisma.io/) | `6.4.1` | Type-safe query building and migrations |
| **Authentication**| [Auth.js](https://authjs.dev/) (NextAuth) | `5.0.0-beta.32` | Stateless JWT authentication & route middleware |
| **Password Hashing**| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | `3.0.3` | One-way cryptographic password hashing |
| **Validation** | [Zod](https://zod.dev/) | `3.24.2` | Runtime schema validation across forms & APIs |
| **Forms** | [React Hook Form](https://react-hook-form.com/) | `7.54.2` | Controlled form state with `@hookform/resolvers` |
| **Charts** | [Recharts](https://recharts.org/) | `2.15.1` | Declarative SVG financial charts |
| **PDF Engine** | [jsPDF](https://github.com/parallax/jsPDF) | `4.2.1` | Client-side invoice PDF generation |
| **Notifications**| [Sonner](https://sonner.emilkowal.ski/) | `1.7.4` | Responsive toast notifications |
| **Date Engine** | [date-fns](https://date-fns.org/) | `4.1.0` | Recurring billing anchors and interval math |
| **Testing** | [Vitest](https://vitest.dev/) | `8.3.8` | High-speed unit and end-to-end workflow tests |

---

## 13. Project Folder Structure:-

```text
Billora-Subscription-Billing-Management-SaaS/
│
├── Billora/                             # Next.js Application Root
│   ├── prisma/
│   │   ├── schema.prisma                # Database schema definitions
│   │   └── seed.ts                      # Development database seeding script
│   │
│   ├── public/
│   │   ├── apple-touch-icon.png         # Apple touch icon asset
│   │   ├── favicon.ico                  # Browser tab favicon
│   │   ├── icon.svg                     # Vector brand logo
│   │   └── icon-32.png                  # Standard 32x32 tab icon
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/                  # Authentication Pages
│   │   │   │   ├── sign-in/page.tsx
│   │   │   │   ├── sign-up/page.tsx
│   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   └── reset-password/page.tsx
│   │   │   │
│   │   │   ├── (dashboard)/             # Protected SaaS Application Pages
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── customers/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── subscriptions/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── pricing/page.tsx
│   │   │   │   ├── invoices/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── payments/page.tsx
│   │   │   │   ├── analytics/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   │
│   │   │   ├── api/                     # Backend Route Handlers
│   │   │   │   ├── analytics/route.ts
│   │   │   │   ├── auth/                # Auth & Password Endpoints
│   │   │   │   ├── customers/           # Customer CRUD Endpoints
│   │   │   │   ├── dashboard/           # KPIs, Stats & Renewal Endpoints
│   │   │   │   ├── invoices/            # Invoice & PDF Endpoints
│   │   │   │   ├── payments/            # Payment Capture & Status Endpoints
│   │   │   │   ├── prices/              # Pricing Tier Endpoints
│   │   │   │   ├── products/            # Catalog Endpoints
│   │   │   │   └── subscriptions/       # Lifecycle & Transition Endpoints
│   │   │   │
│   │   │   ├── globals.css              # Global styles & design variables
│   │   │   ├── layout.tsx               # Root application layout
│   │   │   └── page.tsx                 # Root router & redirection
│   │   │
│   │   ├── components/
│   │   │   ├── auth/                    # Auth cards, layouts & dialogs
│   │   │   ├── customers/               # Customer forms, dialogs & tables
│   │   │   ├── dashboard/               # Metric cards, charts & activities
│   │   │   ├── invoices/                # Invoice generators, dialogs & tables
│   │   │   ├── layout/                  # Sidebar, Header, Breadcrumbs & UserNav
│   │   │   ├── payments/                # Payment capture dialogs & ledgers
│   │   │   ├── products/                # Product & pricing tier editors
│   │   │   ├── providers/               # NextAuth SessionProvider wrapper
│   │   │   ├── shared/                  # Reusable StatCards, Pickers & Tables
│   │   │   ├── subscriptions/           # Subscription cards & action modals
│   │   │   └── ui/                      # shadcn/ui accessible components
│   │   │
│   │   ├── lib/
│   │   │   ├── utils/
│   │   │   │   ├── currency.ts          # Currency formatter & symbols
│   │   │   │   └── invoicePdf.ts        # jsPDF invoice layout engine
│   │   │   ├── validations/             # Zod input schemas for all models
│   │   │   ├── prisma.ts                # PrismaClient singleton instance
│   │   │   ├── session.ts               # Authenticated session helper
│   │   │   └── utils.ts                 # Classname utility functions
│   │   │
│   │   ├── services/                    # Server-side Business Logic
│   │   │   ├── analytics.service.ts
│   │   │   ├── customer.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   ├── invoice.service.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── price.service.ts
│   │   │   ├── product.service.ts
│   │   │   └── subscription.service.ts
│   │   │
│   │   ├── auth.config.ts               # Auth.js Edge-compatible route rules
│   │   ├── auth.ts                      # Auth.js Credentials provider logic
│   │   └── middleware.ts                # Route protection middleware
│   │
│   ├── .env.example                     # Environment template
│   ├── components.json                  # shadcn/ui configuration
│   ├── next.config.mjs                  # Next.js configuration
│   ├── package.json                     # Project manifest and scripts
│   ├── tailwind.config.ts               # Tailwind CSS design system
│   ├── tsconfig.json                    # TypeScript compiler options
│   └── vitest.config.mts                # Vitest testing configuration
│
├── docs/                                # Documentation Assets
│   └── screenshots/                     # Product UI screenshots
│
└── README.md                            # Comprehensive Project Documentation
```

---

## 14. Database Architecture and Relationships:-

Billora uses PostgreSQL with Prisma ORM. The relational architecture ensures auditability, prevents orphaned ledger records, and supports multi-tenancy via foreign key relations.

### Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ CUSTOMER : owns
    USER ||--o{ PRODUCT : owns
    USER ||--o{ SUBSCRIPTION : owns
    USER ||--o{ INVOICE : owns
    USER ||--o{ PAYMENT : owns
    USER ||--o{ PASSWORD_RESET_TOKEN : has

    CUSTOMER ||--o{ SUBSCRIPTION : has
    CUSTOMER ||--o{ INVOICE : receives
    CUSTOMER ||--o{ PAYMENT : makes

    PRODUCT ||--o{ PRICE : contains
    PRICE ||--o{ SUBSCRIPTION : defines

    SUBSCRIPTION ||--o{ INVOICE : generates

    INVOICE ||--o{ INVOICE_ITEM : includes
    INVOICE ||--o{ PAYMENT : settles

    USER {
        string id PK
        string name
        string email UK
        string passwordHash
        string role
        datetime createdAt
    }

    CUSTOMER {
        string id PK
        string userId FK
        string name
        string email
        string company
        string country
        datetime createdAt
    }

    PRODUCT {
        string id PK
        string userId FK
        string name
        string description
        boolean active
        datetime createdAt
    }

    PRICE {
        string id PK
        string productId FK
        decimal amount
        string currency
        enum billingInterval
        boolean active
    }

    SUBSCRIPTION {
        string id PK
        string userId FK
        string customerId FK
        string priceId FK
        enum status
        datetime startDate
        datetime nextBillingDate
        datetime currentPeriodStart
        datetime currentPeriodEnd
    }

    INVOICE {
        string id PK
        string userId FK
        string customerId FK
        string subscriptionId FK
        string invoiceNumber UK
        decimal total
        enum status
        datetime issueDate
        datetime dueDate
    }

    INVOICE_ITEM {
        string id PK
        string invoiceId FK
        string description
        int quantity
        decimal unitPrice
        decimal amount
    }

    PAYMENT {
        string id PK
        string userId FK
        string customerId FK
        string invoiceId FK
        decimal amount
        enum paymentMethod
        enum status
        string transactionReference
        datetime paidAt
    }
```
---

## 15. Prerequisites:-

Ensure you have the following installed locally:

- **Node.js:** `v18.18.0` or higher (Recommended: `v20.x` or `v22.x`)
- **Package Manager:** `npm` (v9+) or `pnpm`
- **PostgreSQL Database:** A local PostgreSQL instance (v14+) or a cloud PostgreSQL instance (Neon, Supabase, Render, Aiven)
- **Git:** Version control CLI

---

## 16. Installation Instructions:-

### 1. Clone the Repository
```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Billora-Subscription-Billing-Management-SaaS/Billora
```

### 2. Install Project Dependencies
```bash
npm install
```

---

## 17. Environment Variables:-

Create a `.env` file inside the `Billora` directory by copying `.env.example`:

```bash
cp .env.example .env
```

Configure the environment variables according to your environment:

```env
# Node Environment
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# PostgreSQL Database Connection URL (Prisma)
DATABASE_URL="postgresql://YOUR_POSTGRES_USER:YOUR_POSTGRES_PASSWORD@localhost:5432/YOUR_DATABASE_NAME?schema=public"

# Auth.js (NextAuth) Secret & App URL
NEXTAUTH_SECRET="your-generated-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional Payment Simulator Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_sample_key"
STRIPE_SECRET_KEY="sk_test_sample_key"
STRIPE_WEBHOOK_SECRET="whsec_sample_key"
```

> **Note:** Generate a secure random string for `NEXTAUTH_SECRET` using `openssl rand -base64 32` or an online generator. Never commit `.env` containing live secrets to version control.

---

## 18. Database Setup and Migrations:-

### 1. Generate Prisma Client
Generates the strongly-typed Prisma client tailored to your schema:
```bash
npx prisma generate
```

### 2. Push Schema to Database
Synchronizes your database schema directly with PostgreSQL:
```bash
npx prisma db push
```
*(Alternatively, for migration history tracking: `npx prisma migrate dev --name init`)*

### 3. Seed Development Records (Optional)
Populate your database with initial demo data (admin user, customer, product plans, and sample subscriptions):
```bash
npm run prisma:seed
# or
npx tsx prisma/seed.ts
```

**Default Seed Credentials:**
- **Email:** `admin@billora.com`
- **Password:** `Admin@1234`

---

## 19. Development Server:-

Start the local development server:

```bash
npm run dev
```

Open your browser and navigate to:
```text
http://localhost:3000
```

The application will automatically direct unauthenticated visitors to `/sign-in` or `/sign-up`. After authenticating, you will be redirected to the `/dashboard`.

---

## 20. API Documentation:-

All backend operations are powered by Next.js API Route Handlers under `/api`. All endpoints return standard JSON responses and enforce tenant authentication.

### Authentication Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account with email and password |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile |
| `POST` | `/api/auth/change-password` | Update current user's password |
| `POST` | `/api/auth/forgot-password` | Generate and dispatch password reset token |
| `POST` | `/api/auth/reset-password` | Set new password using valid reset token |
| `GET/POST`| `/api/auth/[...nextauth]` | Auth.js credentials login, logout, and session handler |

### Dashboard & Analytics Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Retrieve executive KPIs (ARR, MRR, active subs, churn rate) |
| `GET` | `/api/dashboard/revenue` | Get monthly revenue timeseries data for charts |
| `GET` | `/api/dashboard/subscriptions` | Get subscription distribution counts by status |
| `GET` | `/api/dashboard/renewals` | Fetch upcoming subscription renewal list |
| `GET` | `/api/analytics` | Deep analytics: ARPU, LTV, NRR, monthly ledger, and plan cohorts |

### Customer Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customers` | List customers with search, sort, and pagination |
| `POST` | `/api/customers` | Create a new customer profile |
| `GET` | `/api/customers/[id]` | Get detailed customer record with invoices and subscriptions |
| `PATCH` | `/api/customers/[id]` | Update customer contact and billing details |
| `DELETE` | `/api/customers/[id]` | Delete customer (safeguarded against active balances) |

### Product & Pricing Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all products including pricing plans |
| `POST` | `/api/products` | Create a new product offering |
| `GET` | `/api/products/[id]` | Get product details |
| `PATCH` | `/api/products/[id]` | Update product name, description, or active status |
| `DELETE` | `/api/products/[id]` | Archive or delete product |
| `GET` | `/api/prices` | List all pricing plans across products |
| `POST` | `/api/prices` | Create a pricing plan with specified interval and amount |
| `GET` | `/api/prices/[id]` | Get pricing plan details |
| `PATCH` | `/api/prices/[id]` | Update pricing plan status or details |
| `DELETE` | `/api/prices/[id]` | Delete pricing plan |

### Subscription Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/subscriptions` | List subscriptions with customer and plan details |
| `POST` | `/api/subscriptions` | Create subscription and generate initial billing invoice |
| `GET` | `/api/subscriptions/[id]` | Get subscription details and billing timeline |
| `PATCH` | `/api/subscriptions/[id]` | Update subscription properties |
| `POST` | `/api/subscriptions/[id]/pause` | Transition active subscription to `PAUSED` |
| `POST` | `/api/subscriptions/[id]/resume`| Restore paused subscription back to `ACTIVE` |
| `POST` | `/api/subscriptions/[id]/cancel`| Cancel subscription and set cancellation timestamp |
| `POST` | `/api/subscriptions/[id]/change-plan` | Upgrade/downgrade subscription to a different plan |
| `POST` | `/api/subscriptions/[id]/renew` | Execute simulated period renewal and invoice creation |

### Invoice & Payment Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/invoices` | List invoices with status, date, and customer filters |
| `POST` | `/api/invoices` | Generate invoice with custom line items |
| `GET` | `/api/invoices/[id]` | Get invoice details including items and payment history |
| `PATCH` | `/api/invoices/[id]` | Update invoice terms, notes, or status |
| `DELETE` | `/api/invoices/[id]` | Delete draft invoice |
| `GET` | `/api/invoices/[id]/balance` | Compute invoice balance due and payment status |
| `GET` | `/api/invoices/[id]/pdf` | Generate and stream invoice PDF document |
| `GET` | `/api/payments` | List recorded payment transactions |
| `POST` | `/api/payments` | Record payment against invoice and settle balance |
| `GET` | `/api/payments/[id]` | Get payment transaction details |
| `PATCH` | `/api/payments/[id]/status`| Update payment status (e.g., mark succeeded/failed) |

---

## 21. Closing Message:-

<p align="center">
  <b>Thank you for exploring Billora!</b>
</p>

<p align="center">
  If you find this project helpful or inspiring, please consider starring ⭐ the repository.
</p>

<p align="center">
  <sub>Built with ❤️ using Next.js 15, TypeScript, PostgreSQL, and Prisma.</sub>
</p>
