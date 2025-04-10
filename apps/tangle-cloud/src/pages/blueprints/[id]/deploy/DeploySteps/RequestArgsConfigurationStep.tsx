import { Children, FC } from 'react';
import { RequestArgsConfigurationStepProps } from './type';
import { Card, Typography } from '@tangle-network/ui-components';
import PrimitiveFieldTypeInput from '@tangle-network/tangle-shared-ui/components/PrimitiveFieldTypeInput';
import ErrorMessage from '../../../../../components/ErrorMessage';

export const RequestArgsConfigurationStep: FC<
  RequestArgsConfigurationStepProps
> = ({ errors, setValue, watch, blueprint }) => {
  return (
    <Card className="p-6">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0 mb-4">
        Request Arguments
      </Typography>
      <hr className="border-mono-80 dark:border-mono-160 mb-6" />

      <div className="flex justify-between mb-3">
        {!blueprint?.requestParams?.length ? (
          <div>
            <Typography variant="body1">No request arguments</Typography>
          </div>
        ) : (
          <div className="grid gap-4 p-0 mt-3 sm:grid-cols-2 mb-5">
            {Children.toArray(
              blueprint.requestParams.map((param, idx) => {
                return (
                  <PrimitiveFieldTypeInput
                    label={`Param ${idx + 1}`}
                    fieldType={param}
                    id={idx.toString()}
                    value={watch(`requestArgs.${idx}`)}
                    onValueChange={(value) => {
                      setValue(`requestArgs.${idx}`, value);
                    }}
                    tabIndex={idx + 1}
                  />
                );
              }),
            )}
          </div>
        )}
      </div>
      {errors?.requestArgs && (
        <ErrorMessage>{errors.requestArgs.message}</ErrorMessage>
      )}
    </Card>
  );
};
