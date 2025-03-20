import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { IconButton, Input, Label } from '@tangle-network/ui-components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import ErrorMessage from '../../../../components/ErrorMessage';
import { Children, FC } from 'react';
import { CloseCircleLineIcon } from '@tangle-network/icons';
import { MonitoringServiceRequest } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import { PalletAssetsAssetMetadata } from '@polkadot/types/lookup';

type AssetCommitmentFormItemProps = {
  index: number;
  assetId?: RestakeAssetId;
  assetOptions?: MonitoringServiceRequest['securityRequirements'];
  onChangeAssetId: (value: RestakeAssetId) => void;
  assetErrorMsg?: string;
  exposurePercent?: string;
  onChangeExposurePercent: (value: string) => void;
  exposurePercentErrorMsg?: string;
  assetMetadata?: Map<string, PalletAssetsAssetMetadata | null>;
};

export const AssetCommitmentFormItem: FC<AssetCommitmentFormItemProps> = ({
  index,
  assetId,
  assetOptions,
  onChangeAssetId,
  assetErrorMsg,
  exposurePercent,
  onChangeExposurePercent,
  exposurePercentErrorMsg,
  assetMetadata,
}) => {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="space-y-2 w-6/12">
        <Label>Select Asset</Label>
        <Select value={assetId || ''} onValueChange={onChangeAssetId}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select Asset" />
          </SelectTrigger>

          <SelectContent>
            {Children.toArray(
              assetOptions?.map((option) => {
                return (
                  <SelectItem value={option.asset}>
                    {assetMetadata?.get(option.asset)?.name || option.asset}
                  </SelectItem>
                );
              }) ?? [],
            )}
          </SelectContent>
        </Select>
        {assetErrorMsg && <ErrorMessage>{assetErrorMsg}</ErrorMessage>}
      </div>

      <div className="space-y-2 w-4/12">
        <Label>Exposure percentage</Label>
        <Input
          id="exposurePercent"
          isControlled
          rightIcon={<>%</>}
          value={exposurePercent ?? ''}
          inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
          placeholder="Enter exposure percentage to spend"
          onChange={onChangeExposurePercent}
          type="number"
          autoComplete="off"
        />
        {exposurePercentErrorMsg && (
          <ErrorMessage>{exposurePercentErrorMsg}</ErrorMessage>
        )}
      </div>

      {index > 0 && (
        <div className="col-span-1 self-center pb-1 w-1/12">
          <Label className="invisible">Remove</Label>

          <IconButton
            onClick={() => {
              console.log('remove asset');
            }}
            tooltip="Remove asset"
          >
            <CloseCircleLineIcon size="lg" />
          </IconButton>
        </div>
      )}
    </div>
  );
};
