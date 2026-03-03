import { zeroAddress } from 'viem';
import { useDelegateTx } from './useDelegateTx';
import { useDepositTx } from './useDepositTx';
import {
  useExecuteUndelegateTx,
  useScheduleUndelegateTx,
} from './useUndelegateTx';
import { useExecuteWithdrawTx, useScheduleWithdrawTx } from './useWithdrawTx';

const mockUseChainId = jest.fn();
const mockGetContractsByChainId = jest.fn();
const mockUseContractWrite = jest.fn();

jest.mock('wagmi', () => ({
  useChainId: () => mockUseChainId(),
}));

jest.mock('@tangle-network/dapp-config/contracts', () => ({
  getContractsByChainId: (chainId: number) => mockGetContractsByChainId(chainId),
}));

jest.mock('../../hooks/useContractWrite', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseContractWrite(...args),
}));

describe('staking tx factories', () => {
  const activeAddress = '0xabc0000000000000000000000000000000000000';
  const contracts = {
    multiAssetDelegation: '0x1234567890123456789012345678901234567890',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChainId.mockReturnValue(84532);
    mockGetContractsByChainId.mockReturnValue(contracts);
  });

  it('builds native and ERC20 staking deposit calls with correct lock handling', () => {
    useDepositTx();

    const depositFactory = mockUseContractWrite.mock.calls[0][1] as (
      params: unknown,
      activeAddress: string,
    ) => Record<string, unknown>;

    const nativeConfig = depositFactory(
      {
        token: zeroAddress,
        amount: 10n,
        lockDuration: 'THREE_MONTHS',
      },
      activeAddress,
    );

    expect(nativeConfig.functionName).toBe('depositWithLock');
    expect(nativeConfig.args).toEqual([3]);
    expect(nativeConfig.value).toBe(10n);

    const erc20Config = depositFactory(
      {
        token: '0x1111111111111111111111111111111111111111',
        amount: 25n,
        lockDuration: 'ONE_MONTH',
      },
      activeAddress,
    );

    expect(erc20Config.functionName).toBe('depositERC20WithLock');
    expect(erc20Config.args).toEqual([
      '0x1111111111111111111111111111111111111111',
      25n,
      1,
    ]);
    expect(erc20Config.value).toBeUndefined();
  });

  it('builds staking delegate call with default ALL mode and FIXED mode', () => {
    useDelegateTx();

    const delegateFactory = mockUseContractWrite.mock.calls[0][1] as (
      params: unknown,
      activeAddress: string,
    ) => Record<string, unknown>;

    const defaultSelectionConfig = delegateFactory(
      {
        operator: '0x2222222222222222222222222222222222222222',
        token: '0x3333333333333333333333333333333333333333',
        amount: 100n,
      },
      activeAddress,
    );

    expect(defaultSelectionConfig.functionName).toBe('delegateWithOptions');
    expect(defaultSelectionConfig.args[3]).toBe(0);
    expect(defaultSelectionConfig.args[4]).toEqual([]);

    const fixedSelectionConfig = delegateFactory(
      {
        operator: '0x2222222222222222222222222222222222222222',
        token: '0x3333333333333333333333333333333333333333',
        amount: 100n,
        blueprintSelection: 'FIXED',
        blueprintIds: [1n, 2n],
      },
      activeAddress,
    );

    expect(fixedSelectionConfig.args[3]).toBe(1);
    expect(fixedSelectionConfig.args[4]).toEqual([1n, 2n]);
  });

  it('builds schedule/execute undelegate and withdraw calls with expected args', () => {
    useScheduleUndelegateTx();
    const scheduleUndelegateFactory = mockUseContractWrite.mock.calls[0][1] as (
      params: unknown,
      activeAddress: string,
    ) => Record<string, unknown>;

    useExecuteUndelegateTx();
    const executeUndelegateFactory = mockUseContractWrite.mock.calls[1][1] as (
      params: unknown,
      activeAddress: string,
    ) => Record<string, unknown>;

    useScheduleWithdrawTx();
    const scheduleWithdrawFactory = mockUseContractWrite.mock.calls[2][1] as (
      params: unknown,
      activeAddress: string,
    ) => Record<string, unknown>;

    useExecuteWithdrawTx();
    const executeWithdrawFactory = mockUseContractWrite.mock.calls[3][1] as (
      params: unknown,
      activeAddress: string,
    ) => Record<string, unknown>;

    const scheduleUndelegateConfig = scheduleUndelegateFactory(
      {
        operator: '0x2222222222222222222222222222222222222222',
        token: '0x3333333333333333333333333333333333333333',
        amount: 77n,
      },
      activeAddress,
    );

    expect(scheduleUndelegateConfig.functionName).toBe(
      'scheduleDelegatorUnstake',
    );
    expect(scheduleUndelegateConfig.args).toEqual([
      '0x2222222222222222222222222222222222222222',
      '0x3333333333333333333333333333333333333333',
      77n,
    ]);

    const executeUndelegateConfig = executeUndelegateFactory(
      undefined,
      activeAddress,
    );

    expect(executeUndelegateConfig.functionName).toBe('executeDelegatorUnstake');
    expect(executeUndelegateConfig.args).toEqual([]);

    const scheduleWithdrawConfig = scheduleWithdrawFactory(
      {
        token: '0x3333333333333333333333333333333333333333',
        amount: 55n,
      },
      activeAddress,
    );

    expect(scheduleWithdrawConfig.functionName).toBe('scheduleWithdraw');
    expect(scheduleWithdrawConfig.args).toEqual([
      '0x3333333333333333333333333333333333333333',
      55n,
    ]);

    const executeWithdrawConfig = executeWithdrawFactory(
      undefined,
      activeAddress,
    );

    expect(executeWithdrawConfig.functionName).toBe('executeWithdraw');
    expect(executeWithdrawConfig.args).toEqual([]);
  });
});
