# InvoiceFlow – Quotes & Invoices for Nigerian Businesses

Mobile-first web app for creating quotes and invoices, sending them via WhatsApp, and collecting payments with Paystack. Built for Nigerian SMEs.

## Features

- **Quotes** – Create quotes, send to customers, convert to invoice when approved
- **Invoices** – Create invoices with line items, VAT 7.5%, optional CAC/TIN
- **WhatsApp** – Prefilled “Send via WhatsApp” message with amount and payment link
- **Paystack** – Payment link on each invoice; webhook marks invoice as paid
- **PDF** – Print/save invoice as PDF (opens in new tab for Print → Save as PDF)
- **Customers & products** – Reuse customers and product catalog for faster invoicing
- **Dashboard** – Revenue today, pending count, paid this month, recent invoices and recent payments
- **Bank transfer reconciliation** – Each invoice gets a unique payment reference (e.g. `INV-A1B2C3`). Sellers add bank details in Settings; customers pay by transfer and quote the reference. Optional webhook matches incoming transfers (Mono, Okra, or your own job) and marks the invoice **Paid** automatically.
- **PWA** – Installable on phone; mobile-first layout and bottom nav
- **Referral** – “Powered by InvoiceFlow” on payment page; share app via WhatsApp
- **Admin** – App owner dashboard at `/admin`: overview stats, users, invoices, analytics. Access via `ADMIN_EMAILS` env.

## Tech stack

- **Next.js** (App Router), **TypeScript**, **Tailwind CSS**
- **Prisma** + **SQLite** (dev) / **Neon** or Postgres (production)
- **Clerk** – Auth (email, Google, OTP)
- **Paystack** – Payments (Nigeria)
- **PWA** – `@ducanh2912/next-pwa`

## Setup

1. **Clone and install**

   ```bash
   cd fino
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` – SQLite: `file:./dev.db` (or Neon/Postgres URL)
   - Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
   - Paystack: `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`
   - `NEXT_PUBLIC_APP_URL` – e.g. `http://localhost:3000` or your production URL
   - `ADMIN_EMAILS` – (optional) Comma-separated emails that can access `/admin` (e.g. `owner@yourdomain.com`)

3. **Database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Paystack webhook

For automatic “invoice paid” updates, set your Paystack webhook URL to:

`https://your-domain.com/api/webhooks/paystack`

Use the same secret as `PAYSTACK_SECRET_KEY` for signature verification.

## Bank transfer matching (payment reconciliation)

Sellers set **bank account details** in Settings. Each invoice has a **unique payment reference** (e.g. `INV-A1B2C3`) shown on the invoice and payment page. Customers pay the exact amount and put the reference in the transfer narration. When your system detects the transfer, call the bank-transfer webhook to mark the invoice paid.

**Webhook** – `POST /api/webhooks/bank-transfer`

- **Headers:** `Content-Type: application/json`, and if set in env: `x-bank-transfer-secret: <BANK_TRANSFER_WEBHOOK_SECRET>`
- **Body:** `{ "reference": "INV-A1B2C3", "amountKobo": 4500000, "provider": "mono" }`
- **Response:** `{ "matched": true, "invoiceId": "...", "customer": "Tunde", "message": "Payment received and invoice marked paid." }` or `{ "matched": false, "message": "No pending invoice found..." }`

Use this from:

- **Mono / Okra** – When you receive a transaction webhook, parse narration for the reference and amount, then `POST` to this endpoint.
- **Your own cron** – Poll Mono/Okra transaction API and call this webhook when a matching transfer is found.

Optional env: `BANK_TRANSFER_WEBHOOK_SECRET` – if set, requests must include header `x-bank-transfer-secret` with this value.

## PWA (optional)

The app includes a `manifest.json` and theme color so it can be “Add to Home Screen” on mobile. For full PWA (offline, install prompt), install and enable the plugin:

```bash
npm install @ducanh2912/next-pwa
```

In `next.config.ts`:

```ts
import withPWA from "@ducanh2912/next-pwa";
export default withPWA({ dest: "public", disable: process.env.NODE_ENV === "development" })(nextConfig);
```

Add `public/icon-192.png` and `public/icon-512.png` for the install experience.

## Deployment (e.g. Vercel)

- Set all env vars in the dashboard.
- Use a Postgres provider (e.g. Neon) and set `DATABASE_URL`.
- Run `npx prisma db push` or migrations after deploy if needed.

## Licence

MIT
# ivoiceflow
