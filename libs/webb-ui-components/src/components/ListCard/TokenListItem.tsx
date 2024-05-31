'use client';

import {
  AlertFill,
  ExternalLinkLine,
  RefreshLineIcon,
  ShieldedAssetIcon,
  TokenIcon,
} from '@webb-tools/icons';
import React, { ComponentProps, forwardRef, useMemo, useRef } from 'react';
import { PropsOf } from '../../types';
import { Typography } from '../../typography';
import { getRoundedAmountString } from '../../utils';
import Badge from '../Badge';
import { IconWithTooltip } from '../IconWithTooltip';
import SkeletonLoader from '../SkeletonLoader';
import { Button } from '../buttons';
import { ListItem } from './ListItem';
import { AssetBadgeInfoType, AssetBalanceType, AssetType } from './types';

const Balance = ({ balance, balanceInUsd, subContent }: AssetBalanceType) => {
  return (
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
    </div>
  );
};

const AddToWalletButton = ({
  onClick,
}: {
  onClick: NonNullable<PropsOf<'button'>['onClick']>;
}) => (
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

const BadgeInfo = ({ variant, children }: AssetBadgeInfoType) => {
  let color: ComponentProps<typeof Badge>['color'] = 'blue';
  let badgeIcon: ComponentProps<typeof Badge>['icon'];

  switch (variant) {
    case 'warning': {
      color = 'yellow';
      badgeIcon = <AlertFill />;
      break;
    }

    default: {
      color = 'blue';
      badgeIcon = <RefreshLineIcon />;
      break;
    }
  }

  return (
    <IconWithTooltip
      icon={<Badge icon={badgeIcon} color={color} />}
      content={children}
    />
  );
};

/**
 * TokenListItem component
 *
 * Props:
 * - name: the name of the token
 * - symbol: the symbol of the token
 * - balance: the balance of the token
 * - onAddToken: callback when user hit the add token button
 *
 * @example
 * ```tsx
 * <TokenListItem name="Ethereum" symbol="ETH" />
 * ```
 */
const TokenListItem = forwardRef<
  HTMLLIElement,
  AssetType & ComponentProps<typeof ListItem>
>(
  (
    {
      assetBadgeProps,
      assetBalanceProps,
      chainName,
      explorerUrl,
      isDisabled,
      name,
      onAddToken,
      symbol,
      tokenType = 'unshielded',
      isLoadingMetadata,
      ...props
    },
    ref,
  ) => {
    const onAddTokenRef = useRef(onAddToken);

    const handleTokenIconClick = useMemo(() => {
      if (typeof onAddTokenRef.current === 'function') {
        return (event: React.MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          onAddTokenRef.current?.(event);
        };
      }
    }, []);

    return (
      <ListItem {...props} isDisabled={isDisabled} ref={ref}>
        <div className="flex items-center">
          {tokenType === 'unshielded' ? (
            <TokenIcon size="lg" name={symbol} className="mr-2" />
          ) : (
            <ShieldedAssetIcon
              chainName={chainName}
              size="lg"
              className="mr-2"
            />
          )}

          <p>
            <Typography
              component="span"
              variant="h5"
              fw="bold"
              className="block cursor-default"
            >
              {symbol}
            </Typography>

            <Typography
              component="span"
              variant="body1"
              fw="bold"
              className="cursor-default text-mono-100 dark:text-mono-80"
            >
              {name}{' '}
              {typeof explorerUrl === 'string' && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="!text-inherit"
                  onClick={(event) => event.stopPropagation()}
                >
                  <ExternalLinkLine className="inline-block !fill-current" />
                </a>
              )}
            </Typography>
          </p>
        </div>

        {typeof handleTokenIconClick === 'function' && !isDisabled ? (
          <AddToWalletButton onClick={handleTokenIconClick} />
        ) : isLoadingMetadata ? (
          <SkeletonLoader size="lg" className="w-14" />
        ) : typeof assetBalanceProps === 'object' ? (
          <Balance {...assetBalanceProps} />
        ) : typeof assetBadgeProps === 'object' ? (
          <BadgeInfo {...assetBadgeProps} />
        ) : null}
      </ListItem>
    );
  },
);

export default TokenListItem;
