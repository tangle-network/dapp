import { TokenIcon } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { getRoundedAmountString } from '../../utils';
import cx from 'classnames';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '../Button';
import { ScrollArea } from '../ScrollArea';
import { AssetListItem } from './AssetListItem';
import { ListCardWrapper } from './ListCardWrapper';
import { ListItem } from './ListItem';
import { AssetType, WrapAssetListCardProps } from './types';

export const WrapAssetListCard = forwardRef<
  HTMLDivElement,
  WrapAssetListCardProps
>(
  (
    {
      assets,
      isDisconnected,
      onChange,
      onClose,
      onConnect,
      title = `Select Unwrapping Asset`,
      value: selectedAsset,
      ...props
    },
    ref
  ) => {
    const [, setRelayer] = useState<AssetType | undefined>(() => selectedAsset);

    useEffect(() => {
      let subscribe = true;

      if (subscribe) {
        setRelayer(selectedAsset);
      }

      return () => {
        subscribe = false;
      };
    }, [selectedAsset, setRelayer]);

    const onItemChange = useCallback(
      (nextItem: AssetType) => {
        setRelayer(nextItem);
        onChange?.(nextItem);
      },
      [onChange, setRelayer]
    );

    const disconnectClsx = useMemo(
      () => cx({ 'opacity-40 pointer-events-none': isDisconnected }),
      [isDisconnected]
    );

    return (
      <ListCardWrapper {...props} title={title} onClose={onClose} ref={ref}>
        {/** Token list */}
        <ScrollArea className={cx('min-w-[350px] h-[376px]', disconnectClsx)}>
          <ul className="p-2">
            {assets.map((current, idx) => {
              return (
                <AssetListItem key={`${current.name}-${idx}`} {...current} />
              );
            })}
          </ul>
        </ScrollArea>

        {/** Disconnect view */}
        <div
          className={cx(
            'flex flex-col items-center justify-center px-2 py-1 mt-9',
            !isDisconnected && 'hidden'
          )}
          hidden={!isDisconnected}
        >
          <Typography
            variant="utility"
            className="uppercase text-mono-100 dark:text-mono-80  max-w-[334px]"
            ta="center"
          >
            Don't see your asset?
          </Typography>

          <Button
            variant="link"
            size="sm"
            className="mt-1 text-center"
            onClick={onConnect}
          >
            Try another account or wallet
          </Button>
        </div>
      </ListCardWrapper>
    );
  }
);
