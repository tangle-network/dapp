import { TokenIcon } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { getRoundedAmountString } from '../../utils';
import { ComponentProps, forwardRef } from 'react';

import { ListItem } from './ListItem';
import { AssetType } from './types';

export const AssetListItem = forwardRef<
  HTMLLIElement,
  AssetType & ComponentProps<typeof ListItem>
>(({ balance, name, symbol, ...props }, ref) => {
  return (
    <ListItem
      {...props}
      className="flex items-center justify-between"
      ref={ref}
    >
      <div className="flex items-center">
        <TokenIcon size="lg" name={symbol} className="mr-2" />

        <p>
          <Typography
            component="span"
            variant="body2"
            fw="bold"
            className="block uppercase"
          >
            {symbol}
          </Typography>

          <Typography
            component="span"
            variant="utility"
            className="block uppercase text-mono-100 dark:text-mono-80"
          >
            {name}
          </Typography>
        </p>
      </div>

      <Typography component="p" variant="body2" fw="bold">
        {getRoundedAmountString(balance ?? 0)}
      </Typography>
    </ListItem>
  );
});
