import React from 'react';
import { TangleLogo } from '../TangleLogo';
import { TangleLogoProps } from '../TangleLogo/types';
import { Typography } from '../../typography/Typography/Typography';

export type TangleCloudLogoProps = TangleLogoProps;

export const TangleCloudLogo: React.FC<TangleCloudLogoProps> = (props) => {
  return (
    <div className="flex items-end gap-0.5">
      <TangleLogo {...props} />

      <Typography
        variant="body4"
        component="span"
        className="bg-transparent border px-2 py-0.5 rounded-full !text-purple-40 border-purple-50"
      >
        Cloud
      </Typography>
    </div>
  );
};
