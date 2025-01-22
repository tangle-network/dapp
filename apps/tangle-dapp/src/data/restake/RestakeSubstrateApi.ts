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
import { signAndSendExtrinsic } from '@webb-tools/polkadot-api-provider';
import { isEvmAddress } from '@webb-tools/webb-ui-components';
import { ZERO_ADDRESS } from '../../constants/evmPrecompiles';
import optimizeTxBatch from '../../utils/optimizeTxBatch';
import { Hash } from 'viem';
import { SubmittableExtrinsic } from '@polkadot/api/types';

class RestakeSubstrateApi extends RestakeApiBase {
  constructor(
    readonly activeAccount: SubstrateAddress,
    readonly signer: Signer,
    readonly api: ApiPromise,
    onSuccess: TxSuccessCallback,
    onFailure: TxFailureCallback,
  ) {
    super(onSuccess, onFailure);

    this.api.setSigner(signer);
  }

  private async submitTx(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
  ): Promise<Hash | Error> {
    return signAndSendExtrinsic(this.activeAccount, extrinsic, {});
  }

  deposit(assetId: RestakeAssetId, amount: BN) {
    const assetIdEnum = isEvmAddress(assetId)
      ? { Erc20: assetId }
      : { Custom: new BN(assetId) };

    const extrinsic = this.api.tx.multiAssetDelegation.deposit(
      assetIdEnum,
      amount,
      null,
      null,
    );

    return this.submitTx(extrinsic);
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

    return this.submitTx(extrinsic);
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

    return this.submitTx(extrinsic);
  }

  withdraw(assetId: RestakeAssetId, amount: BN) {
    const assetIdEnum = isEvmAddress(assetId)
      ? { Erc20: assetId }
      : { Custom: new BN(assetId) };

    const extrinsic = this.api.tx.multiAssetDelegation.scheduleWithdraw(
      assetIdEnum,
      amount,
    );

    return this.submitTx(extrinsic);
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

    return this.submitTx(extrinsic);
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

    return this.submitTx(extrinsic);
  }

  executeUndelegate() {
    const extrinsic =
      this.api.tx.multiAssetDelegation.executeDelegatorUnstake();

    return this.submitTx(extrinsic);
  }

  executeWithdraw() {
    // TODO: Figure out what the EVM address param is for.
    const extrinsic =
      this.api.tx.multiAssetDelegation.executeWithdraw(ZERO_ADDRESS);

    return this.submitTx(extrinsic);
  }
}

export default RestakeSubstrateApi;
