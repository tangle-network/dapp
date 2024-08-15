import {
  type Account,
  type Address,
  type ContractFunctionArgs,
  type ContractFunctionName,
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

import ensureError from '../../../utils/ensureError';
import toEvmAddress32 from '../../../utils/toEvmAddress32';
import abi from './abi';
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
  TxEvent,
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
    TFunctionName extends ContractFunctionName<
      typeof abi,
      'nonpayable' | 'payable'
    >,
    TArgs extends ContractFunctionArgs<
      typeof abi,
      'nonpayable' | 'payable',
      TFunctionName
    >,
  >(
    functionName: TFunctionName,
    args: TArgs,
    context: Context,
    eventHandlers?: TxEventHandlers<Context>,
    emittedEvents?: TxEvent[],
  ): Promise<Hash | null> => {
    try {
      if (
        Array.isArray(emittedEvents) &&
        emittedEvents.includes(TxEvent.SENDING)
      )
        eventHandlers?.onTxSending?.(context);

      const { request } = await simulateContract(this.provider, {
        abi,
        address: MULTI_ASSET_DELEGATION_EVM_ADDRESS,
        functionName,
        args,
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
        'deposit',
        [assetIdBigInt, amount],
        context,
        eventHandlers,
      );
    } else {
      // TODO: Find the correct way to batch these transactions on EVM
      // Maybe: https://wagmi.sh/core/api/actions/writeContracts
      // or deploy https://www.multicall3.com/ contract on our EVM

      const depositTx = await this.sendTransaction(
        'deposit',
        [assetIdBigInt, amount],
        context,
        eventHandlers,
      );

      // If the deposit tx failed, we don't want to delegate
      if (depositTx === null) {
        return null;
      }

      const delegateTx = await this.sendTransaction(
        'delegate',
        [toEvmAddress32(operatorAccount), assetIdBigInt, amount],
        context,
        eventHandlers,
      );

      return delegateTx;
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

    let lastHash: Hash | null = null;

    // Handle the request one by one
    // TODO: Find the correct way to batch these transactions on EVM
    for (const { operatorAccount, amount, assetId } of unstakeRequests) {
      const hash = await this.sendTransaction(
        'cancelDelegatorUnstake',
        [toEvmAddress32(operatorAccount), BigInt(assetId), amount],
        context,
        eventHandlers,
      );

      if (hash === null) {
        return null;
      }

      lastHash = hash;
    }

    return lastHash;
  };

  scheduleWithdraw = async (
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<ScheduleWithdrawContext>,
  ): Promise<Hash | null> => {
    const context = { assetId, amount } as ScheduleWithdrawContext;

    return this.sendTransaction(
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

    return this.sendTransaction('executeWithdraw', [], context, eventHandlers);
  };

  cancelWithdraw = async (
    withdrawRequests: CancelWithdrawRequestContext['withdrawRequests'],
    eventHandlers?: TxEventHandlers<CancelWithdrawRequestContext>,
  ): Promise<Hash | null> => {
    const context = { withdrawRequests } as CancelWithdrawRequestContext;

    let lastHash: Hash | null = null;

    // Handle the request one by one
    // TODO: Find the correct way to batch these transactions on EVM
    for (const { amount, assetId } of withdrawRequests) {
      const hash = await this.sendTransaction(
        'cancelWithdraw',
        [BigInt(assetId), amount],
        context,
        eventHandlers,
      );

      if (hash === null) {
        return null;
      }

      lastHash = hash;
    }

    return lastHash;
  };
}
