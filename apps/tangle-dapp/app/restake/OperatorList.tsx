'use client';

import { Cross1Icon } from '@radix-ui/react-icons';
import { Search } from '@webb-tools/icons/Search';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Input } from '@webb-tools/webb-ui-components/components/Input';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import { ListCardWrapper } from '@webb-tools/webb-ui-components/components/ListCard/ListCardWrapper';
import { ListItem } from '@webb-tools/webb-ui-components/components/ListCard/ListItem';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import isFunction from 'lodash/isFunction';
import keys from 'lodash/keys';
import omitBy from 'lodash/omitBy';
import pick from 'lodash/pick';
import { type ComponentProps, forwardRef, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import type { OperatorMap } from '../../types/restake';
import type { IdentityType } from '../../utils/polkadot';
import AvatarWithText from './AvatarWithText';

type Props = Partial<ComponentProps<typeof ListCardWrapper>> & {
  operatorMap: OperatorMap;
  operatorIdentities?: Record<string, IdentityType | null> | null;
  selectedOperatorAccountId: string;
  onOperatorAccountIdChange?: (accountId: string) => void;
  onResetSelection?: () => void;
};

const OperatorList = forwardRef<HTMLDivElement, Props>(
  (
    {
      onClose,
      overrideTitleProps,
      operatorMap: operatorMapProp,
      operatorIdentities,
      selectedOperatorAccountId,
      onOperatorAccountIdChange,
      onResetSelection,
      ...props
    },
    ref,
  ) => {
    const [searchText, setSearchText] = useState('');

    // Only show active operators
    const activeOperator = useMemo(
      () => omitBy(operatorMapProp, (operator) => operator.status !== 'Active'),
      [operatorMapProp],
    );

    const isEmpty = Object.keys(activeOperator).length === 0;

    const filteredOperator = useMemo(() => {
      if (searchText === '') return activeOperator;

      const pickedOperators = keys(activeOperator).filter((operator) => {
        const identity = operatorIdentities?.[operator]?.name;
        if (!identity) return operator.includes(searchText);

        return (
          identity.toLowerCase().includes(searchText.toLowerCase()) ||
          operator.includes(searchText)
        );
      });

      return pick(activeOperator, pickedOperators);
    }, [activeOperator, operatorIdentities, searchText]);

    return (
      <ListCardWrapper
        {...props}
        title="Select Operator"
        onClose={onClose}
        ref={ref}
      >
        {!isEmpty && (
          <>
            <div className="py-4">
              <Input
                id="token"
                rightIcon={<Search />}
                placeholder="Search Operator"
                isControlled
                value={searchText}
                onChange={(val) => setSearchText(val.toString())}
              />
            </div>

            <ScrollArea className={twMerge('h-full py-2')}>
              <ul>
                {keys(filteredOperator).map((current) => (
                  <ListItem
                    key={current}
                    className="px-4 cursor-pointer max-w-none dark:bg-transparent"
                    onClick={() => onOperatorAccountIdChange?.(current)}
                  >
                    <AvatarWithText
                      accountAddress={current}
                      overrideAvatarProps={{ size: 'lg' }}
                      overrideTypographyProps={{ variant: 'h5' }}
                      identityName={
                        operatorIdentities?.[current]?.name || '<Unknown>'
                      }
                      description={
                        <KeyValueWithButton
                          size="sm"
                          keyValue={current}
                          shortenFn={shortenString}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </ul>
            </ScrollArea>

            {isFunction(onResetSelection) && (
              <Button
                isDisabled={!selectedOperatorAccountId}
                className="mt-auto"
                leftIcon={<Cross1Icon />}
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
              You can comeback later or add apply to become a operator.
            </Typography>
          </div>
        )}
      </ListCardWrapper>
    );
  },
);

OperatorList.displayName = 'OperatorList';

export default OperatorList;
