import { TokenIcon } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { getRoundedAmountString } from '../../utils';
import { ComponentProps, MouseEvent, forwardRef, useMemo, useRef } from 'react';

import { ListItem } from './ListItem';
import { AssetType } from './types';

export const AssetListItem = forwardRef<
  HTMLLIElement,
  AssetType & ComponentProps<typeof ListItem>
>(({ balance, name, symbol, onTokenClick, ...props }, ref) => {
  const onTokenClickRef = useRef(onTokenClick);

  const handleTokenIconClick = useMemo(() => {
    if (typeof onTokenClick === 'function') {
      return (event: MouseEvent<SVGSVGElement>) => {
        event.stopPropagation();
        onTokenClickRef.current?.(symbol);
      };
    }
  }, []);

  return (
    <ListItem
      {...props}
      className="flex items-center justify-between"
      ref={ref}
    >
      <div className="flex items-center">
        <TokenIcon
          onClick={handleTokenIconClick}
          size="lg"
          name={symbol}
          className="mr-2"
        />

        <p>
          <Typography
            component="span"
            variant="body2"
            fw="bold"
            className="block cursor-default [text-transform:none]"
          >
            {symbol}
          </Typography>

          <Typography
            component="span"
            variant="utility"
            className="block cursor-default text-mono-100 dark:text-mono-80 [text-transform:none]"
          >
            {name}
          </Typography>
        </p>
      </div>

      <Typography
        className="cursor-default"
        component="p"
        variant="body2"
        fw="bold"
      >
        {getRoundedAmountString(balance ?? 0)}
      </Typography>
    </ListItem>
  );
});
