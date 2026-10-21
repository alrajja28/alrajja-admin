# لوحة إدارة نادي الرجاء العراقي

Customer-owned project: alrajja28.

## Development

Use Node.js 22.12+ or 24. Install with npm ci --legacy-peer-deps. Copy .env.example to .env.local and set VITE_CONVEX_URL. Run npm run dev, npm run lint, and npm run build.

The backend belongs to the separate alrajja-club repository. Only a verified Google identity whose email is in backend ADMIN_EMAILS can manage content. Fan requests remain private and are visible to their owner and administration.


## Release

Build with the production VITE_CONVEX_URL. Publish dist/ to the gh-pages branch. GitHub Pages serves this branch.

## Current boundaries

Google login uses the customer-owned Firebase project alrajja-club-auth (Spark, no billing). Only Google is enabled. Application data and uploads stay in Convex. src/backend/firebase-config.json contains public web SDK identifiers, not server credentials. Convex verifies the Firebase issuer, project audience, signature, verified email, and Google provider before linking a user.

Ticket submissions are review requests, not paid tickets. This release does not issue admission QR codes or process payments. Live video uses a provided HTTPS/YouTube source or uploaded MP4/WebM; it does not provision a broadcasting service.
