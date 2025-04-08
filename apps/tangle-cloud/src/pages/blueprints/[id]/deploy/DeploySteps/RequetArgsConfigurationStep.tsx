import React, { FC } from 'react'
import { RequetArgsConfigurationStepProps } from './type';
import { Card, Typography } from '@tangle-network/ui-components';

export const RequetArgsConfigurationStep: FC<RequetArgsConfigurationStepProps> = ({
  errors,
  setValue,
  watch,
  blueprint,
}) => {
  return (
    <Card className="p-6">
       <Typography
            variant="h5"
            className="text-mono-200 dark:text-mono-0 mb-4"
          >
            Request Arguments
          </Typography>
          <hr className="border-mono-80 dark:border-mono-160 mb-6" />
    </Card>
  )
}
