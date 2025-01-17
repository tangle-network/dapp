import { TxEventHandlers } from '@webb-tools/abstract-api-provider';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import convertAddressToBytes32 from '@webb-tools/webb-ui-components/utils/convertAddressToBytes32';
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
  PrecompileAddress,
  ZERO_ADDRESS,
} from '../../../constants/evmPrecompiles';
import createEvmBatchCallArgs from '../../../utils/staking/createEvmBatchCallArgs';
import {
  type CancelDelegatorUnstakeRequestContext,
  type CancelWithdrawRequestContext,
  type DelegatorStakeContext,
  type DepositContext,
  type ExecuteAllDelegatorUnstakeRequestContext,
  type ExecuteAllWithdrawRequestContext,
  RestakeApiBase,
  type ScheduleDelegatorUnstakeContext,
  type ScheduleWithdrawContext,
} from './base';
import { MULTI_ASSET_DELEGATION_EVM_ADDRESS } from './constants';
import BATCH_PRECOMPILE_ABI from '../../../abi/batch';
import RESTAKING_PRECOMPILE_ABI from '../../../abi/restaking';

export default class EvmRestakeApi extends RestakeApiBase {
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
    eventHandlers?: Partial<TxEventHandlers<Context>>,
  ): Promise<Hash | null> => {
    try {
      eventHandlers?.onTxSending?.(context);

      const connector = (() => {
        if (this.provider.state.current === null) {
          return;
        }

        return this.provider.state.connections.get(this.provider.state.current)
          ?.connector;
      })();

      const chainId = (() => {
        if (this.provider.state.current === null) {
          return;
        }

        return this.provider.state.connections.get(this.provider.state.current)
          ?.chainId;
      })();

      const { request } = await simulateContract(this.provider, {
        abi,
        address,
        functionName,
        args,
        account: this.activeAccount,
        connector,
        chainId,
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
    operatorAccount?: SubstrateAddress,
    eventHandlers?: Partial<TxEventHandlers<DepositContext>>,
  ) => {
    const context: DepositContext = { assetId, amount, operatorAccount };
    const assetIdBigInt = BigInt(assetId);

    // No operator was provided, perform a deposit only.
    if (operatorAccount === undefined) {
      return this.sendTransaction(
        RESTAKING_PRECOMPILE_ABI,
        MULTI_ASSET_DELEGATION_EVM_ADDRESS,
        'deposit',
        // TODO: Add support for restaking EVM assets by passing in the token address. On the runtime, if it is zero (as it is the case right now), it'll just be ignored, and use the custom asset ID instead.
        [assetIdBigInt, ZERO_ADDRESS, amount, 1],
        context,
        eventHandlers,
      );
    }
    // The operator was provided. Batch the deposit and delegation calls.
    else {
      const batchArgs = createEvmBatchCallArgs([
        {
          callData: encodeFunctionData({
            abi: RESTAKING_PRECOMPILE_ABI,
            functionName: 'deposit',
            args: [assetIdBigInt, ZERO_ADDRESS, amount, 1],
          }),
          gasLimit: 0,
          to: MULTI_ASSET_DELEGATION_EVM_ADDRESS,
          value: 0,
        },
        {
          callData: encodeFunctionData({
            abi: RESTAKING_PRECOMPILE_ABI,
            functionName: 'delegate',
            args: [
              convertAddressToBytes32(operatorAccount),
              assetIdBigInt,
              ZERO_ADDRESS,
              amount,
              [],
            ],
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

  delegate = async (
    operatorAccount: SubstrateAddress,
    assetId: string,
    amount: bigint,
    eventHandlers?: Partial<TxEventHandlers<DelegatorStakeContext>>,
  ) => {
    const context: DelegatorStakeContext = {
      operatorAccount,
      assetId,
      amount,
    };

    return this.sendTransaction(
      RESTAKING_PRECOMPILE_ABI,
      MULTI_ASSET_DELEGATION_EVM_ADDRESS,
      'delegate',
      [
        convertAddressToBytes32(operatorAccount),
        BigInt(assetId),
        ZERO_ADDRESS,
        amount,
        [],
      ],
      context,
      eventHandlers,
    );
  };

  scheduleUnstake = async (
    operatorAccount: SubstrateAddress,
    assetId: string,
    amount: bigint,
    eventHandlers?: Partial<TxEventHandlers<ScheduleDelegatorUnstakeContext>>,
  ): Promise<Hash | null> => {
    const context: ScheduleDelegatorUnstakeContext = {
      operatorAccount,
      assetId,
      amount,
    };

    console.debug(
      'UNSTAKE ARGS',
      assetId,
      convertAddressToBytes32(operatorAccount),
    );

    return this.sendTransaction(
      RESTAKING_PRECOMPILE_ABI,
      MULTI_ASSET_DELEGATION_EVM_ADDRESS,
      'scheduleDelegatorUnstake',
      [
        convertAddressToBytes32(operatorAccount),
        BigInt(assetId),
        ZERO_ADDRESS,
        amount,
      ],
      context,
      eventHandlers,
    );
  };

  executeDelegatorUnstakeRequests = async (
    eventHandlers?: Partial<
      TxEventHandlers<ExecuteAllDelegatorUnstakeRequestContext>
    >,
  ): Promise<Hash | null> => {
    const context: ExecuteAllDelegatorUnstakeRequestContext = {};

    return this.sendTransaction(
      RESTAKING_PRECOMPILE_ABI,
      MULTI_ASSET_DELEGATION_EVM_ADDRESS,
      'executeDelegatorUnstake',
      [],
      context,
      eventHandlers,
    );
  };

  cancelDelegatorUnstakeRequests = async (
    unstakeRequests: CancelDelegatorUnstakeRequestContext['unstakeRequests'],
    eventHandlers?: Partial<
      TxEventHandlers<CancelDelegatorUnstakeRequestContext>
    >,
  ): Promise<Hash | null> => {
    const context: CancelDelegatorUnstakeRequestContext = { unstakeRequests };

    const batchArgs = createEvmBatchCallArgs(
      unstakeRequests.map(({ amount, assetId, operatorAccount }) => ({
        callData: encodeFunctionData({
          abi: RESTAKING_PRECOMPILE_ABI,
          functionName: 'cancelDelegatorUnstake',
          args: [
            convertAddressToBytes32(operatorAccount),
            BigInt(assetId),
            ZERO_ADDRESS,
            amount,
          ],
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
    eventHandlers?: Partial<TxEventHandlers<ScheduleWithdrawContext>>,
  ): Promise<Hash | null> => {
    const context: ScheduleWithdrawContext = { assetId, amount };

    return this.sendTransaction(
      RESTAKING_PRECOMPILE_ABI,
      MULTI_ASSET_DELEGATION_EVM_ADDRESS,
      'scheduleWithdraw',
      [BigInt(assetId), ZERO_ADDRESS, amount],
      context,
      eventHandlers,
    );
  };

  executeWithdraw = async (
    eventHandlers?: Partial<TxEventHandlers<ExecuteAllWithdrawRequestContext>>,
  ): Promise<Hash | null> => {
    const context: ExecuteAllWithdrawRequestContext = {};

    return this.sendTransaction(
      RESTAKING_PRECOMPILE_ABI,
      MULTI_ASSET_DELEGATION_EVM_ADDRESS,
      'executeWithdraw',
      [],
      context,
      eventHandlers,
    );
  };

  cancelWithdraw = async (
    withdrawRequests: CancelWithdrawRequestContext['withdrawRequests'],
    eventHandlers?: Partial<TxEventHandlers<CancelWithdrawRequestContext>>,
  ): Promise<Hash | null> => {
    const context: CancelWithdrawRequestContext = { withdrawRequests };

    const batchArgs = createEvmBatchCallArgs(
      withdrawRequests.map(({ amount, assetId }) => ({
        callData: encodeFunctionData({
          abi: RESTAKING_PRECOMPILE_ABI,
          functionName: 'cancelWithdraw',
          args: [BigInt(assetId), ZERO_ADDRESS, amount],
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
