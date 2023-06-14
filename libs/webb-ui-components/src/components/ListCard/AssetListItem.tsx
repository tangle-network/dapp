import { TokenIcon } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { getRoundedAmountString } from '../../utils';
import { ComponentProps, forwardRef, useMemo, useRef, useState } from 'react';
import { ListItem } from './ListItem';
import { AssetType } from './types';
import { Button } from '../Button';

export const AssetListItem = forwardRef<
  HTMLLIElement,
  AssetType & ComponentProps<typeof ListItem>
>(
  (
    { balance, name, symbol, onTokenClick, isTokenAddedToMetamask, ...props },
    ref
  ) => {
    const onTokenClickRef = useRef(onTokenClick);

    const [isHovered, setIsHovered] = useState(false);

    const handleTokenIconClick = useMemo(() => {
      if (typeof onTokenClick === 'function') {
        return (event: any) => {
          event.stopPropagation();
          onTokenClickRef.current?.(symbol);
        };
      }
    }, [onTokenClick, symbol]);

    return (
      <ListItem
        {...props}
        className="flex items-center justify-between"
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
              variant="h5"
              fw="bold"
              className="block capitalize cursor-default"
            >
              {symbol}
            </Typography>

            <Typography
              component="span"
              variant="body1"
              fw="bold"
              className="block capitalize cursor-default text-mono-100 dark:text-mono-80"
            >
              {name}
            </Typography>
          </p>
        </div>

        {isTokenAddedToMetamask ? (
          <Typography className="cursor-default" variant="h5" fw="bold">
            {getRoundedAmountString(balance ?? 0)}
          </Typography>
        ) : isHovered ? (
          <Button
            variant="link"
            onClick={handleTokenIconClick}
            className="uppercase text-[12px]"
          >
            Add to Wallet
          </Button>
        ) : (
          <Typography className="cursor-default" variant="h5" fw="bold">
            --
          </Typography>
        )}
      </ListItem>
    );
  }
);
