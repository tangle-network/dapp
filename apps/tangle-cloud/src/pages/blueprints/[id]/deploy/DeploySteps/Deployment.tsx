import { FC, useMemo } from 'react';
import { BasicInformationStep } from './BasicInformationStep';
import { BaseDeployStepProps } from './type';
import { AssetConfigurationStep } from './AssetConfigurationStep';
import { SelectOperatorsStep } from './OperatorSelectionStep';
import { RequestArgsConfigurationStep } from './RequestArgsConfigurationStep';
import { PaymentStep } from './PaymentStep';
import useAssets from '@tangle-network/tangle-shared-ui/hooks/useAssets';
import { PrimitiveAssetMetadata } from '@tangle-network/tangle-shared-ui/types/restake';

export const Deployment: FC<BaseDeployStepProps> = (props) => {
  const { result: assetsWithMetadata } = useAssets();

  const assets = useMemo(() => {
    if (!assetsWithMetadata) return [];
    return Array.from(assetsWithMetadata.entries()).map(([id, asset]) => {
      return {
        ...asset,
        id: id,
        priceInUsd: asset?.priceInUsd ?? null,
        name: asset?.name ?? '',
        symbol: asset?.symbol ?? '',
        decimals: asset?.decimals ?? 0,
        deposit: asset?.deposit ?? '',
        isFrozen: asset?.isFrozen ?? false,
      } satisfies PrimitiveAssetMetadata;
    });
  }, [assetsWithMetadata]);

  return (
    <>
      <BasicInformationStep {...props} />
      <SelectOperatorsStep {...props} assets={assets} assetsWithMetadata={assetsWithMetadata}/>
      <AssetConfigurationStep {...props} />
      <RequestArgsConfigurationStep {...props} />
      <PaymentStep {...props} assets={assets} assetsWithMetadata={assetsWithMetadata}/>
    </>
  );
};
