import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Text,
} from './sandbox/SandboxUi';
import { Children, FC } from 'react';
import { Address } from 'viem';

const EMPTY_VALUE_PLACEHOLDER = '-';

type OperatorMetadata = {
  name?: string;
};

type NestedOperatorCellProps = {
  operators?: Address[];
  operatorMetadataMap?: Map<Address, OperatorMetadata | null>;
};

const shortenString = (value: string, chars = 6) =>
  value.length <= chars * 2 + 3
    ? value
    : `${value.slice(0, chars)}...${value.slice(-chars)}`;

const OperatorAvatar = ({ operator }: { operator: Address }) => (
  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mono-20 dark:bg-mono-190 font-mono text-[10px] text-mono-120 dark:text-mono-100">
    {operator.slice(2, 4).toUpperCase()}
  </span>
);

export const NestedOperatorCell: FC<NestedOperatorCellProps> = ({
  operators,
  operatorMetadataMap,
}) => {
  if (!operators || !Array.isArray(operators) || operators.length === 0) {
    return EMPTY_VALUE_PLACEHOLDER;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="min-w-[auto] justify-start pl-0">
          <div className="flex items-center gap-2">
            {Children.toArray(
              operators
                .slice(0, 3)
                .map((operator) => <OperatorAvatar operator={operator} />),
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-2" side="bottom" align="center">
        {operators.length > 1 &&
          Children.toArray(
            operators.map((operator) => {
              return (
                <DropdownMenuItem className="px-4 py-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <OperatorAvatar operator={operator} />
                        <Text variant="body3" fw="bold">
                          {shortenString(
                            operatorMetadataMap?.get(operator)?.name ||
                              operator,
                          )}
                        </Text>
                      </div>
                      <button
                        type="button"
                        className="mt-1 font-mono text-mono-120 dark:text-mono-100 text-xs underline-offset-4 hover:text-mono-200 dark:text-mono-0 hover:underline"
                        onClick={() =>
                          void navigator.clipboard?.writeText(operator)
                        }
                      >
                        {shortenString(operator, 8)}
                      </button>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            }),
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
