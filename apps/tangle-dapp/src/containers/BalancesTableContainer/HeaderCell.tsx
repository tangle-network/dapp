import { Typography } from '@tangle-network/webb-ui-components';
import { FC } from 'react';

const HeaderCell: FC<{ title: string }> = ({ title }) => {
  return (
    <Typography
      variant="body1"
      className="block border-b dark:border-mono-140 px-3 pb-3 capitalize whitespace-nowrap text-mono-160 dark:text-mono-80"
    >
      {title}
    </Typography>
  );
};

export default HeaderCell;
