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
} from '@tangle-network/ui-components';

type Props = {
  /**
   * EVM operator address (H160).
   *
   * This list item is used in the EVM restaking flow, so Substrate-style
   * formatting is intentionally avoided.
   */
  accountAddress: EvmAddress | string;
  identity?: string | null;
  totalDelegations?: bigint | number | null;
};

const OperatorListItem: FC<Props> = ({
  accountAddress,
  identity,
  totalDelegations,
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

  const leftUpperContent =
    identity?.trim() ||
    (operatorAddress ? shortenHex(operatorAddress) : 'Invalid operator');

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
        totalDelegations !== null && totalDelegations !== undefined
          ? 'total delegations'
          : undefined
      }
    />
  );
};

export default OperatorListItem;
