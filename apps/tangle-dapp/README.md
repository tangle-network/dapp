<div align="center">
<a href="https://www.tangle.tools/">

![Tangle Logo](../../.github/assets/tangle-banner.png)
</a>
</div>

# Tangle dApp

Frontend for Tangle staking and delegation experiences on EVM, including wallet connection, deposits/withdrawals, delegation management, and reward visibility.

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
yarn nx serve tangle-dapp
```

Default URL: `http://localhost:4200`

## Notes

- Node.js: `>=18.18.x`
- Package manager: `Yarn 4`
- Protocol contracts/indexer source: sibling `../tnt-core`

## Help

- Docs: https://docs.tangle.tools/
- Feedback: https://github.com/tangle-network/feedback/discussions/categories/dapp-feedback
- Issues: https://github.com/tangle-network/dapp/issues/new/choose
