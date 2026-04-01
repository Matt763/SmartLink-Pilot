# 🚀 SmartLink Pilot: Production Deployment Guide (Supabase & Vercel)

Follow these steps to launch your SmartLink Pilot platform into production.

## 1. Supabase Setup (Database)

1.  **Create Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Obtain Connection String**:
    -   Navigate to **Project Settings** → **Database**.
    -   Find the **Connection string** section and select the **Prisma** tab.
    -   Copy the connection string (it should look like `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?pgbouncer=true`).
3.  **Prepare for Migration**: Ensure you have the **Transaction mode** version for Vercel (ends with `?pgbouncer=true`).

## 2. GitHub Initialization

1.  **Initialize Git**: 
    -   If not already done, run `git init`.
    -   Create a new repository on GitHub.
2.  **Ignore Local Artifacts**: Ensure `.gitignore` is active. Your local `dev.db` and `.env` will NOT be uploaded.
3.  **Push Code**: 
    -   `git add .`
    -   `git commit -m "Initialize Production Architecture"`
    -   `git remote add origin [YOUR-REPO-URL]`
    -   `git push -u origin main`

## 3. Vercel Deployment

1.  **Import Project**: Go to [Vercel](https://vercel.com/) and click **Add New** → **Project**.
2.  **Connect GitHub**: Select your repository.
3.  **Configure Environment Variables**: 
    -   Open your `.env.example` file.
    -   Copy each key into the Vercel **Environment Variables** section.
    -   **Important**: Use your real Supabase connection string for `DATABASE_URL`.
4.  **Deploy**: Click **Deploy**. Vercel will automatically run `npm run build`, which includes `prisma generate`.

## 4. Initial Database Migration

Once Vercel starts the build, it needs the database schema to exist. You can push your schema directly to Supabase from your local machine:

1.  In your local terminal, run:
    ```bash
    npx prisma db push
    ```
    *(Note: This requires you to have the real `DATABASE_URL` in your local `.env` temporarily, or pass it via command line.)*

## 5. Stripe Webhooks (Final Step)

1.  **Go to Stripe Dashboard** → **Developers** → **Webhooks**.
2.  **Add Endpoint**: Point it to `https://www.smartlinkpilot.com/api/webhooks`.
3.  **Select Events**: Add `checkout.session.completed` and `customer.subscription.deleted/updated`.
4.  **Copy Secret**: Paste the signing secret into your Vercel `STRIPE_WEBHOOK_SECRET` variable.

---

> [!SUCCESS]
> Your SmartLink Pilot platform is now live! The AI Reader, Admin CMS, and User Dashboard are fully synced with your production cloud database.
