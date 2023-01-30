import { Button, Typography } from '@webb-tools/webb-ui-components';
import React, { FC } from 'react';
import { EmptyTableProps } from './types';

export const EmptyTable: FC<EmptyTableProps> = ({
  buttonText,
  description,
  onClick,
  title,
}) => {
  return (
    <div className="h-[300px] bg-mono-0 dark:bg-mono-160 rounded-lg flex items-center justify-center">
      <div>
        <Typography variant="h5" ta="center" fw="bold" className='mb-2'>
          {title}
        </Typography>

        <Typography variant="body2" fw="semibold" className="!text-mono-100 px-[180px] text-center">
          {description}
          <Button
            onClick={onClick}
            className="inline-block ml-1"
            variant="link"
            size="sm"
          >
            {buttonText}
          </Button>
        </Typography>
      </div>
    </div>
  );
};
