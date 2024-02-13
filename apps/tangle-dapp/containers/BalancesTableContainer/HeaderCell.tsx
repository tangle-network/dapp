import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

const HeaderCell: FC<{ title: string }> = ({ title }) => {
  return (
    <Typography
      variant="body1"
      fw="semibold"
      className="block border-b dark:border-mono-140 px-3 pb-3 capitalize whitespace-nowrap"
    >
      {title}
    </Typography>
  );
};

export default HeaderCell;
