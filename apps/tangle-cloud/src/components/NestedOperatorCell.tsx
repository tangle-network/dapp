import { DropdownBody } from '@tangle-network/ui-components/components/Dropdown/DropdownBody';
import {
  Avatar,
  Dropdown,
  DropdownButton,
  DropdownMenuItem,
  EMPTY_VALUE_PLACEHOLDER,
  KeyValueWithButton,
  shortenString,
  Typography,
} from '@tangle-network/ui-components';
import { Children, FC } from 'react';
import { Address } from 'viem';

type OperatorMetadata = {
  name?: string;
};

type NestedOperatorCellProps = {
  operators?: Address[];
  operatorMetadataMap?: Map<Address, OperatorMetadata | null>;
};

export const NestedOperatorCell: FC<NestedOperatorCellProps> = ({
  operators,
  operatorMetadataMap,
}) => {
  if (!operators || !Array.isArray(operators) || operators.length === 0) {
    return EMPTY_VALUE_PLACEHOLDER;
  }

  return (
    <Dropdown>
      <DropdownButton
        isHideArrowIcon={operators.length <= 1}
        className="min-w-[auto] border-none !bg-transparent pl-0 w-full"
      >
        <div className="flex items-center gap-2">
          {Children.toArray(
            operators
              .slice(0, 3)
              .map((operator) => (
                <Avatar
                  sourceVariant="address"
                  value={operator}
                  theme="ethereum"
                  size="md"
                />
              )),
          )}
        </div>
      </DropdownButton>
      <DropdownBody className="mt-2" side="bottom" align="center">
        {operators.length > 1 &&
          Children.toArray(
            operators.map((operator) => {
              return (
                <DropdownMenuItem className="px-4 py-2 hover:bg-mono-170">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Avatar
                          sourceVariant="address"
                          value={operator}
                          theme="ethereum"
                          size="md"
                        />
                        <Typography variant="body3" fw="bold">
                          {shortenString(
                            operatorMetadataMap?.get(operator)?.name ||
                              operator,
                          )}
                        </Typography>
                      </div>
                      <KeyValueWithButton size="sm" keyValue={operator} />
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            }),
          )}
      </DropdownBody>
    </Dropdown>
  );
};
