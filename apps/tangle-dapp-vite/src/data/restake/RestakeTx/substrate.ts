import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult, Signer } from '@polkadot/types/types';
import noop from 'lodash/noop';
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
  type TxEventHandlers,
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

  private signAndSendExtrinsic = <Context extends Record<string, unknown>>(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    context: Context,
    eventHandlers?: TxEventHandlers<Context>,
  ) => {
    return new Promise<Hash | null>((resolve) => {
      let unsub = noop;

      extrinsic
        .signAndSend(
          this.activeAccount,
          { nonce: -1 },
          ({ dispatchError, events, status, txHash }) => {
            if (status.isInBlock) {
              const blockHash = status.asInBlock;
              eventHandlers?.onTxInBlock?.(
                txHash.toHex(),
                blockHash.toHex(),
                context,
              );
            }

            if (status.isFinalized) {
              const blockHash = status.asFinalized;
              eventHandlers?.onTxFinalized?.(
                txHash.toHex(),
                blockHash.toHex(),
                context,
              );
            }

            if (!status.isFinalized) {
              return;
            }

            const systemEvents = events.filter(
              ({ event: { section } }) => section === 'system',
            );

            for (const event of systemEvents) {
              const {
                event: { method },
              } = event;

              if (dispatchError && method === 'ExtrinsicFailed') {
                let message: string = dispatchError.type;

                if (dispatchError.isModule) {
                  try {
                    const mod = dispatchError.asModule;
                    const error = dispatchError.registry.findMetaError(mod);

                    message = `${error.section}.${error.name}`;
                  } catch {
                    eventHandlers?.onTxFailed?.(message, context);
                    resolve(null);
                    unsub();
                  }
                } else if (dispatchError.isToken) {
                  message = `${dispatchError.type}.${dispatchError.asToken.type}`;
                }

                eventHandlers?.onTxFailed?.(message, context);
                resolve(null);
                unsub();
              } else if (method === 'ExtrinsicSuccess' && status.isFinalized) {
                const txHashHex = txHash.toHex();
                eventHandlers?.onTxSuccess?.(
                  txHashHex,
                  status.asFinalized.toHex(),
                  context,
                );
                // Resolve with the block hash
                resolve(txHashHex);
                unsub();
              }
            }
          },
        )
        .then((unsubFn) => (unsub = unsubFn))
        .catch((error) => {
          resolve(null);
          eventHandlers?.onTxFailed?.(error.message, context);
          unsub();
        });
    });
  };

  deposit = async (
    assetId: string,
    amount: bigint,
    operatorAccount?: string,
    eventHandlers?: TxEventHandlers<DepositContext>,
  ) => {
    const context = {
      amount,
      assetId,
      operatorAccount,
    } satisfies DepositContext;

    // If no operator account is provided, just deposit the asset and return.
    if (!operatorAccount) {
      const extrinsic = this.provider.tx.multiAssetDelegation.deposit(
        assetId,
        amount,
      );

      eventHandlers?.onTxSending?.(context);

      return this.signAndSendExtrinsic(extrinsic, context, eventHandlers);
    }

    // Otherwise, batching the deposit & delegate transactions.
    const extrinsics = this.provider.tx.utility.batchAll([
      this.provider.tx.multiAssetDelegation.deposit(assetId, amount),
      this.provider.tx.multiAssetDelegation.delegate(
        operatorAccount,
        assetId,
        amount,
        // TODO: Tin: Check if this is the correct value.
        { All: 'All' },
      ),
    ]);

    eventHandlers?.onTxSending?.(context);

    return this.signAndSendExtrinsic(extrinsics, context, eventHandlers);
  };

  stake = async (
    operatorAccount: string,
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<DelegatorStakeContext>,
  ) => {
    const context = {
      amount,
      assetId,
      operatorAccount,
    } satisfies DelegatorStakeContext;

    // Deposit the asset into the Substrate chain.
    const extrinsic = this.provider.tx.multiAssetDelegation.delegate(
      operatorAccount,
      assetId,
      amount,
      // TODO: Tin: Check if this is the correct value.
      { All: 'All' },
    );

    eventHandlers?.onTxSending?.(context);

    return this.signAndSendExtrinsic(extrinsic, context, eventHandlers);
  };

  scheduleDelegatorUnstake = async (
    operatorAccount: string,
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<ScheduleDelegatorUnstakeContext>,
  ) => {
    const context = {
      amount,
      assetId,
      operatorAccount,
    } satisfies ScheduleDelegatorUnstakeContext;

    const extrinsic =
      this.provider.tx.multiAssetDelegation.scheduleDelegatorUnstake(
        operatorAccount,
        assetId,
        amount,
      );

    eventHandlers?.onTxSending?.(context);

    return this.signAndSendExtrinsic(extrinsic, context, eventHandlers);
  };

  executeDelegatorUnstakeRequests = async (
    eventHandlers?: TxEventHandlers<ExecuteAllDelegatorUnstakeRequestContext>,
  ): Promise<Hash | null> => {
    const context = {} satisfies ExecuteAllWithdrawRequestContext;

    const extrinsic =
      this.provider.tx.multiAssetDelegation.executeDelegatorUnstake();

    eventHandlers?.onTxSending?.(context);

    return this.signAndSendExtrinsic(extrinsic, context, eventHandlers);
  };

  cancelDelegatorUnstakeRequests = async (
    unstakeRequests: CancelDelegatorUnstakeRequestContext['unstakeRequests'],
    eventHandlers?:
      | TxEventHandlers<CancelDelegatorUnstakeRequestContext>
      | undefined,
  ): Promise<Hash | null> => {
    const context = {
      unstakeRequests,
    } satisfies CancelDelegatorUnstakeRequestContext;

    const extrinsics = this.provider.tx.utility.batchAll(
      unstakeRequests.map(({ amount, assetId, operatorAccount }) =>
        this.provider.tx.multiAssetDelegation.cancelDelegatorUnstake(
          operatorAccount,
          assetId,
          amount,
        ),
      ),
    );

    eventHandlers?.onTxSending?.(context);

    return this.signAndSendExtrinsic(extrinsics, context, eventHandlers);
  };

  scheduleWithdraw = async (
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<ScheduleWithdrawContext>,
  ) => {
    const context = {
      amount,
      assetId,
    } satisfies ScheduleWithdrawContext;

    const extrinsic = this.provider.tx.multiAssetDelegation.scheduleWithdraw(
      assetId,
      amount,
    );

    eventHandlers?.onTxSending?.(context);

    return this.signAndSendExtrinsic(extrinsic, context, eventHandlers);
  };

  executeWithdraw = async (
    eventHandlers?: TxEventHandlers<ExecuteAllWithdrawRequestContext>,
  ) => {
    const context = {} satisfies ExecuteAllWithdrawRequestContext;

    const extrinsic = this.provider.tx.multiAssetDelegation.executeWithdraw();

    eventHandlers?.onTxSending?.(context);

    return this.signAndSendExtrinsic(extrinsic, context, eventHandlers);
  };

  cancelWithdraw = async (
    withdrawRequests: CancelWithdrawRequestContext['withdrawRequests'],
    eventHandlers?: TxEventHandlers<CancelWithdrawRequestContext>,
  ) => {
    const context = {
      withdrawRequests,
    } satisfies CancelWithdrawRequestContext;

    const extrinsics = this.provider.tx.utility.batchAll(
      withdrawRequests.map(({ amount, assetId }) =>
        this.provider.tx.multiAssetDelegation.cancelWithdraw(assetId, amount),
      ),
    );

    eventHandlers?.onTxSending?.(context);

    return this.signAndSendExtrinsic(extrinsics, context, eventHandlers);
  };
}
