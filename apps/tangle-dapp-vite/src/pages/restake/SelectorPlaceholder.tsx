import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type { PropsWithChildren, ReactElement } from 'react';

type Props = {
  Icon: ReactElement;
};

const SelectorPlaceholder = ({ Icon, children }: PropsWithChildren<Props>) => {
  return (
    <Typography
      variant="h5"
      fw="bold"
      component="span"
      className="flex items-center truncate text-mono-200 dark:text-mono-40"
    >
      {Icon}
      {children}
    </Typography>
  );
};

export default SelectorPlaceholder;
