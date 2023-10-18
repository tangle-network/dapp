import { Search } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Input } from '../Input';
import { ScrollArea } from '../ScrollArea';
import TokenSelector from '../TokenSelector';
import TokenListItem from './TokenListItem';
import { ListCardWrapper } from './ListCardWrapper';
import { AssetType, TokenListCardProps } from './types';
import { Alert } from '../Alert';

export const TokenListCard = forwardRef<HTMLDivElement, TokenListCardProps>(
  (
    {
      onChange,
      onClose,
      popularTokens,
      selectTokens,
      title = 'Select a Token',
      type = 'token',
      unavailableTokens,
      value: selectedAsset,
      txnType,
      ...props
    },
    ref
  ) => {
    // Search text
    const [searchText, setSearchText] = useState('');

    const getFilterList = useCallback(
      (list: AssetType[]) =>
        list.filter(
          (r) =>
            r.name.toLowerCase().includes(searchText.toLowerCase()) ||
            r.symbol.toString().includes(searchText.toLowerCase()) ||
            r.assetBalanceProps?.balance
              ?.toString()
              .includes(searchText.toLowerCase())
        ),
      [searchText]
    );

    const { filteredPopular, filteredSelect } = useMemo(
      () => ({
        filteredPopular: getFilterList(popularTokens),
        filteredSelect: getFilterList(selectTokens),
        filteredUnavailable: getFilterList(unavailableTokens),
      }),
      [getFilterList, popularTokens, selectTokens, unavailableTokens]
    );

    return (
      <ListCardWrapper {...props} title={title} onClose={onClose} ref={ref}>
        {/** The search input */}
        <div className="px-2 py-4">
          <Input
            id="token"
            rightIcon={<Search />}
            placeholder="Search pool or enter token address"
            value={searchText}
            onChange={(val) => setSearchText(val.toString())}
          />
        </div>

        {/** Popular tokens */}
        {filteredPopular.length > 0 ? (
          <div className="flex flex-col p-2 space-y-2">
            <Typography variant="utility" className="uppercase mb-0.5">
              Popular {type}
            </Typography>

            <div className="flex flex-wrap gap-2">
              {filteredPopular.map((current, idx) => (
                <TokenSelector
                  key={`${current.name}-${idx}`}
                  onClick={() => onChange?.(current)}
                  isDropdown={false}
                >
                  {current.symbol}
                </TokenSelector>
              ))}
            </div>
          </div>
        ) : null}

        {/** Select tokens */}
        <div className="flex flex-col px-2 space-y-2 grow">
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
                    className="cursor-pointer"
                    {...current}
                    onClick={() => onChange?.(current)}
                  />
                ))}
              </ul>
            </ScrollArea>
          </div>

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
                      key={`${current.name}-${idx}`}
                      {...current}
                    />
                  ))}
                </ul>
              </ScrollArea>
            </div>
          ) : null}
        </div>

        {/* Alert Component */}
        {txnType === 'deposit' ? (
          <Alert title="The availability of shielded pools is determined by your selected source chain and token." />
        ) : (
          <Alert title="The availability of shielded pools is subject to the balance in your account." />
        )}
      </ListCardWrapper>
    );
  }
);
