import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import RestakeApiBase, {
  RestakeUndelegateRequest,
  RestakeWithdrawRequest,
  TxFailureCallback,
  TxSuccessCallback,
} from './RestakeAbiBase';
import { ISubmittableResult, Signer } from '@polkadot/types/types';
import { ApiPromise } from '@polkadot/api';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/utils/createRestakeAssetId';
import { BN } from '@polkadot/util';
import { isEvmAddress } from '@webb-tools/webb-ui-components';
import optimizeTxBatch from '../../utils/optimizeTxBatch';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { TxName } from '../../constants';
import extractErrorFromTxStatus from '../../utils/extractErrorFromStatus';

class RestakeSubstrateApi extends RestakeApiBase {
  constructor(
    readonly activeAccount: SubstrateAddress,
    readonly signer: Signer,
    readonly api: ApiPromise,
    readonly onSuccess: TxSuccessCallback,
    readonly onFailure: TxFailureCallback,
  ) {
    super();

    this.api.setSigner(signer);
  }

  private handleStatusUpdate = (txName: TxName) => {
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

  private async submitTx(
    txName: TxName,
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
  ): Promise<void> {
    await extrinsic.signAndSend(
      this.activeAccount,
      { signer: this.signer, nonce: -1 },
      this.handleStatusUpdate(txName),
    );
  }

  async deposit(assetId: RestakeAssetId, amount: BN) {
    const assetIdEnum = isEvmAddress(assetId)
      ? { Erc20: assetId }
      : { Custom: new BN(assetId) };

    const extrinsic = this.api.tx.multiAssetDelegation.deposit(
      assetIdEnum,
      amount,
      null,
      null,
    );

    await this.submitTx(TxName.RESTAKE_DEPOSIT, extrinsic);
  }

  delegate(
    operatorAddress: SubstrateAddress,
    assetId: RestakeAssetId,
    amount: BN,
    blueprintSelection?: BN[],
  ) {
    const assetIdEnum = isEvmAddress(assetId)
      ? { Erc20: assetId }
      : { Custom: new BN(assetId) };

    const blueprintSelectionEnum =
      blueprintSelection === undefined
        ? { All: 'All' }
        : { Fixed: blueprintSelection };

    // TODO: Evm address & lock multiplier.
    const extrinsic = this.api.tx.multiAssetDelegation.delegate(
      operatorAddress,
      assetIdEnum,
      amount,
      blueprintSelectionEnum,
    );

    return this.submitTx(TxName.RESTAKE_DELEGATE, extrinsic);
  }

  undelegate(
    operatorAddress: SubstrateAddress,
    assetId: RestakeAssetId,
    amount: BN,
  ) {
    const assetIdEnum = isEvmAddress(assetId)
      ? { Erc20: assetId }
      : { Custom: new BN(assetId) };

    const extrinsic = this.api.tx.multiAssetDelegation.scheduleDelegatorUnstake(
      operatorAddress,
      assetIdEnum,
      amount,
    );

    return this.submitTx(TxName.RESTAKE_UNSTAKE, extrinsic);
  }

  withdraw(assetId: RestakeAssetId, amount: BN) {
    const assetIdEnum = isEvmAddress(assetId)
      ? { Erc20: assetId }
      : { Custom: new BN(assetId) };

    const extrinsic = this.api.tx.multiAssetDelegation.scheduleWithdraw(
      assetIdEnum,
      amount,
    );

    return this.submitTx(TxName.RESTAKE_WITHDRAW, extrinsic);
  }

  cancelUndelegate(requests: RestakeUndelegateRequest[]) {
    const batch = requests.map(({ operatorAddress, assetId, amount }) => {
      const assetIdEnum = isEvmAddress(assetId)
        ? { Erc20: assetId }
        : { Custom: new BN(assetId) };

      return this.api.tx.multiAssetDelegation.cancelDelegatorUnstake(
        operatorAddress,
        assetIdEnum,
        amount,
      );
    });

    const extrinsic = optimizeTxBatch(this.api, batch);

    return this.submitTx(TxName.RESTAKE_CANCEL_UNSTAKE, extrinsic);
  }

  cancelWithdraw(requests: RestakeWithdrawRequest[]) {
    const batch = requests.map(({ assetId, amount }) => {
      const assetIdEnum = isEvmAddress(assetId)
        ? { Erc20: assetId }
        : { Custom: new BN(assetId) };

      return this.api.tx.multiAssetDelegation.cancelWithdraw(
        assetIdEnum,
        amount,
      );
    });

    const extrinsic = optimizeTxBatch(this.api, batch);

    return this.submitTx(TxName.RESTAKE_CANCEL_WITHDRAW, extrinsic);
  }

  executeUndelegate() {
    const extrinsic =
      this.api.tx.multiAssetDelegation.executeDelegatorUnstake();

    return this.submitTx(TxName.RESTAKE_EXECUTE_UNSTAKE, extrinsic);
  }

  executeWithdraw() {
    // TODO: Figure out what the EVM address param is for.
    const extrinsic = this.api.tx.multiAssetDelegation.executeWithdraw(null);

    return this.submitTx(TxName.RESTAKE_EXECUTE_WITHDRAW, extrinsic);
  }
}

export default RestakeSubstrateApi;
