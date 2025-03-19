import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { Signer } from '@polkadot/types/types';
import { ApiPromise } from '@polkadot/api';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { BN } from '@polkadot/util';
import { isEvmAddress } from '@tangle-network/ui-components';
import { TxName } from '../../constants';
import BaseSubstrateApi, { TxFailureCallback, TxSuccessCallback } from '../base/BaseSubstrateApi';

class ServiceSubstrateApi extends BaseSubstrateApi {
  constructor(
    readonly activeAccount: SubstrateAddress,
    readonly signer: Signer,
    readonly api: ApiPromise,
    readonly onSuccess: TxSuccessCallback,
    readonly onFailure: TxFailureCallback,
  ) {
    super(activeAccount, signer, api, onSuccess, onFailure);
  }

  async rejectServiceRequest(requestId: number) {
    const extrinsic = this.api.tx.services.reject(requestId);

    await this.submitTx(TxName.REJECT_SERVICE_REQUEST, extrinsic);
  }

  approveServiceRequest(
    requestId: number,
    operatorCommitments: {
      assetId: RestakeAssetId,
      exposurePercent: number,
    }[]
  ) {
    const securityCommitments = operatorCommitments.map((commitment) => ({
      assetId: isEvmAddress(commitment.assetId)
        ? { Erc20: commitment.assetId }
        : { Custom: new BN(commitment.assetId) },
      exposurePercent: commitment.exposurePercent,
    }));

    const extrinsic = this.api.tx.services.approve(
      requestId,
      securityCommitments,
    );

    return this.submitTx(TxName.APPROVE_SERVICE_REQUEST, extrinsic);
  }
}

export default ServiceSubstrateApi;
