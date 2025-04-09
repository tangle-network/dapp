import { FC } from 'react';
import { RequestArgsConfigurationStepProps } from './type';
import { Card, Typography } from '@tangle-network/ui-components';

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
        {
          !blueprint?.requestParams?.length ? (
            <div>
              <Typography variant="body1">
                No request arguments
              </Typography>
            </div>
          ) : (
            <>TODO</>
          )
        }
      </div>
    </Card>
  );
};
