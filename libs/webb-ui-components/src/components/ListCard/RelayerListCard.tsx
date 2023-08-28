import { ExternalLinkLine, Search } from '@webb-tools/icons';
import cx from 'classnames';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Typography } from '../../typography';
import { shortenString } from '../../utils';

import { Avatar } from '../Avatar';
import { Button } from '../buttons';
import { Input } from '../Input';
import { ScrollArea } from '../ScrollArea';
import { ListCardWrapper } from './ListCardWrapper';
import { ListItem } from './ListItem';
import { RelayerListCardProps, RelayerType } from './types';
import { RadioGroup, RadioItem } from '../Radio';

/**
 * The relayer list card component
 *
 * Props:
 *
 * - `isDisconnected`: If the user is disconnected
 * - `onChange`: The callback when the relayer is changed
 * - `onClose`: The callback when the card is closed
 * - `onConnectWallet`: The callback when the user clicks on the connect wallet button
 * - `relayers`: The list of relayers
 * - `value`: The selected relayer
 */
const RelayerListCard = forwardRef<HTMLDivElement, RelayerListCardProps>(
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
    // Search text
    const [searchText, setSearchText] = useState('');

    const filteredList = useMemo(
      () =>
        relayers.filter(
          (r) =>
            r.address.toLowerCase().includes(searchText.toLowerCase()) ||
            r.percentage?.toString().includes(searchText.toLowerCase())
        ),
      [relayers, searchText]
    );

    const disconnectClsx = useMemo(
      () => cx({ 'opacity-40 pointer-events-none': isDisconnected }),
      [isDisconnected]
    );

    const handleValueChange = useMemo(() => {
      if (typeof onChange !== 'function') {
        return undefined;
      }

      return (nextVal: string) => {
        const nextRelayer = relayers.find((r) => r.address === nextVal);

        if (nextRelayer) {
          onChange(nextRelayer);
        }
      };
    }, [onChange, relayers]);

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
        <ScrollArea className={cx('h-full', disconnectClsx)}>
          <RadioGroup
            value={selectedRelayer?.address}
            onValueChange={handleValueChange}
          >
            <ul className="p-2">
              {filteredList.map((current, idx) => {
                return (
                  <ListItem
                    key={`${current.address}-${idx}`}
                    className="flex items-center justify-between"
                    isDisabled={current.isDisabled}
                  >
                    <RadioItem
                      id={current.address}
                      value={current.address}
                      className="w-full"
                      overrideRadixRadioItemProps={
                        typeof current.isDisabled === 'boolean'
                          ? { disabled: current.isDisabled }
                          : undefined
                      }
                    >
                      <label
                        className="flex items-center justify-between w-full"
                        htmlFor={current.address}
                      >
                        <div className="flex items-center space-x-2">
                          <Avatar
                            theme={current.theme}
                            value={current.address}
                          />

                          <Typography variant="h5" fw="bold">
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

                        {typeof current.percentage === 'number' && (
                          <Typography
                            component="p"
                            variant="body1"
                            fw="bold"
                            className="min-w-[100px] text-mono-100 dark:text-mono-80"
                          >
                            Fee{' '}
                            <span className="text-mono-140 dark:text-mono-0 ">
                              {current.percentage.toFixed(2)} %
                            </span>
                          </Typography>
                        )}
                      </label>
                    </RadioItem>
                  </ListItem>
                );
              })}
            </ul>
          </RadioGroup>
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

export default RelayerListCard;
