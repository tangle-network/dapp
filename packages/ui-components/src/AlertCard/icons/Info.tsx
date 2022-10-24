import React from 'react';

import { ErrorIcon } from './Error';

export const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return <ErrorIcon {...props} color='rgb(41, 182, 246)' />;
};
