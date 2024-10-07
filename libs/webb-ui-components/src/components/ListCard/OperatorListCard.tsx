'use client';

import { Search } from '@webb-tools/icons';
import { forwardRef, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography';
import { Input } from '../Input';
import { ScrollArea } from '../ScrollArea';
import { Button } from '../buttons';
import { ListCardWrapper } from './ListCardWrapper';
import { ListItem } from './ListItem';
import { OperatorListCardProps } from './types';
import { KeyValueWithButton } from '../KeyValueWithButton';
import AvatarWithText from '../AvatarWithText';

export const OperatorListCard = forwardRef<
  HTMLDivElement,
  OperatorListCardProps
>(
  (
    {
      onChange,
      onClose,
      operators,
      title = 'Select Operator',
      overrideInputProps,
      overrideScrollAreaProps,
      selectedOperatorAccountId,
      onResetSelection,
      ...props
    },
    ref,
  ) => {
    const [searchText, setSearchText] = useState('');

    const filteredOperators = useMemo(
      () =>
        operators.filter(
          (operator) =>
            operator.accountId.includes(searchText) ||
            operator.identityName
              .toLowerCase()
              .includes(searchText.toLowerCase()),
        ),
      [operators, searchText],
    );

    const isEmpty = operators.length === 0;

    return (
      <ListCardWrapper {...props} title={title} onClose={onClose} ref={ref}>
        {!isEmpty && (
          <>
            <div className="py-4">
              <Input
                id="operator-search"
                rightIcon={<Search />}
                placeholder="Search Operator"
                value={searchText}
                onChange={(val) => setSearchText(val.toString())}
                {...overrideInputProps}
              />
            </div>

            <ScrollArea
              {...overrideScrollAreaProps}
              className={twMerge(
                'h-full py-2',
                overrideScrollAreaProps?.className,
              )}
            >
              <ul>
                {filteredOperators.map((operator) => (
                  <ListItem
                    key={operator.accountId}
                    className="px-4 cursor-pointer max-w-none dark:bg-transparent"
                    onClick={() => onChange?.(operator)}
                  >
                    <AvatarWithText
                      accountAddress={operator.accountId}
                      overrideAvatarProps={{ size: 'lg' }}
                      overrideTypographyProps={{ variant: 'h5' }}
                      identityName={operator.identityName || '<Unknown>'}
                      description={
                        <KeyValueWithButton
                          size="sm"
                          keyValue={operator.accountId}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </ul>
            </ScrollArea>

            {onResetSelection && (
              <Button
                isDisabled={!selectedOperatorAccountId}
                className="mt-auto"
                isFullWidth
                onClick={onResetSelection}
              >
                Clear Selection
              </Button>
            )}
          </>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center space-y-4 grow">
            <Typography variant="h5" fw="bold" ta="center">
              No Operator Found.
            </Typography>

            <Typography
              variant="body1"
              fw="semibold"
              className="max-w-xs mt-1 text-mono-100 dark:text-mono-80"
              ta="center"
            >
              You can come back later or apply to become an operator.
            </Typography>
          </div>
        )}
      </ListCardWrapper>
    );
  },
);

OperatorListCard.displayName = 'OperatorListCard';

export default OperatorListCard;
