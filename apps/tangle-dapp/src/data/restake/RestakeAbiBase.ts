import { BN } from '@polkadot/util';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/utils/createRestakeAssetId';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import { Hash } from 'viem';

export type RestakeWithdrawRequest = {
  assetId: RestakeAssetId;
  amount: BN;
};

export type RestakeUndelegateRequest = {
  operatorAddress: SubstrateAddress;
  assetId: RestakeAssetId;
  amount: BN;
};

abstract class RestakeApiBase {
  abstract deposit(assetId: RestakeAssetId, amount: BN): Promise<Hash | Error>;

  abstract delegate(
    operatorAddress: SubstrateAddress,
    assetId: RestakeAssetId,
    amount: BN,
    blueprintSelection?: BN[],
  ): Promise<Hash | Error>;

  abstract undelegate(
    operatorAddress: SubstrateAddress,
    assetId: RestakeAssetId,
    amount: BN,
  ): Promise<Hash | Error>;

  abstract withdraw(assetId: RestakeAssetId, amount: BN): Promise<Hash | Error>;

  abstract cancelUndelegate(
    requests: RestakeUndelegateRequest[],
  ): Promise<Hash | Error>;

  abstract executeUndelegate(): Promise<Hash | Error>;

  abstract executeWithdraw(): Promise<Hash | Error>;

  abstract cancelWithdraw(
    requests: RestakeWithdrawRequest[],
  ): Promise<Hash | Error>;
}

export default RestakeApiBase;
