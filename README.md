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

## Staff tools

The small lock in the website footer opens `/admin`. A successful sign-in opens the menu at `/tools`, with the estimate and invoice builder at `/tools/estimate-builder`. Both pages and the document-number API check the signed staff session. The old `/Tools` URL redirects to the menu. The builder source is copied from the sibling `golden-epoxy-tools` project with `node scripts/import-tools.mjs`; run that command again after updating the source tool. In an isolated worktree, set `GOLDEN_EPOXY_TOOLS_SOURCE` to the tools project directory first.

Set these server-only environment variables locally in `.env.local` and in the Vercel project before deploying:

```text
GE_ADMIN_PASSWORD=<staff password>
GE_ADMIN_SESSION_SECRET=<random secret of at least 32 bytes>
```

For a shared estimate/invoice number across devices, also configure the existing Upstash Redis REST credentials as `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`). Without them, the builder uses its existing browser-local number fallback, so different devices can produce duplicate numbers.

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
