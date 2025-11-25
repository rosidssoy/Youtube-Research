# Deployment Guide

This guide covers how to deploy VibeClone to production using Vercel and Supabase.

## Prerequisites

1.  **Vercel Account**: For hosting the Next.js application.
2.  **Supabase Account**: For the PostgreSQL database.
3.  **YouTube Data API Key**: From Google Cloud Console.

## 1. Database Setup (Supabase)

1.  Create a new project in Supabase.
2.  Go to **Project Settings > Database**.
3.  Copy the **Connection String (URI)**. Use the "Transaction Mode" (port 6543) for `DATABASE_URL` and "Session Mode" (port 5432) for `DIRECT_URL`.
    *   *Note: If you only have one string, append `?pgbouncer=true` for the pooled connection.*

## 2. Environment Variables

Configure the following environment variables in your Vercel project settings:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string for Prisma (Pooled) | `postgres://...:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct connection string for migrations | `postgres://...:5432/postgres` |
| `NEXTAUTH_URL` | The URL of your deployed app | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Random string for encryption | Generate with `openssl rand -base64 32` |
| `YOUTUBE_API_KEY` | Google Cloud API Key for YouTube Data API v3 | `AIzaSy...` |

## 3. Deployment (Vercel)

1.  Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2.  Import the project into Vercel.
3.  Vercel should automatically detect the Next.js framework.
4.  Add the environment variables from Step 2.
5.  **Build Command**: The `vercel.json` is configured to run `npx prisma generate && next build`. Ensure this is respected or override it in Vercel settings if needed.
6.  Click **Deploy**.

## 4. Post-Deployment

1.  **Database Migration**: Vercel doesn't automatically run migrations. You should run them locally pointing to the production DB, or add a build step.
    *   **Recommended**: Run locally: `DATABASE_URL="<prod_url>" npx prisma db push`
2.  **Verify Auth**: Try logging in/registering.
3.  **Verify API**: Test the YouTube extraction feature.

## Troubleshooting

*   **Prisma Errors**: Ensure `npx prisma generate` is running during the build.
*   **Rate Limits**: The API has basic rate limiting. If you hit 429 errors, wait a minute.
*   **YouTube API Quota**: If extraction fails, check your Google Cloud Console for quota usage.
