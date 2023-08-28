import { ExternalLinkLine, Search } from '@webb-tools/icons';
import cx from 'classnames';
import { forwardRef, useMemo, useState } from 'react';
import { Typography } from '../../typography';
import { shortenString } from '../../utils';

import { Avatar } from '../Avatar';
import { Input } from '../Input';
import { RadioGroup, RadioItem } from '../Radio';
import { ScrollArea } from '../ScrollArea';
import { Button } from '../buttons';
import { ListCardWrapper } from './ListCardWrapper';
import { ListItem } from './ListItem';
import { RelayerListCardProps } from './types';
import { getFlexBasic } from '@webb-tools/icons/utils';

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
      Footer,
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
            r.name?.toLowerCase().includes(searchText.toLowerCase()) ||
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
        console.log('nextVal', nextVal);
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
            placeholder="Enter custom relayer URL here"
            value={searchText}
            onChange={(val) => setSearchText(val.toString())}
          />
        </div>

        <div className="flex flex-col p-2 space-y-2 grow">
          <Typography
            variant="body4"
            className="uppercase text-mono-200 dark:text-mono-0"
            fw="bold"
          >
            Available relayers ({filteredList.length})
          </Typography>

          <ScrollArea className={cx('h-full', disconnectClsx)}>
            <RadioGroup
              value={selectedRelayer?.address}
              onValueChange={handleValueChange}
            >
              <ul>
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
                        className="w-full overflow-hidden"
                        overrideRadixRadioItemProps={
                          typeof current.isDisabled === 'boolean'
                            ? { disabled: current.isDisabled }
                            : undefined
                        }
                      >
                        <label
                          className="flex items-center justify-between grow"
                          htmlFor={current.address}
                        >
                          <div className="flex items-center max-w-xs space-x-2 grow">
                            <Avatar
                              theme={current.theme}
                              value={current.address}
                              className={`${getFlexBasic()} shrink-0`}
                            />

                            <Typography
                              variant="h5"
                              fw="bold"
                              className="truncate"
                            >
                              {current.name ?? shortenString(current.address)}
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
        </div>

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

        {Footer}
      </ListCardWrapper>
    );
  }
);

export default RelayerListCard;
