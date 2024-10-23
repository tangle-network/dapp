'use client';

import { Search } from '@webb-tools/icons';
import {
  Input,
  KeyValueWithButton,
  ListItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { keys, omitBy, pick } from 'lodash';
import { ComponentProps, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import type { OperatorMap } from '../../types/restake';
import type { IdentityType } from '../../utils/polkadot';
import AvatarWithText from '../AvatarWithText';
import { ListCardWrapper } from './ListCardWrapper';

export type OperatorConfig = {
  accountId: string;
  name: string;
  status: string;
};

type OperatorListProps = {
  title?: string;
  onClose: () => void;
  operators: OperatorConfig[];
  operatorMap?: OperatorMap | null;
  operatorIdentities?: Record<string, IdentityType | null> | null;
  onSelectOperator: (operator: OperatorConfig) => void;
  overrideScrollAreaProps?: ComponentProps<typeof ScrollArea>;
};

export const OperatorList = ({
  onClose,
  title = 'Select Operator',
  overrideScrollAreaProps,
  onSelectOperator,
  operatorMap: operatorMapProp = {},
  operatorIdentities,
}: OperatorListProps) => {
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
    <ListCardWrapper title={title} onClose={onClose}>
      {!isEmpty && (
        <>
          <div className="px-4 md:px-9 pb-[10px] border-b border-mono-40 dark:border-mono-170">
            <Input
              id="operator"
              rightIcon={<Search />}
              placeholder="Search operators"
              value={searchText}
              onChange={(val) => setSearchText(val.toString())}
              inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120"
            />
          </div>

          <ScrollArea
            {...overrideScrollAreaProps}
            className={twMerge(
              'w-full h-full',
              overrideScrollAreaProps?.className,
            )}
          >
            <ul>
              {keys(filteredOperator).map((operator, idx) => (
                <ListItem
                  key={`${operator}-${idx}`}
                  onClick={() =>
                    onSelectOperator({
                      accountId: operator,
                      name: operatorIdentities?.[operator]?.name || '<Unknown>',
                      status: filteredOperator[operator].status.toString(),
                    })
                  }
                  className="cursor-pointer w-full flex items-center gap-4 justify-between max-w-full min-h-[60px] py-[12px]"
                >
                  <AvatarWithText
                    accountAddress={operator}
                    overrideAvatarProps={{ size: 'lg' }}
                    overrideTypographyProps={{ variant: 'h5' }}
                    identityName={
                      operatorIdentities?.[operator]?.name || '<Unknown>'
                    }
                    description={
                      <KeyValueWithButton size="sm" keyValue={operator} />
                    }
                  />
                </ListItem>
              ))}
            </ul>
          </ScrollArea>
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
};
