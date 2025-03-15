import { DropdownBody } from '@tangle-network/ui-components/components/Dropdown/DropdownBody';
import {
  Avatar,
  Dropdown,
  DropdownButton,
  DropdownMenuItem,
  EMPTY_VALUE_PLACEHOLDER,
  KeyValueWithButton,
  shortenString,
  toSubstrateAddress,
  Typography,
} from '@tangle-network/ui-components';
import { Link } from 'react-router';
import { ExternalLinkLine } from '@tangle-network/icons';
import { Children, FC } from 'react';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { IdentityType } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';

type NestedOperatorCellProps = {
  operators?: string[];
  operatorIdentityMap?: Map<string, IdentityType | null>;
};
export const NestedOperatorCell: FC<NestedOperatorCellProps> = ({
  operators,
  operatorIdentityMap,
}) => {
  if (!operators || !Array.isArray(operators) || operators.length === 0) {
    return EMPTY_VALUE_PLACEHOLDER;
  }

  const network = useNetworkStore((store) => store.network);

  return (
    <Dropdown>
      <DropdownButton
        isFullWidth
        size="md"
        label={
          <div className="flex items-center gap-2">
            {Children.toArray(
              operators
                .slice(0, 3)
                .map((operator) => (
                  <Avatar
                    sourceVariant="address"
                    value={operator.toString()}
                    theme="substrate"
                    size="md"
                  />
                )),
            )}
          </div>
        }
        isHideArrowIcon={operators.length <= 1}
        className="min-w-[auto] border-none !bg-transparent pl-0"
      />
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
                          value={operator.toString()}
                          theme="substrate"
                          size="md"
                        />
                        <Typography variant="body3" fw="bold">
                          {shortenString(
                            operatorIdentityMap?.get(operator)?.name ||
                              operator.toString(),
                          )}
                        </Typography>
                      </div>
                      <KeyValueWithButton size="sm" keyValue={operator} />
                    </div>
                    <Link
                      to={
                        network.createExplorerAccountUrl(
                          toSubstrateAddress(operator),
                        ) ?? ''
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="!text-inherit"
                    >
                      <ExternalLinkLine className="!fill-current" />
                    </Link>
                  </div>
                </DropdownMenuItem>
              );
            }),
          )}
      </DropdownBody>
    </Dropdown>
  );
};
