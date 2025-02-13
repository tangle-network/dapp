import { BN } from '@polkadot/util';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { SubstrateAddress } from '@tangle-network/webb-ui-components/types/address';
import { Hash } from 'viem';
import { TxName } from '../../constants';

export type RestakeWithdrawRequest = {
  assetId: RestakeAssetId;
  amount: BN;
};

export type RestakeUndelegateRequest = {
  operatorAddress: SubstrateAddress;
  assetId: RestakeAssetId;
  amount: BN;
};

export type TxSuccessCallback = (
  hash: Hash,
  blockHash: Hash,
  txName: TxName,
) => void;

export type TxFailureCallback = (txName: TxName, error: Error) => void;

abstract class RestakeApiBase {
  abstract deposit(assetId: RestakeAssetId, amount: BN): Promise<void>;

  abstract delegate(
    operatorAddress: SubstrateAddress,
    assetId: RestakeAssetId,
    amount: BN,
    blueprintSelection?: BN[],
  ): Promise<void>;

  abstract undelegate(
    operatorAddress: SubstrateAddress,
    assetId: RestakeAssetId,
    amount: BN,
  ): Promise<void>;

  abstract withdraw(assetId: RestakeAssetId, amount: BN): Promise<void>;

  abstract cancelUndelegate(
    requests: RestakeUndelegateRequest[],
  ): Promise<void>;

  abstract executeUndelegate(): Promise<void>;

  abstract executeWithdraw(): Promise<void>;

  abstract cancelWithdraw(requests: RestakeWithdrawRequest[]): Promise<void>;
}

export default RestakeApiBase;
