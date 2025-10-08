## HomeChef Menu Extractor

Production-grade Next.js 14 (App Router) app to extract structured food menu data from arbitrary `.txt` text using Google Gemini 1.5 Pro, persist to Vercel Postgres, and render a responsive UI.

### Tech
- Next.js App Router + React + Tailwind CSS
- API Routes for processing uploads
- Vercel Postgres for storage (`@vercel/postgres`)
- Google Gemini 1.5 Pro via REST

### Environment
Create `.env.local` with:

```
GOOGLE_GEMINI_API_KEY=...
POSTGRES_URL=...
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
```

On Vercel, add the same variables under Project Settings → Environment Variables. For Postgres, provision a Vercel Postgres database and use the provided connection values.

### Local Dev
```
npm run dev
```

### Deploy
1. Push to GitHub/GitLab.
2. Import project on Vercel.
3. Add env vars. Vercel will auto-detect Next.js.

### How it works
1. Upload a `.txt` file on `/`.
2. The file is posted to `/api/process`, which reads text, calls Gemini with a structured prompt, validates and deduplicates JSON, and persists to Postgres.
3. View extracted items on `/menu`.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
