import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { Input, Typography } from '@tangle-network/ui-components';
import { FC } from 'react';
import { PrimitiveAssetMetadata } from '@tangle-network/tangle-shared-ui/types/restake';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import ErrorMessage from '../../../../../components/ErrorMessage';
import cx from 'classnames';

type AssetRequirementFormItemProps = {
  index: number;
  assetId?: RestakeAssetId;
  onChangeMinExposurePercent: (value: string) => void;
  onChangeMaxExposurePercent: (value: string) => void;
  assetMetadata?: PrimitiveAssetMetadata | null;
  minExposurePercent?: string;
  maxExposurePercent?: string;
  minExposurePercentErrorMsg?: string;
  maxExposurePercentErrorMsg?: string;
  className?: string;
};

export const AssetRequirementFormItem: FC<AssetRequirementFormItemProps> = ({
  index,
  assetId,
  minExposurePercent,
  maxExposurePercent,
  onChangeMinExposurePercent,
  onChangeMaxExposurePercent,
  minExposurePercentErrorMsg,
  maxExposurePercentErrorMsg,
  assetMetadata,
  className,
}) => {
  return (
    <div className={cx('flex flex-wrap gap-4 items-center', className)}>
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

      <div className="space-y-2 w-4/12">
        <Input
          id={`securityCommitment.${index}.minExposurePercent`}
          isControlled
          rightIcon={<>%</>}
          value={minExposurePercent ?? ''}
          inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
          placeholder="Enter exposure percentage to spend"
          onChange={onChangeMinExposurePercent}
          type="number"
          autoComplete="off"
          min={minExposurePercent || 0}
          max={maxExposurePercent || 100}
        />
        {minExposurePercentErrorMsg && (
          <ErrorMessage>{minExposurePercentErrorMsg}</ErrorMessage>
        )}
      </div>
      <div className="space-y-2 w-4/12">
        <Input
          id={`securityCommitment.${index}.maxExposurePercent`}
          isControlled
          rightIcon={<>%</>}
          value={maxExposurePercent ?? ''}
          inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
          placeholder="Enter exposure percentage to spend"
          onChange={onChangeMaxExposurePercent}
          type="number"
          autoComplete="off"
          min={minExposurePercent || 0}
          max={maxExposurePercent || 100}
        />
        {maxExposurePercentErrorMsg && (
          <ErrorMessage>{maxExposurePercentErrorMsg}</ErrorMessage>
        )}
      </div>
    </div>
  );
};
