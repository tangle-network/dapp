import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TeeBackend, useServiceApproveTx } from './useServiceApproveTx';

const { mockUseChainId, mockGetContractsByChainId, mockUseContractWrite } =
  vi.hoisted(() => ({
    mockUseChainId: vi.fn(),
    mockGetContractsByChainId: vi.fn(),
    mockUseContractWrite: vi.fn(),
  }));

vi.mock('wagmi', () => ({
  useChainId: () => mockUseChainId(),
}));

vi.mock('@tangle-network/dapp-config/contracts', () => ({
  getContractsByChainId: (chainId: number) =>
    mockGetContractsByChainId(chainId),
}));

vi.mock('@tangle-network/tangle-shared-ui/hooks/useContractWrite', () => ({
  default: (...args: unknown[]) => mockUseContractWrite(...args),
  TxStatus: {
    NOT_YET_INITIATED: 'NOT_YET_INITIATED',
    PROCESSING: 'PROCESSING',
    COMPLETE: 'COMPLETE',
    ERROR: 'ERROR',
  },
}));

describe('useServiceApproveTx', () => {
  const activeAddress = '0xabc0000000000000000000000000000000000000';
  const ZERO_BLS_PUBKEY = [0n, 0n, 0n, 0n] as const;
  const ZERO_BLS_POP = [0n, 0n] as const;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseChainId.mockReturnValue(84532);
    mockGetContractsByChainId.mockReturnValue({
      tangle: '0x1234567890123456789012345678901234567890',
    });
  });

  const captureFactory = (): {
    factory: () => (params: any, addr: any) => Promise<any>;
  } => {
    let captured: ((params: any, addr: any) => Promise<any>) | undefined;
    mockUseContractWrite.mockImplementation(
      (_abi: unknown, factory: (params: any, addr: any) => Promise<any>) => {
        captured = factory;
        return {
          execute: vi.fn(),
          status: 'NOT_YET_INITIATED',
          error: null,
          reset: vi.fn(),
          txHash: null,
          isSuccess: false,
          isLoading: false,
        };
      },
    );
    renderHook(() => useServiceApproveTx());
    return {
      factory: () => {
        if (!captured) throw new Error('factory not captured');
        return captured;
      },
    };
  };

  it('builds the unified ApprovalParams with empty optional fields when only requestId is given', async () => {
    const factory = captureFactory().factory();
    const config = await factory({ requestId: 1n }, activeAddress);

    expect(config.functionName).toBe('approveService');
    expect(config.args).toEqual([
      {
        requestId: 1n,
        securityCommitments: [],
        blsPubkey: ZERO_BLS_PUBKEY,
        blsPopSignature: ZERO_BLS_POP,
        teeCommitments: [],
      },
    ]);
  });

  it('passes per-asset security commitments through unchanged', async () => {
    const factory = captureFactory().factory();
    const config = await factory(
      {
        requestId: 9n,
        securityCommitments: [
          {
            asset: {
              kind: 1,
              token: '0x9999999999999999999999999999999999999999',
            },
            exposureBps: 7500,
          },
        ],
      },
      activeAddress,
    );

    expect(config.functionName).toBe('approveService');
    expect(config.args[0].securityCommitments).toEqual([
      {
        asset: {
          kind: 1,
          token: '0x9999999999999999999999999999999999999999',
        },
        exposureBps: 7500,
      },
    ]);
  });

  it('threads BLS and TEE fields when supplied (opt-in capabilities)', async () => {
    const factory = captureFactory().factory();
    const blsPubkey = [1n, 2n, 3n, 4n] as const;
    const blsPopSignature = [5n, 6n] as const;
    const tee = {
      backend: TeeBackend.AwsNitro,
      expectedMeasurement:
        '0x1111111111111111111111111111111111111111111111111111111111111111' as const,
      nonceBinding:
        '0x2222222222222222222222222222222222222222222222222222222222222222' as const,
      expiresAt: 0n,
    };

    const config = await factory(
      {
        requestId: 3n,
        blsPubkey,
        blsPopSignature,
        teeCommitments: [tee],
      },
      activeAddress,
    );

    expect(config.args[0]).toEqual({
      requestId: 3n,
      securityCommitments: [],
      blsPubkey,
      blsPopSignature,
      teeCommitments: [tee],
    });
  });

  it('returns null tx config when contracts are unavailable for the active chain', async () => {
    mockGetContractsByChainId.mockImplementation(() => {
      throw new Error('unsupported chain');
    });

    const factory = captureFactory().factory();
    const config = await factory({ requestId: 1n }, activeAddress);
    expect(config).toBeNull();
  });
});
