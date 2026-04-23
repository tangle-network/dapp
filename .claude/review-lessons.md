# Review Lessons for tangle-network/dapp

Auto-generated from PR review history. Each rule addresses a pattern
found in 2+ separate PRs — these are recurring mistakes, not one-offs.

**6 recurring patterns** across 6 unique findings.

## Security

- **Shielded note private keys stored unencrypted in IndexedDB** (3x)
  NoteData contains privateKey and blinding fields (shielded.ts:10-11).

## Correctness

- **Contract addresses default to empty string when env vars missing** (3x)
  SHIELDED_GATEWAY_ADDRESS, SHIELDED_CREDITS_ADDRESS, and WRAPPED_TOKEN_ADDRESS all fall back to '' when their VITE_ env vars are unset.
- **Payment contract addresses not resolved per-network** (3x)
  Core staking contracts use getContractsByChainId(chainId) for per-network resolution.
- **Read-then-delete uses two separate IndexedDB transactions** (3x)
  deleteCreditKeys performs an ownership check in a readonly transaction, then deletes in a separate readwrite transaction.

## Operational

- **Payment env vars missing from .env.example** (3x)
  The three VITE_SHIELDED_* and VITE_WRAPPED_TOKEN_ADDRESS env vars required by the payments feature are not documented in .env.example.
- **Decryption errors silently swallowed in credit key loading** (3x)
  loadCreditKeysForAddress catches all decryption errors and marks the key as isLocked=true without distinguishing between wrong-password, corrupted data, and system errors.
