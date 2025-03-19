import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { Hash } from 'viem';
import { TxName } from '../../constants';
import { ISubmittableResult, Signer } from '@polkadot/types/types';
import { ApiPromise } from '@polkadot/api';
import extractErrorFromTxStatus from '@tangle-network/tangle-shared-ui/utils/extractErrorFromStatus';
import { SubmittableExtrinsic } from '@polkadot/api/types';

export type TxSuccessCallback = (
  hash: Hash,
  blockHash: Hash,
  txName: TxName,
) => void;

export type TxFailureCallback = (txName: TxName, error: Error) => void;

class BaseSubstrateApi {
  constructor(
    protected readonly activeAccount: SubstrateAddress,
    protected readonly signer: Signer,
    protected readonly api: ApiPromise,
    protected readonly onSuccess: TxSuccessCallback,
    protected readonly onFailure: TxFailureCallback,
  ) {
    this.api.setSigner(signer);
  }

  protected handleStatusUpdate = (txName: TxName) => {
    return (status: ISubmittableResult) => {
      // If the component is unmounted, or the transaction
      // has not yet been included in a block, ignore the
      // status update.
      if (!status.isInBlock) {
        return;
      }

      const txHash = status.txHash.toHex();
      const blockHash = status.status.asInBlock.toHex();
      const error = extractErrorFromTxStatus(status);

      if (error === null) {
        this.onSuccess(txHash, blockHash, txName);
      } else {
        this.onFailure(txName, error);
      }
    };
  };


  protected async submitTx(
    txName: TxName,
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
  ): Promise<void> {
    await extrinsic.signAndSend(
      this.activeAccount,
      { signer: this.signer, nonce: -1 },
      this.handleStatusUpdate(txName),
    );
  }


}

export default BaseSubstrateApi;
