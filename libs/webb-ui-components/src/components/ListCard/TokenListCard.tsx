'use client';

import { Search } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Input } from '../Input';
import { ScrollArea } from '../ScrollArea';
import TokenListItem from './TokenListItem';
import { ListCardWrapper } from './ListCardWrapper';
import { AssetType, TokenListCardProps } from './types';
import { Alert } from '../Alert';
import { ListStatus } from '../ListStatus';

export const TokenListCard = forwardRef<HTMLDivElement, TokenListCardProps>(
  (
    {
      onChange,
      onClose,
      selectTokens,
      title = 'Select a Token',
      type = 'token',
      unavailableTokens,
      value: selectedAsset,
      overrideInputProps,
      renderEmpty,
      descriptionWhenEmpty,
      alertTitle,
      ...props
    },
    ref,
  ) => {
    const [searchQuery, setSearchQuery] = useState('');

    const isEmpty = !selectTokens.length && !unavailableTokens.length;

    const getFilterList = useCallback(
      (list: AssetType[]) =>
        list.filter(
          (r) =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.symbol.toString().includes(searchQuery.toLowerCase()) ||
            r.assetBalanceProps?.balance
              ?.toString()
              .includes(searchQuery.toLowerCase()),
        ),
      [searchQuery],
    );

    const { filteredSelect } = useMemo(
      () => ({
        filteredSelect: getFilterList(selectTokens),
        filteredUnavailable: getFilterList(unavailableTokens),
      }),
      [getFilterList, selectTokens, unavailableTokens],
    );

    return (
      <ListCardWrapper {...props} title={title} onClose={onClose} ref={ref}>
        {/** Search input */}
        {!isEmpty && (
          <div className="py-4">
            <Input
              id="token"
              rightIcon={<Search />}
              placeholder="Search pool or enter token address"
              value={searchQuery}
              onChange={(val) => setSearchQuery(val.toString())}
              {...overrideInputProps}
            />
          </div>
        )}

        {/** Select tokens */}
        <div className="flex flex-col px-2 space-y-2 grow">
          {filteredSelect.length > 0 && (
            <div>
              <Typography
                variant="body4"
                className="uppercase text-mono-200 dark:text-mono-0"
                fw="bold"
              >
                Select {type}
              </Typography>

              {/** Token list */}
              <ScrollArea className="h-full py-2">
                <ul>
                  {filteredSelect.map((current, idx) => (
                    <TokenListItem
                      key={`${current.name}-${idx}`}
                      className="px-4 bg-transparent cursor-pointer dark:bg-transparent max-w-none"
                      {...current}
                      onClick={() => onChange?.(current)}
                    />
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}

          {unavailableTokens.length ? (
            <div>
              <Typography
                variant="body4"
                className="uppercase text-mono-200 dark:text-mono-0"
                fw="bold"
              >
                Unavailable {type}
              </Typography>

              {/** Token list */}
              <ScrollArea className="h-full py-2">
                <ul>
                  {unavailableTokens.map((current, idx) => (
                    <TokenListItem
                      isDisabled
                      className="px-4 bg-transparent dark:bg-transparent max-w-none"
                      key={`${current.name}-${idx}`}
                      {...current}
                    />
                  ))}
                </ul>
              </ScrollArea>
            </div>
          ) : null}

          {filteredSelect.length === 0 && (
            <div className="flex items-center justify-center h-full">
              {typeof renderEmpty === 'function' ? (
                renderEmpty()
              ) : (
                <ListStatus
                  title={`No ${type[0].toUpperCase()}${type.substring(1)}s Found`}
                  description={descriptionWhenEmpty}
                />
              )}
            </div>
          )}
        </div>

        {/* Alert Component */}
        {alertTitle && <Alert title={alertTitle} />}
      </ListCardWrapper>
    );
  },
);
