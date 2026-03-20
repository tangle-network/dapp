// Bridge between the browser dApp and @tangle-network/shielded-sdk.
//
// The SDK uses ethers v6 + Node.js crypto. Browser compatibility:
// - crypto: polyfilled by vite-plugin-node-polyfills
// - fs (artifact loading): replaced by URL-based loading below
// - ethers: requires ethers v6 install + wagmi adapter (see ethersAdapter.ts)

// ─── Circuit artifact loading (browser-compatible) ───────────────────────

const ARTIFACT_BASE_URL =
  import.meta.env.VITE_CIRCUIT_ARTIFACTS_BASE_URL ??
  'https://protocol-solidity-fixtures.s3.amazonaws.com/solidity-fixtures';

export interface CircuitArtifacts {
  wasmPath: string;
  zkeyPath: string;
}

// In browser, snarkjs can load directly from URLs.
export const getCircuitArtifactsForBrowser = (
  inputs: 2 | 16 = 2,
  maxEdges: 2 | 8 = 8,
): CircuitArtifacts => ({
  wasmPath: `${ARTIFACT_BASE_URL}/vanchor_${inputs}/${maxEdges}/poseidon_vanchor_${inputs}_${maxEdges}.wasm`,
  zkeyPath: `${ARTIFACT_BASE_URL}/vanchor_${inputs}/${maxEdges}/circuit_final.zkey`,
});
