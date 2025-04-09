import { Card, Input, Typography } from '@tangle-network/ui-components';
import { Children, FC, useCallback } from 'react';
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
import { AssetSchema, mapPrimitiveAssetMetadataToAssetSchema } from '../../../../../utils/validations/deployBlueprint';

export const PaymentStep: FC<PaymentStepProps> = ({
  errors,
  setValue,
  watch,
  assets,
}) => {
  const onSelectAsset = useCallback((asset: AssetSchema) => {
    setValue('paymentAsset', asset);
  }, [setValue]);

  const onChangePaymentAmount = useCallback((nextValue: string) => {
    setValue('paymentAmount', Number(nextValue));
  }, [setValue]);

  return (
    <Card className="p-6">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0 mb-4">
        Payment
      </Typography>
      <hr className="border-mono-80 dark:border-mono-160 mb-6" />

      <div className='flex gap-6 w-full'>
        <div className="space-y-2 flex-1">
          <Typography variant="body1" className="text-mono-200 dark:text-mono-0">
            Select Payment Asset
          </Typography>
          <Select onValueChange={(assetId) => {
            const asset = assets.find((asset) => asset.id === assetId);
            if (asset) {
              onSelectAsset(mapPrimitiveAssetMetadataToAssetSchema(asset));
            }
          }}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  <div className="flex items-center gap-2">
                    <LsTokenIcon name="TNT" size="md" />
                    <Typography variant="body1">Select payment asset</Typography>
                  </div>
                }
              />
            </SelectTrigger>

            <SelectContent>
              {Children.toArray(
                assets.map((asset) => (
                  <SelectItem
                    value={asset.id ?? ''}
                    id={asset.id}
                  >
                    <div className="flex items-center gap-2">
                      <LsTokenIcon name={asset.name ?? 'TNT'} size="md" />
                      <Typography variant="body1">
                        {asset.name ?? 'TNT'}
                      </Typography>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors?.paymentAsset?.message && (
            <ErrorMessage className="mt-1">{errors.paymentAsset.message}</ErrorMessage>
          )}
        </div>

        <div className="space-y-2 flex-1">
          <Typography variant="body1" className="text-mono-200 dark:text-mono-0">
            Payment Amount
          </Typography>
          <Input 
            isControlled
            id="paymentAmount"
            placeholder="Enter payment amount"
            value={watch('paymentAmount')?.toString() ?? ''}
            onChange={onChangePaymentAmount}
            type="number"
            className="w-full"
          />
          {errors?.paymentAmount?.message && (
            <ErrorMessage className="mt-1">{errors.paymentAmount.message}</ErrorMessage>
          )}
        </div>
      </div>
    </Card>
  );
};
