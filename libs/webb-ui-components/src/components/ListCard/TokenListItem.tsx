import { TokenIcon } from '@webb-tools/icons';
import React, { ComponentProps, forwardRef, useMemo, useRef } from 'react';
import { Typography } from '../../typography';
import { getRoundedAmountString } from '../../utils';
import { IconWithTooltip } from '../IconWithTooltip';
import { Button } from '../buttons';
import { ListItem } from './ListItem';
import { AssetType } from './types';
import Badge from '../Badge';

const Balance = ({
  balance,
  balanceInUsd,
  subContent,
}: {
  balance: number;
  balanceInUsd?: number;
  subContent?: string;
}) => {
  <div>
    <Typography ta="right" variant="h5" fw="bold">
      {getRoundedAmountString(balance)}
    </Typography>

    {typeof balanceInUsd === 'number' ? (
      <Typography
        ta="right"
        variant="body3"
        fw="semibold"
        className="!text-mono-100"
      >
        ${getRoundedAmountString(balanceInUsd)}
      </Typography>
    ) : typeof subContent === 'string' ? (
      <Typography
        ta="right"
        variant="body3"
        fw="semibold"
        className="!text-mono-100"
      >
        {subContent}
      </Typography>
    ) : null}
  </div>;
};

const AddToWalletButton = ({ onClick }: { onClick: () => void }) => (
  <>
    <Button
      variant="link"
      onClick={onClick}
      size="sm"
      className="hidden group-hover:block"
    >
      Add to Wallet
    </Button>
    <Typography
      className="block cursor-default group-hover:hidden"
      variant="h5"
      fw="bold"
    >
      --
    </Typography>
  </>
);

const BadgeInfo = ({
  variant,
  children,
}: {
  variant: 'info' | 'warning';
  children: React.ReactNode;
}) => {
  let color: ComponentProps<typeof Badge>['color'] = 'blue';

  switch (variant) {
    case 'warning': {
      color = 'yellow';
      break;
    }

    default: {
      color = 'blue';
      break;
    }
  }

  return <IconWithTooltip icon={<Badge color={color} />} content={children} />;
};

const TokenListItem_ = forwardRef<
  HTMLLIElement,
  AssetType & ComponentProps<typeof ListItem>
>(
  (
    { balance, name, symbol, isTokenAddedToMetamask, onClick, ...props },
    ref
  ) => {
    const onTokenClickRef = useRef(onClick);

    const handleTokenIconClick = useMemo(() => {
      if (typeof onTokenClickRef.current === 'function') {
        return (event: React.MouseEvent) => {
          event.stopPropagation();
          onTokenClickRef.current?.(event as React.MouseEvent<HTMLLIElement>);
        };
      }
    }, []);

    return (
      <ListItem {...props} ref={ref}>
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
        ) : (
          <>
            <Button
              variant="link"
              onClick={handleTokenIconClick}
              size="sm"
              className="hidden group-hover:block"
            >
              Add to Wallet
            </Button>
            <Typography
              className="block cursor-default group-hover:hidden"
              variant="h5"
              fw="bold"
            >
              --
            </Typography>
          </>
        )}
      </ListItem>
    );
  }
);

interface ITokenListItem
  extends React.ForwardRefExoticComponent<
    AssetType &
      ComponentProps<typeof ListItem> &
      React.RefAttributes<HTMLLIElement>
  > {
  Balance: typeof Balance;
  AddToWalletButton: typeof AddToWalletButton;
  BadgeInfo: typeof BadgeInfo;
}

const TokenListItem = {
  ...TokenListItem_,
  Balance,
  AddToWalletButton,
  BadgeInfo,
} as ITokenListItem;

export default TokenListItem;
