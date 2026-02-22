import { FC } from 'react';
import { Card, Typography, Input } from '@tangle-network/ui-components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import { BaseDeployStepProps } from './type';
import { RequestMode } from '../../../../../utils/validations/deployBlueprint';

export const RequestModeStep: FC<BaseDeployStepProps> = ({
  errors,
  setValue,
  watch,
}) => {
  const requestMode = watch('requestMode') ?? 'basic';
  const globalExposurePercent = watch('globalExposurePercent');

  return (
    <Card className="p-6">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0 mb-2">
        Request Mode
      </Typography>
      <Typography variant="body2" className="text-mono-100 mb-4">
        Select which contract request variant to use when deploying.
      </Typography>

      <div className="flex flex-col gap-4">
        <div>
          <Typography variant="body3" className="mb-1">
            Mode
          </Typography>
          <Select
            value={requestMode}
            onValueChange={(value) =>
              setValue('requestMode', value as RequestMode)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="exposure">With Exposure</SelectItem>
              <SelectItem value="security">With Security</SelectItem>
            </SelectContent>
          </Select>
          {errors?.requestMode?.message && (
            <Typography variant="body3" className="text-red-500 mt-1">
              {errors.requestMode.message}
            </Typography>
          )}
        </div>

        {requestMode === 'exposure' && (
          <div>
            <Typography variant="body3" className="mb-1">
              Global Exposure (%)
            </Typography>
            <Input
              id="globalExposurePercent"
              type="number"
              min={1}
              max={100}
              value={globalExposurePercent?.toString() ?? ''}
              onChange={(value) =>
                setValue(
                  'globalExposurePercent',
                  value === '' ? undefined : Number(value),
                )
              }
            />
            {errors?.globalExposurePercent?.message && (
              <Typography variant="body3" className="text-red-500 mt-1">
                {errors.globalExposurePercent.message}
              </Typography>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
