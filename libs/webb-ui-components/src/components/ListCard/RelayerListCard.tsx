import { ExternalLinkLine, Search } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { shortenString } from '../../utils';
import { getRoundedAmountString } from '../../utils';
import cx from 'classnames';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';

import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Input } from '../Input';
import { ScrollArea } from '../ScrollArea';
import { ListCardWrapper } from './ListCardWrapper';
import { ListItem } from './ListItem';
import { RelayerListCardProps, RelayerType } from './types';

export const RelayerListCard = forwardRef<HTMLDivElement, RelayerListCardProps>(
  (
    {
      isDisconnected,
      onChange,
      onClose,
      onConnectWallet,
      relayers,
      value: selectedRelayer,
      ...props
    },
    ref
  ) => {
    const [, setRelayer] = useState<RelayerType | undefined>(
      () => selectedRelayer
    );

    // Search text
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
      let subscribe = true;

      if (subscribe) {
        setRelayer(selectedRelayer);
      }

      return () => {
        subscribe = false;
      };
    }, [selectedRelayer, setRelayer]);

    const onItemChange = useCallback(
      (nextItem: RelayerType) => {
        setRelayer(nextItem);
        onChange?.(nextItem);
      },
      [onChange, setRelayer]
    );

    const filteredList = useMemo(
      () =>
        relayers.filter(
          (r) =>
            r.address.toLowerCase().includes(searchText.toLowerCase()) ||
            r.fee?.toString().includes(searchText.toLowerCase()) ||
            r.percentage?.toString().includes(searchText.toLowerCase())
        ),
      [relayers, searchText]
    );

    const disconnectClsx = useMemo(
      () => cx({ 'opacity-40 pointer-events-none': isDisconnected }),
      [isDisconnected]
    );

    return (
      <ListCardWrapper
        {...props}
        title="Select a Relayer"
        onClose={onClose}
        ref={ref}
      >
        {/** The search input */}
        <div className={cx('px-2 py-4', disconnectClsx)}>
          <Input
            id="relayer"
            rightIcon={<Search />}
            placeholder="Search relayers"
            value={searchText}
            onChange={(val) => setSearchText(val.toString())}
          />
        </div>

        {/** Token list */}
        <ScrollArea className={cx('min-w-[350px] h-[376px]', disconnectClsx)}>
          <ul className="p-2">
            {filteredList.map((current, idx) => {
              return (
                <ListItem
                  key={`${current.address}-${idx}`}
                  className="flex items-center justify-between"
                  onClick={() => onItemChange(current)}
                >
                  <div className="flex items-center space-x-2">
                    <Avatar theme={current.theme} value={current.address} />

                    <Typography variant="body1" fw="bold">
                      {shortenString(current.address)}
                    </Typography>

                    <a
                      href={current.externalUrl}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      <ExternalLinkLine />
                    </a>
                  </div>

                  <div className="flex items-center space-x-2">
                    {current.fee && (
                      <Typography
                        variant="utility"
                        className="uppercase text-mono-100 dark:text-mono-80"
                      >
                        Fee:{' '}
                        {getRoundedAmountString(
                          parseFloat(current.fee.toString())
                        )}
                      </Typography>
                    )}

                    {current.percentage && (
                      <Typography
                        variant="utility"
                        className="uppercase text-mono-140 dark:text-mono-0"
                      >
                        {current.percentage.toFixed(2)} %
                      </Typography>
                    )}
                  </div>
                </ListItem>
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
            Some relayers are not available for all chains and assets
          </Typography>

          <Button
            variant="link"
            size="sm"
            className="mt-1 text-center"
            onClick={onConnectWallet}
          >
            To choose a relayer please Connect a wallet
          </Button>
        </div>
      </ListCardWrapper>
    );
  }
);
