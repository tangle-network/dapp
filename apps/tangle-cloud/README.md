<div align="center">
<a href="https://www.tangle.tools/">

![Tangle Logo](../../.github/assets/tangle-banner.png)
</a>
</div>

# Tangle Cloud

Operator and developer interface for the Tangle Operator Layer for AI services. This app covers blueprint registration, service deployment, service operations, operator flows, and related transaction tracking.

## Run Locally

1. Install dependencies from repo root:

```bash
yarn install
```

2. Configure env from root `.env.example`:

```bash
cp .env.example .env.local
```

Required baseline:

- `VITE_GRAPHQL_ENDPOINT` for your target chain/indexer.

3. Start app:

```bash
yarn nx serve tangle-cloud
```

Default URL: `http://localhost:4201`

## Notes

- Node.js: `>=18.18.x`
- Package manager: `Yarn 4`
- Protocol contracts/indexer source: sibling `../tnt-core`
