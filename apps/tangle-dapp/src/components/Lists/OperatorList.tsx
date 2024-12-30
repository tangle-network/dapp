import type { OperatorMap } from '@webb-tools/tangle-shared-ui/types/restake';
import type { IdentityType } from '@webb-tools/tangle-shared-ui/utils/polkadot/identity';
import {
  assertSubstrateAddress,
  KeyValueWithButton,
  ListItem,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { keys, omitBy } from 'lodash';
import { ComponentProps, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import AvatarWithText from '../AvatarWithText';
import { ListCardWrapper } from './ListCardWrapper';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';

export type OperatorConfig = {
  accountId: SubstrateAddress;
  identityName?: string;
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
  // Only show active operators
  const activeOperator = useMemo(
    () => omitBy(operatorMapProp, (operator) => operator.status !== 'Active'),
    [operatorMapProp],
  );

  const isEmpty = Object.keys(activeOperator).length === 0;

  return (
    <ListCardWrapper title={title} onClose={onClose}>
      {!isEmpty && (
        <ScrollArea
          {...overrideScrollAreaProps}
          className={twMerge(
            'w-full h-full',
            overrideScrollAreaProps?.className,
          )}
        >
          <ul>
            {keys(activeOperator).map((operator, idx) => (
              <ListItem
                key={`${operator}-${idx}`}
                onClick={() =>
                  onSelectOperator({
                    accountId: assertSubstrateAddress(operator),
                    identityName:
                      operatorIdentities?.[operator]?.name || '<Unknown>',
                    status: activeOperator[operator].status.toString(),
                  })
                }
              >
                <AvatarWithText
                  accountAddress={operator}
                  overrideAvatarProps={{
                    size: 'lg',
                    className: 'basis-auto',
                  }}
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
      )}
    </ListCardWrapper>
  );
};
