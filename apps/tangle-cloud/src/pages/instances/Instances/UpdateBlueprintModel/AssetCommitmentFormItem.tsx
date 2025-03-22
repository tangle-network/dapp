import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { Input, Typography } from '@tangle-network/ui-components';
import ErrorMessage from '../../../../components/ErrorMessage';
import { FC } from 'react';
import { PrimitiveAssetMetadata } from '@tangle-network/tangle-shared-ui/types/restake';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';

type AssetCommitmentFormItemProps = {
  index: number;
  assetId?: RestakeAssetId;
  exposurePercent?: string;
  onChangeExposurePercent: (value: string) => void;
  exposurePercentErrorMsg?: string;
  assetMetadata?: PrimitiveAssetMetadata | null;
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
            name={assetMetadata?.name ?? 'TNT'}
            hasRainbowBorder
            size="lg"
          />

          <Typography variant="h5" className="whitespace-nowrap">
            {assetMetadata?.name ?? 'TNT'}
          </Typography>
        </div>
      </div>

      <div className="space-y-2 w-8/12">
        <Input
          id={`securityCommitment.${index}.exposurePercent`}
          isControlled
          rightIcon={<>%</>}
          value={exposurePercent ?? ''}
          inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
          placeholder="Enter exposure percentage to spend"
          onChange={onChangeExposurePercent}
          type="number"
          autoComplete="off"
          min={minExposurePercent || 0}
          max={maxExposurePercent || 100}
        />
        <Typography variant="para2" className="text-mono-80 dark:text-mono-120">
          Min exposure: {minExposurePercent} ~ Max exposure:{' '}
          {maxExposurePercent}
        </Typography>
        {exposurePercentErrorMsg && (
          <ErrorMessage>{exposurePercentErrorMsg}</ErrorMessage>
        )}
      </div>
    </div>
  );
};
