import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useServiceApproveTx } from './useServiceApproveTx';

const { mockUseChainId, mockGetContractsForChain, mockUseContractWrite } =
  vi.hoisted(() => ({
    mockUseChainId: vi.fn(),
    mockGetContractsForChain: vi.fn(),
    mockUseContractWrite: vi.fn(),
  }));

vi.mock('wagmi', () => ({
  useChainId: () => mockUseChainId(),
}));

vi.mock('./getContractsForChain', () => ({
  default: (chainId: number) => mockGetContractsForChain(chainId),
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

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseChainId.mockReturnValue(84532);
    mockGetContractsForChain.mockReturnValue({
      tangle: '0x1234567890123456789012345678901234567890',
    });
  });

  it('uses approveService and clamps staking percent bounds for simple approvals', async () => {
    let capturedFactory:
      | ((params: any, activeAddress: any) => Promise<any>)
      | undefined;

    mockUseContractWrite.mockImplementation(
      (_abi: unknown, factory: (params: any, activeAddress: any) => Promise<any>) => {
        capturedFactory = factory;
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

    const clampedLow = await capturedFactory?.(
      {
        requestId: 1n,
        stakingPercent: -5,
      },
      activeAddress,
    );

    expect(clampedLow.functionName).toBe('approveService');
    expect(clampedLow.args).toEqual([1n, 0]);

    const clampedHigh = await capturedFactory?.(
      {
        requestId: 2n,
        stakingPercent: 150,
      },
      activeAddress,
    );

    expect(clampedHigh.functionName).toBe('approveService');
    expect(clampedHigh.args).toEqual([2n, 100]);
  });

  it('uses approveServiceWithCommitments when security commitments are provided', async () => {
    let capturedFactory:
      | ((params: any, activeAddress: any) => Promise<any>)
      | undefined;

    mockUseContractWrite.mockImplementation(
      (_abi: unknown, factory: (params: any, activeAddress: any) => Promise<any>) => {
        capturedFactory = factory;
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

    const config = await capturedFactory?.(
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

    expect(config.functionName).toBe('approveServiceWithCommitments');
    expect(config.args).toEqual([
      9n,
      [
        {
          asset: {
            kind: 1,
            token: '0x9999999999999999999999999999999999999999',
          },
          exposureBps: 7500,
        },
      ],
    ]);
  });

  it('returns null tx config when contracts are unavailable for the active chain', async () => {
    mockGetContractsForChain.mockReturnValue(null);

    let capturedFactory:
      | ((params: any, activeAddress: any) => Promise<any>)
      | undefined;

    mockUseContractWrite.mockImplementation(
      (_abi: unknown, factory: (params: any, activeAddress: any) => Promise<any>) => {
        capturedFactory = factory;
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

    const config = await capturedFactory?.(
      {
        requestId: 1n,
        stakingPercent: 50,
      },
      activeAddress,
    );

    expect(config).toBeNull();
  });
});
