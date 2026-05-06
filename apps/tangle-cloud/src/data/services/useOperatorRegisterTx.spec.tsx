import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { zeroAddress } from 'viem';
import {
  TxStatus,
  useOperatorBatchPreRegisterTx,
  useOperatorBatchRegisterTx,
} from './useOperatorRegisterTx';

const {
  mockUseChainId,
  mockGetContractsByChainId,
  mockRegisterExecute,
  mockRegisterReset,
  mockedTxStatus,
  registerHookErrorState,
} = vi.hoisted(() => ({
  mockUseChainId: vi.fn(),
  mockGetContractsByChainId: vi.fn(),
  mockRegisterExecute: vi.fn(),
  mockRegisterReset: vi.fn(),
  mockedTxStatus: {
    NOT_YET_INITIATED: 'NOT_YET_INITIATED',
    PROCESSING: 'PROCESSING',
    COMPLETE: 'COMPLETE',
    ERROR: 'ERROR',
  } as const,
  registerHookErrorState: { current: null as Error | null },
}));

vi.mock('wagmi', () => ({
  useChainId: () => mockUseChainId(),
}));

vi.mock('@tangle-network/dapp-config/contracts', () => ({
  getContractsByChainId: (chainId: number) =>
    mockGetContractsByChainId(chainId),
}));

vi.mock('@tangle-network/tangle-shared-ui/hooks/useContractWrite', () => ({
  default: () => ({
    execute: mockRegisterExecute,
    reset: mockRegisterReset,
    get error() {
      return registerHookErrorState.current;
    },
  }),
  TxStatus: mockedTxStatus,
}));

describe('useOperatorBatchRegisterTx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerHookErrorState.current = null;

    mockUseChainId.mockReturnValue(84532);
    mockGetContractsByChainId.mockReturnValue({
      tangle: '0x1234567890123456789012345678901234567890',
    });
  });

  it('returns an error when no blueprint registrations are provided', async () => {
    const { result } = renderHook(() => useOperatorBatchRegisterTx());

    let executionResult: Awaited<ReturnType<typeof result.current.execute>> =
      undefined;

    await act(async () => {
      executionResult = await result.current.execute({
        ecdsaPublicKey: `0x${'11'.repeat(64)}`,
        rpcAddress: 'https://rpc.example',
        registrations: [],
      });
    });

    expect(executionResult).toBeNull();
    expect(result.current.status).toBe(TxStatus.ERROR);
    expect(result.current.error?.message).toBe(
      'At least one blueprint is required for registration',
    );
  });

  it('tracks mixed success/failure results and emits progress updates', async () => {
    const onProgress = vi.fn();

    mockRegisterExecute
      .mockResolvedValueOnce({ hash: '0xhash1' })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ hash: '0xhash3' });

    const { result } = renderHook(() =>
      useOperatorBatchRegisterTx({ onProgress }),
    );

    let executionResult: Awaited<ReturnType<typeof result.current.execute>> =
      undefined;

    await act(async () => {
      executionResult = await result.current.execute({
        ecdsaPublicKey: `0x${'11'.repeat(64)}`,
        rpcAddress: 'https://rpc.example',
        registrations: [
          { blueprintId: 1n, registrationArgs: '0x' },
          { blueprintId: 2n, registrationArgs: '0x' },
          { blueprintId: 3n, registrationArgs: '0x' },
        ],
      });
    });

    expect(executionResult).toEqual({
      successfulBlueprintIds: [1n, 3n],
      failedBlueprintIds: [2n],
      txHashes: ['0xhash1', '0xhash3'],
    });

    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenNthCalledWith(1, {
      current: 1,
      total: 3,
      blueprintId: 1n,
    });
    expect(onProgress).toHaveBeenNthCalledWith(2, {
      current: 2,
      total: 3,
      blueprintId: 2n,
    });
    expect(onProgress).toHaveBeenNthCalledWith(3, {
      current: 3,
      total: 3,
      blueprintId: 3n,
    });

    expect(result.current.status).toBe(TxStatus.COMPLETE);
    expect(result.current.txHash).toBe('0xhash3');
    expect(result.current.error?.message).toBe(
      'Registered for 2 of 3 blueprints',
    );
  });

  it('returns contract-unavailable error when tangle address is missing', async () => {
    mockGetContractsByChainId.mockReturnValue({ tangle: zeroAddress });

    const { result } = renderHook(() => useOperatorBatchRegisterTx());

    let executionResult: Awaited<ReturnType<typeof result.current.execute>> =
      undefined;

    await act(async () => {
      executionResult = await result.current.execute({
        ecdsaPublicKey: `0x${'11'.repeat(64)}`,
        rpcAddress: 'https://rpc.example',
        registrations: [{ blueprintId: 1n, registrationArgs: '0x' }],
      });
    });

    expect(executionResult).toBeNull();
    expect(result.current.status).toBe(TxStatus.ERROR);
    expect(result.current.error?.message).toBe(
      'Tangle contract not available on this network',
    );
  });

  it('returns hook error when all blueprint registrations fail', async () => {
    registerHookErrorState.current = new Error('write failed');
    mockRegisterExecute.mockResolvedValue(null);

    const { result } = renderHook(() => useOperatorBatchRegisterTx());

    let executionResult: Awaited<ReturnType<typeof result.current.execute>> =
      undefined;

    await act(async () => {
      executionResult = await result.current.execute({
        ecdsaPublicKey: `0x${'11'.repeat(64)}`,
        rpcAddress: 'https://rpc.example',
        registrations: [
          { blueprintId: 1n, registrationArgs: '0x' },
          { blueprintId: 2n, registrationArgs: '0x' },
        ],
      });
    });

    expect(executionResult).toBeNull();
    expect(result.current.status).toBe(TxStatus.ERROR);
    expect(result.current.error?.message).toBe('write failed');
  });

  it('pre-registers selected blueprints and emits progress updates', async () => {
    const onProgress = vi.fn();

    mockRegisterExecute
      .mockResolvedValueOnce({ hash: '0xhash1' })
      .mockResolvedValueOnce({ hash: '0xhash2' });

    const { result } = renderHook(() =>
      useOperatorBatchPreRegisterTx({ onProgress }),
    );

    let executionResult: Awaited<ReturnType<typeof result.current.execute>> =
      undefined;

    await act(async () => {
      executionResult = await result.current.execute({
        blueprintIds: [1n, 2n],
      });
    });

    expect(executionResult).toEqual({
      successfulBlueprintIds: [1n, 2n],
      failedBlueprintIds: [],
      txHashes: ['0xhash1', '0xhash2'],
    });

    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenNthCalledWith(1, {
      current: 1,
      total: 2,
      blueprintId: 1n,
    });
    expect(onProgress).toHaveBeenNthCalledWith(2, {
      current: 2,
      total: 2,
      blueprintId: 2n,
    });

    expect(result.current.status).toBe(TxStatus.COMPLETE);
    expect(result.current.txHash).toBe('0xhash2');
  });
});
