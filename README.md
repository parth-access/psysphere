# Saarthi Classes

Website and class dashboard for Saarthi Classes, Dravina Gupta's psychology coaching for Class 11, Class 12 and CUET.

Students join in one of two ways:

1. **Free workshop first.** They reserve a seat at `/workshops`, attend on Google Meet, then get an email with a link to join a batch.
2. **Join directly.** They pick a course, plan and batch at `/join` and pay through Razorpay.

A batch in "approval" mode waits for an admin to approve the request at `/dashboard/join-requests`. The student then gets a payment link by email, valid for 7 days. A batch in "open" mode goes straight to payment. Once the payment clears, the student's account is created and they get an email to set a password.

## Stack

- Next.js 15 (App Router, server actions), React 19, Tailwind CSS 4
- Supabase for auth, Postgres through Drizzle ORM
- Razorpay for payments, Resend for email
- Google Calendar API for class Meet links
- Vercel for hosting, plus the cron in `vercel.json` that sends the weekly parent report on Sundays

## Getting started

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

Fill in `.env` before running migrations. `.env.example` says what each value is for. Use Razorpay `rzp_test_` keys until you go live.

In the Supabase dashboard, under Authentication > URL Configuration, add `https://<your domain>/reset-password` to the Redirect URLs. Password setup and reset links send people there. If it isn't on the list, Supabase sends them to the Site URL instead and the link does nothing.

The first admin has to be made by hand. Create the user in Supabase Auth, then insert a row in `profiles` with the same `id` and `role = 'admin'`. Admins add teachers from `/dashboard/teachers`. Student accounts are created when a payment goes through.

### Local database

To work without touching the Supabase database, use a local Postgres instead. `db/local-setup.sql` adds the one Supabase table the migrations depend on (`auth.users`).

```bash
createdb saarthi_dev
psql -d saarthi_dev -f db/local-setup.sql
```

Set `DATABASE_URL=postgres://<your mac username>@localhost:5432/saarthi_dev` in `.env`, then run `npm run db:migrate`. Public pages work like this. Logging in still needs the Supabase values in `.env`.

`npm run db:seed:dev` adds sample data: two Class 11 batches (one needs approval, one is open to pay straight away) and a free workshop on the coming Saturday. Running it again resets those rows. It refuses to run against anything but a local database.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Write a migration after changing `db/schema` |
| `npm run db:migrate` | Apply migrations in `db/migrations` |
| `npm run db:seed:dev` | Add sample batches and a workshop to a local database |

## Where things live

| Path | Contents |
| --- | --- |
| `app/` | Routes: marketing pages, `/workshops`, `/join`, `/dashboard`, API routes |
| `features/` | UI components grouped by area (marketing, joining, dashboard, shared) |
| `src/domains/` | Business logic: joining and payments, onboarding, email, workshops, weekly reports, admin overview |
| `server/` | Role checks and the Razorpay and Google integrations |
| `db/` | Drizzle schema and migrations |
| `constants/` | Site details, navigation, pricing, testimonials |

All dates are shown and calculated in India time (`Asia/Kolkata`). The servers run in UTC, so use the helpers in `lib/ids.ts` instead of `setHours` or `getHours`.
