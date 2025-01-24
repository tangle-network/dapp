import { ApiPromise } from '@polkadot/api';
import { Signer } from '@polkadot/types/types';
import { TxEventHandlers } from '@webb-tools/abstract-api-provider';
import signAndSendExtrinsic from '@webb-tools/polkadot-api-provider/utils/signAndSendExtrinsic';
import { isEvmAddress } from '@webb-tools/webb-ui-components';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import optimizeTxBatch from '../../../utils/optimizeTxBatch';
import RewardsTxBase, { ClaimRewardsArgs } from './base';

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
    args: ClaimRewardsArgs,
    eventHandlers?: Partial<TxEventHandlers<ClaimRewardsArgs>>,
  ) => {
    if (this.provider.tx.rewards?.claimRewards === undefined) {
      eventHandlers?.onTxFailed?.('The network does not support rewards', args);
      return null;
    }

    const { assetIds } = args;

    if (assetIds.length === 1) {
      const assetId = assetIds[0];
      const extrinsic = this.provider.tx.rewards.claimRewards(
        isEvmAddress(assetId)
          ? { Erc20: assetId }
          : { Custom: BigInt(assetId) },
      );

      eventHandlers?.onTxSending?.(args);

      return signAndSendExtrinsic(
        this.activeAccount,
        extrinsic,
        args,
        eventHandlers,
      );
    } else {
      const txes = assetIds.map((assetId) =>
        this.provider.tx.rewards.claimRewards(
          isEvmAddress(assetId)
            ? { Erc20: assetId }
            : { Custom: BigInt(assetId) },
        ),
      );

      const batchExtrinsic = optimizeTxBatch(this.provider, txes);

      eventHandlers?.onTxSending?.(args);

      return signAndSendExtrinsic(
        this.activeAccount,
        batchExtrinsic,
        args,
        eventHandlers,
      );
    }
  };
}
