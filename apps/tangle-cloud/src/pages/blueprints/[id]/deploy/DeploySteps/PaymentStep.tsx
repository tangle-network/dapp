import { Card, Input, Typography } from '@tangle-network/ui-components';
import { Children, FC } from 'react';
import { PaymentStepProps } from './type';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import ErrorMessage from '../../../../../components/ErrorMessage';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';
import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import useAssets from '@tangle-network/tangle-shared-ui/hooks/useAssets';

export const PaymentStep: FC<PaymentStepProps> = ({
  errors,
  setValue,
  watch,
}) => {
  const { result: assets } = useAssets();

  const onSelectAsset = (asset: RestakeAsset) => {
    setValue('paymentAsset', {
      id: asset.id,
      metadata: {
        ...asset.metadata,
        deposit: asset.metadata.deposit ?? '',
        isFrozen: asset.metadata.isFrozen ?? false,
      },
    });
  };

  const onChangePaymentAmount = (nextValue: string) => {
    setValue('paymentAmount', nextValue);
  };

  return (
    <Card className="p-6">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0 mb-4">
        Payment
      </Typography>

      <div className="flex gap-6 w-full">
        <div className="space-y-2 flex-1">
          <Typography
            variant="body1"
            className="text-mono-200 dark:text-mono-0"
          >
            Select Payment Asset
          </Typography>
          <Select
            onValueChange={(assetId) => {
              const asset = assets?.get(assertRestakeAssetId(assetId));
              if (asset) {
                onSelectAsset(asset);
              }
            }}
          >
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder={'Select payment asset'} />
            </SelectTrigger>

            <SelectContent>
              {Children.toArray(
                Array.from(assets?.values() ?? [])
                  .filter((asset) => asset.metadata.name && asset.metadata.name.trim() !== '')
                  .map((asset) => {
                    const name = asset.metadata.name || 'TNT';
                    return (
                      <SelectItem value={asset.id} id={asset.id}>
                        <div className="flex items-center gap-2">
                          <LsTokenIcon
                            name={name}
                            size="md"
                          />
                          <Typography variant="body1">
                            {name}
                          </Typography>
                        </div>
                      </SelectItem>
                    );
                  }),
              )}
            </SelectContent>
          </Select>
          {errors?.paymentAsset?.message && (
            <ErrorMessage className="mt-1">
              {errors.paymentAsset.message}
            </ErrorMessage>
          )}
        </div>

        <div className="space-y-2 flex-1">
          <Typography
            variant="body1"
            className="text-mono-200 dark:text-mono-0"
          >
            Payment Amount
          </Typography>
          <Input
            isControlled
            id="paymentAmount"
            placeholder="Enter payment amount"
            value={watch('paymentAmount')?.toString() ?? ''}
            onChange={onChangePaymentAmount}
            type="text"
            inputClassName="h-10"
            className="w-full"
          />
          {errors?.paymentAmount?.message && (
            <ErrorMessage className="mt-1">
              {errors.paymentAmount.message}
            </ErrorMessage>
          )}
        </div>
      </div>
    </Card>
  );
};
