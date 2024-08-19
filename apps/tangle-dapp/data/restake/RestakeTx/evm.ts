import {
  type Abi,
  type Account,
  type Address,
  type ContractFunctionArgs,
  type ContractFunctionName,
  encodeFunctionData,
  type Hash,
  zeroAddress,
} from 'viem';
import { Config } from 'wagmi';
import {
  simulateContract,
  type SimulateContractParameters,
  waitForTransactionReceipt,
  writeContract,
} from 'wagmi/actions';

import {
  BATCH_PRECOMPILE_ABI,
  PrecompileAddress,
} from '../../../constants/evmPrecompiles';
import ensureError from '../../../utils/ensureError';
import createEvmBatchCallArgs from '../../../utils/staking/createEvmBatchCallArgs';
import toEvmAddress32 from '../../../utils/toEvmAddress32';
import restakeAbi from './abi';
import {
  type CancelDelegatorUnstakeRequestContext,
  type CancelWithdrawRequestContext,
  type DelegatorStakeContext,
  type DepositContext,
  type ExecuteAllDelegatorUnstakeRequestContext,
  type ExecuteAllWithdrawRequestContext,
  RestakeTxBase,
  type ScheduleDelegatorUnstakeContext,
  type ScheduleWithdrawContext,
  type TxEventHandlers,
} from './base';
import { MULTI_ASSET_DELEGATION_EVM_ADDRESS } from './constants';

export default class EVMRestakeTx extends RestakeTxBase {
  constructor(
    readonly activeAccount: Address,
    readonly signer: Account | Address,
    readonly provider: Config,
  ) {
    super();
  }

  sendTransaction = async <
    Context extends Record<string, unknown>,
    const TAbi extends Abi | readonly unknown[],
    TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
    TArgs extends ContractFunctionArgs<
      TAbi,
      'nonpayable' | 'payable',
      TFunctionName
    >,
  >(
    abi: TAbi,
    address: Address,
    functionName: TFunctionName,
    args: TArgs,
    context: Context,
    eventHandlers?: TxEventHandlers<Context>,
  ): Promise<Hash | null> => {
    try {
      eventHandlers?.onTxSending?.(context);

      const connector = (() => {
        if (this.provider.state.current === null) return;

        return this.provider.state.connections.get(this.provider.state.current)
          ?.connector;
      })();

      const { request } = await simulateContract(this.provider, {
        abi,
        address,
        functionName,
        args,
        account: this.activeAccount,
        connector,
      } as SimulateContractParameters);

      const hash = await writeContract(this.provider, request);

      eventHandlers?.onTxInBlock?.(hash, zeroAddress, context);

      const receipt = await waitForTransactionReceipt(this.provider, {
        hash,
      });

      eventHandlers?.onTxFinalized?.(hash, receipt.blockHash, context);

      if (receipt.status === 'success') {
        eventHandlers?.onTxSuccess?.(hash, receipt.blockHash, context);
        return hash;
      } else {
        eventHandlers?.onTxFailed?.('EVM deposit failed', context);
        return null;
      }
    } catch (error) {
      const errorMessage = ensureError(error).message;
      eventHandlers?.onTxFailed?.(errorMessage, context);
      return null;
    }
  };

  deposit = async (
    assetId: string,
    amount: bigint,
    operatorAccount?: string,
    eventHandlers?: TxEventHandlers<DepositContext>,
  ) => {
    const context = { assetId, amount, operatorAccount } as DepositContext;
    const assetIdBigInt = BigInt(assetId);

    if (operatorAccount === undefined) {
      return this.sendTransaction(
        restakeAbi,
        MULTI_ASSET_DELEGATION_EVM_ADDRESS,
        'deposit',
        [assetIdBigInt, amount],
        context,
        eventHandlers,
      );
    } else {
      const batchArgs = createEvmBatchCallArgs([
        {
          callData: encodeFunctionData({
            abi: restakeAbi,
            functionName: 'deposit',
            args: [assetIdBigInt, amount],
          }),
          gasLimit: 0,
          to: MULTI_ASSET_DELEGATION_EVM_ADDRESS,
          value: 0,
        },
        {
          callData: encodeFunctionData({
            abi: restakeAbi,
            functionName: 'delegate',
            args: [toEvmAddress32(operatorAccount), assetIdBigInt, amount],
          }),
          gasLimit: 0,
          to: MULTI_ASSET_DELEGATION_EVM_ADDRESS,
          value: 0,
        },
      ]);

      return this.sendTransaction(
        BATCH_PRECOMPILE_ABI,
        PrecompileAddress.BATCH,
        'batchAll',
        batchArgs,
        context,
        eventHandlers,
      );
    }
  };

  stake = async (
    operatorAccount: string,
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<DelegatorStakeContext>,
  ) => {
    const context = {
      operatorAccount,
      assetId,
      amount,
    } as DelegatorStakeContext;

    return this.sendTransaction(
      restakeAbi,
      MULTI_ASSET_DELEGATION_EVM_ADDRESS,
      'delegate',
      [toEvmAddress32(operatorAccount), BigInt(assetId), amount],
      context,
      eventHandlers,
    );
  };

  scheduleDelegatorUnstake = async (
    operatorAccount: string,
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<ScheduleDelegatorUnstakeContext>,
  ): Promise<Hash | null> => {
    const context = {
      operatorAccount,
      assetId,
      amount,
    } as ScheduleDelegatorUnstakeContext;

    return this.sendTransaction(
      restakeAbi,
      MULTI_ASSET_DELEGATION_EVM_ADDRESS,
      'scheduleDelegatorUnstake',
      [toEvmAddress32(operatorAccount), BigInt(assetId), amount],
      context,
      eventHandlers,
    );
  };

  executeDelegatorUnstakeRequests = async (
    eventHandlers?: TxEventHandlers<ExecuteAllDelegatorUnstakeRequestContext>,
  ): Promise<Hash | null> => {
    const context = {} as ExecuteAllDelegatorUnstakeRequestContext;

    return this.sendTransaction(
      restakeAbi,
      MULTI_ASSET_DELEGATION_EVM_ADDRESS,
      'executeDelegatorUnstake',
      [],
      context,
      eventHandlers,
    );
  };

  cancelDelegatorUnstakeRequests = async (
    unstakeRequests: CancelDelegatorUnstakeRequestContext['unstakeRequests'],
    eventHandlers?: TxEventHandlers<CancelDelegatorUnstakeRequestContext>,
  ): Promise<Hash | null> => {
    const context = { unstakeRequests } as CancelDelegatorUnstakeRequestContext;

    const batchArgs = createEvmBatchCallArgs(
      unstakeRequests.map(({ amount, assetId, operatorAccount }) => ({
        callData: encodeFunctionData({
          abi: restakeAbi,
          functionName: 'cancelDelegatorUnstake',
          args: [toEvmAddress32(operatorAccount), BigInt(assetId), amount],
        }),
        gasLimit: 0,
        to: MULTI_ASSET_DELEGATION_EVM_ADDRESS,
        value: 0,
      })),
    );

    return this.sendTransaction(
      BATCH_PRECOMPILE_ABI,
      PrecompileAddress.BATCH,
      'batchAll',
      batchArgs,
      context,
      eventHandlers,
    );
  };

  scheduleWithdraw = async (
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<ScheduleWithdrawContext>,
  ): Promise<Hash | null> => {
    const context = { assetId, amount } as ScheduleWithdrawContext;

    return this.sendTransaction(
      restakeAbi,
      MULTI_ASSET_DELEGATION_EVM_ADDRESS,
      'scheduleWithdraw',
      [BigInt(assetId), amount],
      context,
      eventHandlers,
    );
  };

  executeWithdraw = async (
    eventHandlers?: TxEventHandlers<ExecuteAllWithdrawRequestContext>,
  ): Promise<Hash | null> => {
    const context = {} as ExecuteAllWithdrawRequestContext;

    return this.sendTransaction(
      restakeAbi,
      MULTI_ASSET_DELEGATION_EVM_ADDRESS,
      'executeWithdraw',
      [],
      context,
      eventHandlers,
    );
  };

  cancelWithdraw = async (
    withdrawRequests: CancelWithdrawRequestContext['withdrawRequests'],
    eventHandlers?: TxEventHandlers<CancelWithdrawRequestContext>,
  ): Promise<Hash | null> => {
    const context = { withdrawRequests } as CancelWithdrawRequestContext;

    const batchArgs = createEvmBatchCallArgs(
      withdrawRequests.map(({ amount, assetId }) => ({
        callData: encodeFunctionData({
          abi: restakeAbi,
          functionName: 'cancelWithdraw',
          args: [BigInt(assetId), amount],
        }),
        gasLimit: 0,
        to: MULTI_ASSET_DELEGATION_EVM_ADDRESS,
        value: 0,
      })),
    );

    return this.sendTransaction(
      BATCH_PRECOMPILE_ABI,
      PrecompileAddress.BATCH,
      'batchAll',
      batchArgs,
      context,
      eventHandlers,
    );
  };
}
