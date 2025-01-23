import { ApiPromise } from '@polkadot/api';
import { Signer } from '@polkadot/types/types';
import { TxEventHandlers } from '@webb-tools/abstract-api-provider';
import signAndSendExtrinsic from '@webb-tools/polkadot-api-provider/utils/signAndSendExtrinsic';
import { TangleAssetId } from '@webb-tools/tangle-shared-ui/types';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import RewardsTxBase from './base';

export default class SubstrateRewardsTx extends RewardsTxBase {
  constructor(
    readonly activeAccount: SubstrateAddress,
    readonly signer: Signer,
    readonly provider: ApiPromise,
  ) {
    super();

    this.provider.setSigner(this.signer);
  }

  claimRewards = async (
    args: { assetId: TangleAssetId },
    eventHandlers?: Partial<TxEventHandlers<{ assetId: TangleAssetId }>>,
  ) => {
    if (this.provider.tx.rewards?.claimRewards === undefined) {
      eventHandlers?.onTxFailed?.('The network does not support rewards', args);
      return null;
    }

    const { assetId } = args;

    const extrinsic = this.provider.tx.rewards.claimRewards(assetId);

    eventHandlers?.onTxSending?.(args);

    return signAndSendExtrinsic(
      this.activeAccount,
      extrinsic,
      args,
      eventHandlers,
    );
  };
}
