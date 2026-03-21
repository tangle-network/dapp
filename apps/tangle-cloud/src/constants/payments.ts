// Shielded payment contract addresses — populated per-network via env vars.
export const SHIELDED_GATEWAY_ADDRESS =
  import.meta.env.VITE_SHIELDED_GATEWAY_ADDRESS ?? '';

export const SHIELDED_CREDITS_ADDRESS =
  import.meta.env.VITE_SHIELDED_CREDITS_ADDRESS ?? '';

export const WRAPPED_TOKEN_ADDRESS =
  import.meta.env.VITE_WRAPPED_TOKEN_ADDRESS ?? '';

export const TOKEN_DECIMALS = 18;
