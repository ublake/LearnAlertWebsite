# LearnAlertWebsite

Website for the LearnAlert app, built with Vinext, React, and the Cloudflare Vite plugin.

## Cloudflare Workers Builds

The application lives in the `LearnAlertWebsite` subdirectory. Configure the
**learnalertwebsite** Worker under Settings → Build:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | `LearnAlertWebsite` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Use Node.js 22.13.0 or newer. Cloudflare installs dependencies from the committed
package lock before running the build.

This is a Vinext Worker application, not a Next.js static export or a plain Vite
SPA. `wrangler.jsonc` defines the Worker entry point. The Cloudflare Vite plugin
produces `dist/server/wrangler.json` and `dist/client`, and writes
`.wrangler/deploy/config.json` so `wrangler deploy` finds the built Worker and assets.
Do not replace this with an assets-only configuration pointing at `out` or `dist`.

## Local verification

```sh
cd LearnAlertWebsite
npm ci
npm run build
npx wrangler deploy --dry-run
npm start
```

The build is self-contained and does not require a `.openai/hosting.json` file or
placeholder database/storage bindings. Generated build files stay out of Git.

## Custom domains

After a successful deployment, open the **learnalertwebsite** Worker → Settings →
Domains & Routes → Add → Custom Domain. Add `learnalertapp.com` and
`www.learnalertapp.com`. Both should serve this website; leave the existing
`api.learnalertapp.com` Worker and its DNS/routing configuration in place.

Verify both website URLs and the API's existing health endpoint after deployment.
