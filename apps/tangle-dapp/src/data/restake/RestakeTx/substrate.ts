import type { ApiPromise } from '@polkadot/api';
import type { Signer } from '@polkadot/types/types';
import { signAndSendExtrinsic } from '@webb-tools/polkadot-api-provider';
import { TxEventHandlers } from '@webb-tools/abstract-api-provider';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import type { Hash } from 'viem';
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
} from './base';

export default class SubstrateRestakeTx extends RestakeTxBase {
  constructor(
    readonly activeAccount: string,
    readonly signer: Signer,
    readonly provider: ApiPromise,
  ) {
    super();

    this.provider.setSigner(this.signer);
  }

  deposit = async (
    assetId: string,
    amount: bigint,
    operatorAccount?: string,
    eventHandlers?: Partial<TxEventHandlers<DepositContext>>,
  ) => {
    const context = {
      amount,
      assetId,
      operatorAccount,
    } satisfies DepositContext;

    // If no operator account is provided, just deposit the asset and return.
    if (!operatorAccount) {
      const extrinsic = this.provider.tx.multiAssetDelegation.deposit(
        { Custom: assetId },
        amount,
        null,
      );

      eventHandlers?.onTxSending?.(context);

      return signAndSendExtrinsic(
        this.activeAccount,
        extrinsic,
        context,
        eventHandlers,
      );
    }

    // Otherwise, batching the deposit & delegate transactions.
    const extrinsics = this.provider.tx.utility.batchAll([
      this.provider.tx.multiAssetDelegation.deposit(
        { Custom: assetId },
        amount,
        null,
      ),
      this.provider.tx.multiAssetDelegation.delegate(
        operatorAccount,
        { Custom: assetId },
        amount,
        // TODO: For now, select all the AVS' that the operator has. Later on, allow specific selection.
        { All: 'All' },
      ),
    ]);

    eventHandlers?.onTxSending?.(context);

    return signAndSendExtrinsic(
      this.activeAccount,
      extrinsics,
      context,
      eventHandlers,
    );
  };

  stake = async (
    operatorAccount: SubstrateAddress,
    assetId: string,
    amount: bigint,
    eventHandlers?: Partial<TxEventHandlers<DelegatorStakeContext>>,
  ) => {
    const context = {
      amount,
      assetId,
      operatorAccount,
    } satisfies DelegatorStakeContext;

    // Deposit the asset into the Substrate chain.
    const extrinsic = this.provider.tx.multiAssetDelegation.delegate(
      operatorAccount,
      { Custom: assetId },
      amount,
      // TODO: For now, select all the AVS' that the operator has. Later on, allow specific selection.
      { All: 'All' },
    );

    eventHandlers?.onTxSending?.(context);

    return signAndSendExtrinsic(
      this.activeAccount,
      extrinsic,
      context,
      eventHandlers,
    );
  };

  scheduleDelegatorUnstake = async (
    operatorAccount: SubstrateAddress,
    assetId: string,
    amount: bigint,
    eventHandlers?: Partial<TxEventHandlers<ScheduleDelegatorUnstakeContext>>,
  ) => {
    const context = {
      amount,
      assetId,
      operatorAccount,
    } satisfies ScheduleDelegatorUnstakeContext;

    const extrinsic =
      this.provider.tx.multiAssetDelegation.scheduleDelegatorUnstake(
        operatorAccount,
        { Custom: assetId },
        amount,
      );

    eventHandlers?.onTxSending?.(context);

    return signAndSendExtrinsic(
      this.activeAccount,
      extrinsic,
      context,
      eventHandlers,
    );
  };

  executeDelegatorUnstakeRequests = async (
    eventHandlers?: Partial<
      TxEventHandlers<ExecuteAllDelegatorUnstakeRequestContext>
    >,
  ): Promise<Hash | null> => {
    const context = {} satisfies ExecuteAllWithdrawRequestContext;

    const extrinsic =
      this.provider.tx.multiAssetDelegation.executeDelegatorUnstake();

    eventHandlers?.onTxSending?.(context);

    return signAndSendExtrinsic(
      this.activeAccount,
      extrinsic,
      context,
      eventHandlers,
    );
  };

  cancelDelegatorUnstakeRequests = async (
    unstakeRequests: CancelDelegatorUnstakeRequestContext['unstakeRequests'],
    eventHandlers?:
      | Partial<TxEventHandlers<CancelDelegatorUnstakeRequestContext>>
      | undefined,
  ): Promise<Hash | null> => {
    const context = {
      unstakeRequests,
    } satisfies CancelDelegatorUnstakeRequestContext;

    const extrinsics = this.provider.tx.utility.batchAll(
      unstakeRequests.map(({ amount, assetId, operatorAccount }) =>
        this.provider.tx.multiAssetDelegation.cancelDelegatorUnstake(
          operatorAccount,
          { Custom: assetId },
          amount,
        ),
      ),
    );

    eventHandlers?.onTxSending?.(context);

    return signAndSendExtrinsic(
      this.activeAccount,
      extrinsics,
      context,
      eventHandlers,
    );
  };

  scheduleWithdraw = async (
    assetId: string,
    amount: bigint,
    eventHandlers?: Partial<TxEventHandlers<ScheduleWithdrawContext>>,
  ) => {
    const context = {
      amount,
      assetId,
    } satisfies ScheduleWithdrawContext;

    const extrinsic = this.provider.tx.multiAssetDelegation.scheduleWithdraw(
      { Custom: assetId },
      amount,
    );

    eventHandlers?.onTxSending?.(context);

    return signAndSendExtrinsic(
      this.activeAccount,
      extrinsic,
      context,
      eventHandlers,
    );
  };

  executeWithdraw = async (
    eventHandlers?: Partial<TxEventHandlers<ExecuteAllWithdrawRequestContext>>,
  ) => {
    const context = {} satisfies ExecuteAllWithdrawRequestContext;

    const extrinsic =
      this.provider.tx.multiAssetDelegation.executeWithdraw(null);

    eventHandlers?.onTxSending?.(context);

    return signAndSendExtrinsic(
      this.activeAccount,
      extrinsic,
      context,
      eventHandlers,
    );
  };

  cancelWithdraw = async (
    withdrawRequests: CancelWithdrawRequestContext['withdrawRequests'],
    eventHandlers?: Partial<TxEventHandlers<CancelWithdrawRequestContext>>,
  ) => {
    const context = {
      withdrawRequests,
    } satisfies CancelWithdrawRequestContext;

    const extrinsics = this.provider.tx.utility.batchAll(
      withdrawRequests.map(({ amount, assetId }) =>
        this.provider.tx.multiAssetDelegation.cancelWithdraw(
          { Custom: assetId },
          amount,
        ),
      ),
    );

    eventHandlers?.onTxSending?.(context);

    return signAndSendExtrinsic(
      this.activeAccount,
      extrinsics,
      context,
      eventHandlers,
    );
  };
}
