import { useState, useCallback } from 'react';
import { type Hex } from 'viem';

/**
 * Prover API endpoint (Succinct Network or self-hosted)
 * This should be configured based on the deployment
 */
const PROVER_API_URL =
  import.meta.env.VITE_SP1_PROVER_API_URL || 'http://localhost:3001/api/prove';

export interface ProofInput {
  /** The SS58 Substrate address (public key is derived from this in ZK circuit) */
  ss58Address: string;
  /** The SR25519 signature over the challenge (64 bytes) */
  signature: Hex;
  /** The EVM address claiming tokens */
  evmAddress: Hex;
  /** The challenge that was signed */
  challenge: Hex;
  /** The claim amount in wei */
  amount: bigint;
}

export interface ProofResult {
  /** The ZK proof bytes (SP1 Groth16) */
  zkProof: Hex;
}

export enum ProofStatus {
  IDLE = 'idle',
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Hook for generating SP1 ZK proofs for SR25519 signature verification
 *
 * The proof proves that the user controls the SR25519 key associated
 * with their SS58 address and binds the claim to a specific EVM recipient.
 *
 * Proof generation can be done:
 * 1. Via the Succinct Prover Network (recommended for production)
 * 2. Via a self-hosted prover API
 */
const useGenerateProof = () => {
  const [status, setStatus] = useState<ProofStatus>(ProofStatus.IDLE);
  const [proof, setProof] = useState<ProofResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  /**
   * Generate a proof via the prover API
   */
  const generateProof = useCallback(async (input: ProofInput) => {
    setStatus(ProofStatus.GENERATING);
    setError(null);
    setProgress('Initiating proof generation...');

    try {
      // Validate inputs
      if (!input.ss58Address) {
        throw new Error('SS58 address is required');
      }
      if (input.signature.length !== 130) {
        throw new Error('Invalid signature length (expected 64 bytes)');
      }
      if (input.evmAddress.length !== 42) {
        throw new Error('Invalid EVM address');
      }
      if (input.challenge.length !== 66) {
        throw new Error('Invalid challenge length');
      }
      if (input.amount <= BigInt(0)) {
        throw new Error('Invalid claim amount');
      }

      setProgress('Sending to prover network...');

      // Call the prover API
      // Note: Public key is derived from SS58 address inside the ZK circuit
      const response = await fetch(PROVER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ss58Address: input.ss58Address,
          signature: input.signature,
          evmAddress: input.evmAddress,
          challenge: input.challenge,
          amount: input.amount.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Prover API error: ${response.status}`,
        );
      }

      setProgress('Proof generation in progress...');

      // The API might return immediately with a job ID for async proving
      const result = await response.json();

      // Check if this is an async job
      if (result.jobId) {
        // Poll for completion
        const proofResult = await pollForProof(result.jobId, setProgress);
        setProof(proofResult);
        setStatus(ProofStatus.SUCCESS);
        setProgress('Proof generated successfully!');
        return proofResult;
      }

      // Synchronous result
      const proofResult: ProofResult = {
        zkProof: result.zkProof as Hex,
      };

      setProof(proofResult);
      setStatus(ProofStatus.SUCCESS);
      setProgress('Proof generated successfully!');
      return proofResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatus(ProofStatus.ERROR);
      setProgress('');
      throw err;
    }
  }, []);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setStatus(ProofStatus.IDLE);
    setProof(null);
    setError(null);
    setProgress('');
  }, []);

  return {
    status,
    proof,
    error,
    progress,
    generateProof,
    reset,
    isGenerating: status === ProofStatus.GENERATING,
    isSuccess: status === ProofStatus.SUCCESS,
    isError: status === ProofStatus.ERROR,
  };
};

/**
 * Poll for async proof completion
 */
async function pollForProof(
  jobId: string,
  setProgress: (msg: string) => void,
): Promise<ProofResult> {
  const maxAttempts = 120; // 10 minutes with 5s intervals
  const interval = 5000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, interval));

    setProgress(`Waiting for proof... (${attempt + 1}/${maxAttempts})`);

    const response = await fetch(`${PROVER_API_URL}/status/${jobId}`);
    const result = await response.json();

    if (result.status === 'completed') {
      return {
        zkProof: result.zkProof as Hex,
      };
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Proof generation failed');
    }
  }

  throw new Error('Proof generation timed out');
}

export default useGenerateProof;
