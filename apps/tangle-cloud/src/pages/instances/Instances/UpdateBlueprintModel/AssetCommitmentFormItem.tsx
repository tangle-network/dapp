import { StakingAssetId } from '@tangle-network/tangle-shared-ui/types/staking';
import { Input, Text } from '../../../../components/sandbox/SandboxUi';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { FC } from 'react';
import { PrimitiveStakingAssetMetadata } from '@tangle-network/tangle-shared-ui/types/staking';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';

type AssetCommitmentFormItemProps = {
  index: number;
  assetId?: StakingAssetId;
  exposurePercent?: string;
  onChangeExposurePercent: (value: string) => void;
  exposurePercentErrorMsg?: string;
  assetMetadata?: PrimitiveStakingAssetMetadata | null;
  minExposurePercent?: string;
  maxExposurePercent?: string;
};

export const AssetCommitmentFormItem: FC<AssetCommitmentFormItemProps> = ({
  index,
  assetId,
  exposurePercent,
  onChangeExposurePercent,
  exposurePercentErrorMsg,
  assetMetadata,
  minExposurePercent,
  maxExposurePercent,
}) => {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="space-y-2 w-3/12">
        <Input
          id={`securityCommitment.${index}.assetId`}
          isControlled
          value={assetId ?? ''}
          className="hidden"
          isDisabled
        />
        <div className="flex items-center gap-2">
          <LsTokenIcon
            name={assetMetadata?.symbol ?? 'TNT'}
            hasRainbowBorder
            size="lg"
          />

          <Text variant="h5" className="whitespace-nowrap">
            {assetMetadata?.name ?? 'Unknown'}
          </Text>
        </div>
      </div>

      <div className="space-y-2 w-8/12">
        <Input
          id={`securityCommitment.${index}.exposurePercent`}
          isControlled
          rightIcon={<>%</>}
          value={exposurePercent ?? ''}
          inputClassName="placeholder:text-mono-100 dark:text-mono-60 h-10"
          placeholder="Enter exposure percentage to spend"
          onChange={onChangeExposurePercent}
          type="number"
          autoComplete="off"
          min={minExposurePercent || 0}
          max={maxExposurePercent || 100}
        />
        <Text variant="body3" className="text-mono-100 dark:text-mono-60">
          Min exposure: {minExposurePercent} ~ Max exposure:{' '}
          {maxExposurePercent}
        </Text>
        {exposurePercentErrorMsg && (
          <ErrorMessage>{exposurePercentErrorMsg}</ErrorMessage>
        )}
      </div>
    </div>
  );
};
