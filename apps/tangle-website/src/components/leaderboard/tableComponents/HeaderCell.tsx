import { FC } from 'react';
import { Typography } from '@webb-tools/webb-ui-components';

export const HeaderCell: FC<{ title: string; className?: string }> = ({
  title,
  className,
}) => {
  return (
    <Typography variant="mkt-small-caps" fw="bold" className={className}>
      {title}
    </Typography>
  );
};
