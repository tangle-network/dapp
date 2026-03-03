import { ArrowRightUp } from '@tangle-network/icons';
import { FC, useMemo } from 'react';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import LogoListItem from './LogoListItem';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';
import {
  Avatar,
  CopyWithTooltip,
  Typography,
  isEvmAddress,
  shortenHex,
  Chip,
} from '@tangle-network/ui-components';
import { DelegationMode } from '@tangle-network/tangle-shared-ui/data/staking/useCanDelegate';

type Props = {
  /**
   * EVM operator address (H160).
   *
   * This list item is used in the EVM staking flow, so Substrate-style
   * formatting is intentionally avoided.
   */
  accountAddress: EvmAddress | string;
  identity?: string | null;
  totalDelegations?: bigint | number | null;
  /** Optional delegation mode for display */
  delegationMode?: DelegationMode;
  /** Whether the item is disabled (user cannot delegate to this operator) */
  isDisabled?: boolean;
};

const getDelegationModeDisplay = (
  mode: DelegationMode | undefined,
): { label: string; color: 'green' | 'yellow' | 'dark-grey' } | null => {
  if (mode === undefined) return null;

  switch (mode) {
    case DelegationMode.Open:
      return { label: 'Open', color: 'green' };
    case DelegationMode.Whitelist:
      return { label: 'Whitelist', color: 'yellow' };
    case DelegationMode.Disabled:
    default:
      return { label: 'Self Only', color: 'dark-grey' };
  }
};

const OperatorListItem: FC<Props> = ({
  accountAddress,
  identity,
  totalDelegations,
  delegationMode,
  isDisabled,
}) => {
  const createExplorerAccountUrl = useNetworkStore(
    (store) => store.network2.createExplorerAccountUrl,
  );

  const operatorAddress = useMemo(() => {
    return isEvmAddress(accountAddress) ? (accountAddress as EvmAddress) : null;
  }, [accountAddress]);

  const explorerUrl = useMemo(() => {
    return operatorAddress ? createExplorerAccountUrl(operatorAddress) : null;
  }, [createExplorerAccountUrl, operatorAddress]);

  const delegationModeDisplay = useMemo(
    () => getDelegationModeDisplay(delegationMode),
    [delegationMode],
  );

  const leftUpperContent = (
    <span className="flex items-center gap-2">
      {identity?.trim() ||
        (operatorAddress ? shortenHex(operatorAddress) : 'Invalid operator')}
      {delegationModeDisplay && (
        <Chip color={delegationModeDisplay.color}>
          {delegationModeDisplay.label}
        </Chip>
      )}
    </span>
  );

  const leftBottomContent = operatorAddress ? (
    explorerUrl ? (
      <a
        href={explorerUrl}
        target="_blank"
        rel="noreferrer"
        className="z-20 flex items-center gap-1 text-mono-120 dark:text-mono-100 dark:hover:text-mono-80"
      >
        <Typography
          variant="body1"
          className="text-current dark:text-current dark:hover:text-current"
        >
          {shortenHex(operatorAddress)}
        </Typography>

        <ArrowRightUp className="fill-current dark:fill-current" />
      </a>
    ) : (
      <Typography
        variant="body1"
        className="text-mono-120 dark:text-mono-100 dark:hover:text-mono-80 flex items-center gap-2"
      >
        Operator: {shortenHex(operatorAddress)}
        <CopyWithTooltip textToCopy={operatorAddress} isButton={false} />
      </Typography>
    )
  ) : null;

  const getDisabledMessage = () => {
    if (!isDisabled) return undefined;
    if (delegationMode === DelegationMode.Disabled) {
      return 'Not accepting delegations';
    }
    if (delegationMode === DelegationMode.Whitelist) {
      return 'Not on whitelist';
    }
    return 'Cannot delegate';
  };

  const disabledMessage = getDisabledMessage();

  return (
    <LogoListItem
      logo={
        <Avatar
          size="lg"
          theme="ethereum"
          value={
            operatorAddress ??
            ('0x0000000000000000000000000000000000000000' as EvmAddress)
          }
        />
      }
      leftUpperContent={leftUpperContent}
      leftBottomContent={leftBottomContent}
      rightUpperText={
        totalDelegations !== null && totalDelegations !== undefined
          ? totalDelegations.toString()
          : ''
      }
      rightBottomText={
        disabledMessage ??
        (totalDelegations !== null && totalDelegations !== undefined
          ? 'total delegations'
          : undefined)
      }
      rightBottomClassName={disabledMessage ? 'text-red-500' : undefined}
    />
  );
};

export default OperatorListItem;
