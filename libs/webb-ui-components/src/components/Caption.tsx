import { FC } from 'react';
import { Typography } from '../typography';

export type CaptionProps = {
  children: string | string[];
};

export const Caption: FC<CaptionProps> = ({ children }) => {
  return (
    <Typography variant="body2" className="pl-2 dark:text-mono-100">
      {children}
    </Typography>
  );
};
