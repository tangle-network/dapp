import { Typography } from '@tangle-network/ui-components/typography/Typography';
import type { FC } from 'react';

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
