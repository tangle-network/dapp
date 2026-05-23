# Sandboxed iframe blueprint apps

How embedded first-party blueprint apps are rendered, isolated, and
authorised inside Tangle Cloud.

## Architecture summary

```
┌─ cloud.tangle.tools (parent) ────────────────────────────────────┐
│                                                                  │
│  ┌─ <iframe sandbox="allow-scripts allow-forms"> ─────────────┐  │
│  │                                                            │  │
│  │  trading-arena.blueprint.tangle.tools                      │  │
│  │   • opaque origin (no allow-same-origin)                   │  │
│  │   • cannot reach parent.localStorage / cookies / wallet    │  │
│  │   • cannot navigate parent (no allow-top-navigation)       │  │
│  │                                                            │  │
│  └─ postMessage ▲ │ postMessage ▼ ─────────────────────────── ┘  │
│                  │ │                                              │
│   ┌──────────────┼─┼─────────────────────────────────────────┐   │
│   │  useIframeBridge                                         │   │
│   │   1. event.origin === manifest.origin (strict)           │   │
│   │   2. event.source === iframe.contentWindow               │   │
│   │   3. validateIframeRequest(payload)  (typed schema)      │   │
│   │   4. checkRequestAllowed(req, manifest.iframe)           │   │
│   │      ├─ contract+selector+chain allowlist                │   │
│   │      └─ capability flags (read/switch/popups)            │   │
│   │   5. surface IframeAppApprovalModal                      │   │
│   │   6. on approve → useSendTransaction / useSignMessage    │   │
│   │   7. postMessage result keyed on correlationId           │   │
│   └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

The wallet flow stays in the parent. The iframe never touches
`window.ethereum`. Signing requests bubble through `postMessage`
with a correlationId; the parent renders its own approval UI and
posts the result back.

## Environment flags

| Variable | Default | Purpose |
|---|---|---|
| `VITE_BLUEPRINT_IFRAME_ENABLED` | `false` | Same-day kill switch. When false, every iframe-mode manifest downgrades to link-out. |
| `VITE_BLUEPRINT_IFRAME_PUBLISHERS` | `tangle,tangle-labs` (default) | Comma-separated publisher namespaces eligible for iframe rendering. Distinct from verified publishers. Adding entries is a governance call. |
| `VITE_BLUEPRINT_IFRAME_HOST_SUFFIXES` | `.blueprint.tangle.tools,.blueprint.tangle.sh` | Wildcard host suffixes accepted as iframe sources. Each iframe app still needs a manifest entry; this just gates the URL shape. |

## Local dev (running an iframe app from your machine)

When the dapp is running on a local preview host (`localhost`, `127.0.0.1`,
private IPv4, or `VITE_FORCE_LOCAL_CHAIN=true`), `localhost:<port>` is
auto-accepted as an iframe-eligible host — no env-var fiddling required.

End-to-end loop:

```bash
# In each blueprint repo, start its dev server.
cd ~/code/ai-trading-blueprints/arena && pnpm dev    # serves :5173
cd ~/code/ai-agent-sandbox-blueprint/ui && pnpm dev  # serves :1338

# In the dapp, seed the local catalog with localhost iframe URLs.
cd ~/code/dapp
BLUEPRINT_UI_USE_LOCAL_IFRAMES=true \
  yarn local:blueprint-ui-catalog

# In a separate dapp shell, run the dapp with iframe mode on:
VITE_BLUEPRINT_IFRAME_ENABLED=true \
VITE_FORCE_LOCAL_CHAIN=true \
  yarn nx serve tangle-cloud
```

Open the dapp at `localhost:4300`, navigate to any iframe-mode blueprint —
the iframe loads from your local dev server, with HMR. Wallet flows still
go through the parent dapp's wagmi stack via postMessage.

The local URL map lives in `scripts/local-env/blueprint-ui-catalog.mjs`
(`LOCAL_IFRAME_DEV_URLS`). Add an entry when a new blueprint gains a UI.

## Onboarding a new iframe-eligible app

1. **Deploy the bundle** to a subdomain matching one of the allowed
   suffixes (e.g. `myapp.blueprint.tangle.tools`). Cloudflare Pages
   recommended:

   ```
   wrangler pages project create myapp --production-branch=main
   wrangler pages deploy build/client --project-name=myapp --branch=main
   ```

2. **Attach custom domain + DNS** (see ops runbook in tangle-network/dapp).

3. **Drop a `_headers` file** in the build output:

   ```
   /*
     Content-Security-Policy: frame-ancestors https://cloud.tangle.tools https://app.tangle.tools https://apps.tangle.tools
     Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()
     Referrer-Policy: no-referrer
     X-Content-Type-Options: nosniff
     Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
   ```

   Set cookies with `Domain=myapp.blueprint.tangle.tools` only —
   never the parent registrable domain.

4. **Publish the IPFS metadata** with the `blueprintUi.externalApp`
   block:

   ```json
   {
     "blueprintUi": {
       "displayName": "My App",
       "publisher": { "namespace": "tangle" },
       "externalApp": {
         "url": "https://myapp.blueprint.tangle.tools/",
         "mode": "iframe",
         "label": "Open My App",
         "iframe": {
           "appId": "myapp",
           "allowedChainIds": [3799],
           "contracts": [
             {
               "chainId": 3799,
               "address": "0xabc...",
               "selectors": ["0xa9059cbb"]
             }
           ],
           "messages": [],
           "allowReadAccount": true,
           "allowChainSwitch": false,
           "allowPopups": false
         }
       }
     }
   }
   ```

5. **(Non-Tangle namespaces only)** Add the namespace to
   `VITE_BLUEPRINT_IFRAME_PUBLISHERS`. This is a governance call.

6. **Flip `VITE_BLUEPRINT_IFRAME_ENABLED=true`** if it isn't already
   on for this environment.

## Manifest schema reference

The `iframe` block is declarative — it defines what the iframe is
*allowed* to ask the wallet to do. Anything outside is rejected
before the approval modal surfaces.

| Field | Type | Effect |
|---|---|---|
| `appId` | string | Stable identifier emitted in handshake. |
| `allowedChainIds` | number[] | If non-empty, signing requests on other chains are rejected. |
| `contracts` | `{chainId, address, selectors?}[]` | Per-contract allowlist. `selectors` is optional 4-byte selector list; omit for full-contract trust. |
| `messages` | `{chainId, prefixes?}[]` | EIP-191 sign-message allowlist. |
| `allowReadAccount` | bool | Iframe can ask for the connected account/chain without user prompt. |
| `allowChainSwitch` | bool | Iframe can prompt the user to switch chains. |
| `allowPopups` | bool | Sets `allow-popups[-to-escape-sandbox]`. Required for OAuth-style flows; widens attack surface, default off. |

## Kill-switch flip (incident response)

If something goes wrong with an iframe app:

1. **Immediate**: `VITE_BLUEPRINT_IFRAME_ENABLED=false` + redeploy.
   Every manifest downgrades to link-out automatically. ~5 min.

2. **Per-publisher**: Remove the namespace from
   `VITE_BLUEPRINT_IFRAME_PUBLISHERS`. Other iframe apps stay live.

3. **Per-host**: Remove the host suffix from
   `VITE_BLUEPRINT_IFRAME_HOST_SUFFIXES`. Useful when an entire
   subdomain pattern is suspect.

4. **Last resort**: Update the IPFS metadata to remove the
   `externalApp.iframe` block. Slower (requires onchain manifest
   refresh) but persists across env redeploys.

## Mode-aware blueprints (`?mode=<id>&blueprintId=<id>`)

A blueprint can declare multiple on-chain deployment modes (cloud, instance,
TEE, validator, …) via `blueprintUi.modes[]`. The catalog collapses these
into one card; the detail page renders a picker; the iframe receives the
picked mode through reserved URL params:

| Param         | Value                                       |
|---------------|---------------------------------------------|
| `mode`        | mode id from `modes[].id`, or `default`     |
| `blueprintId` | on-chain id of the picked mode's blueprint  |

The parent ALWAYS appends both. Iframe apps that ignore them keep working —
single-mode blueprints receive `mode=default` and `blueprintId=<canonical>`.

When the user flips modes after the iframe is mounted, the parent posts
`{type: 'tangle:mode', mode, blueprintId}` to the iframe with `targetOrigin`
pinned to the manifest origin. The iframe can listen and re-render without
a reload; if it ignores the message the URL params still carry the latest
mode on the next full reload.

## Threat model & invariants

The full threat model lives in
[issue #3171](https://github.com/tangle-network/dapp/issues/3171).
Critical invariants this code enforces:

- **Origin equality**: never `endsWith` / `startsWith` / regex on origin.
  Reject anything that doesn't exactly match the manifest's parsed origin.
- **Source equality**: `event.source === iframe.contentWindow`.
  Defends against confused-deputy attacks where another whitelisted
  origin posts at the parent.
- **Bounded payloads**: 4KB messages, 128KB calldata, 128-char
  ASCII-printable correlationIds. Defeats DoS via large
  `structuredClone`.
- **Wallet isolation**: iframe never gets `window.ethereum`. All
  signing routes through the parent's wagmi flow with the user's
  approval.
- **No `*` `targetOrigin`**: parent always pins postMessage to the
  manifest's exact origin.
