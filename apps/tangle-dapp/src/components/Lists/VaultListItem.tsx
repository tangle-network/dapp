import { ArrowRightUp, TokenIcon } from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  CopyWithTooltip,
  isEvmAddress,
  shortenHex,
  Typography,
} from '@tangle-network/ui-components';
import { type FC, useMemo } from 'react';
import { type Address } from 'viem';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';
import LogoListItem from './LogoListItem';

type Props = {
  vaultAddress: Address;
  vaultName: string;
  vaultSymbol: string;
  operatorAddress: Address;
  selectionMode: number;
  blueprintCount: number;
  tvlText: string;
  tvlSymbol?: string;
};

const VaultListItem: FC<Props> = ({
  vaultAddress,
  vaultName,
  vaultSymbol,
  operatorAddress,
  selectionMode,
  blueprintCount,
  tvlText,
  tvlSymbol,
}) => {
  const createExplorerAccountUrl = useNetworkStore(
    (store) => store.network2.createExplorerAccountUrl,
  );

  const vaultEvmAddress = useMemo(() => {
    return isEvmAddress(vaultAddress)
      ? (vaultAddress as unknown as EvmAddress)
      : null;
  }, [vaultAddress]);

  const operatorEvmAddress = useMemo(() => {
    return isEvmAddress(operatorAddress)
      ? (operatorAddress as unknown as EvmAddress)
      : null;
  }, [operatorAddress]);

  const vaultExplorerUrl = useMemo(() => {
    return vaultEvmAddress ? createExplorerAccountUrl(vaultEvmAddress) : null;
  }, [createExplorerAccountUrl, vaultEvmAddress]);

  const operatorExplorerUrl = useMemo(() => {
    return operatorEvmAddress
      ? createExplorerAccountUrl(operatorEvmAddress)
      : null;
  }, [createExplorerAccountUrl, operatorEvmAddress]);

  const selectionLabel =
    selectionMode === 0 ? 'All blueprints' : `${blueprintCount} blueprints`;

  const operatorLabel = operatorEvmAddress
    ? shortenHex(operatorEvmAddress)
    : 'Invalid operator';
  const vaultLabel = vaultEvmAddress
    ? shortenHex(vaultEvmAddress)
    : 'Invalid vault';

  return (
    <LogoListItem
      logo={<TokenIcon size="xl" name={tvlSymbol ?? vaultSymbol} />}
      leftUpperContent={`${vaultName} (${vaultSymbol})`}
      leftBottomContent={
        operatorExplorerUrl ? (
          <a
            href={operatorExplorerUrl}
            target="_blank"
            rel="noreferrer"
            className="z-20 flex items-center gap-1 text-mono-120 dark:text-mono-100 dark:hover:text-mono-80"
          >
            <Typography
              variant="body1"
              className="text-current dark:text-current dark:hover:text-current"
            >
              Operator: {operatorLabel}
            </Typography>
            <ArrowRightUp className="fill-current dark:fill-current" />
          </a>
        ) : (
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-100 dark:hover:text-mono-80 flex items-center gap-2"
          >
            Operator: {operatorLabel}
            <CopyWithTooltip textToCopy={operatorAddress} isButton={false} />
          </Typography>
        )
      }
      leftBottomContentTwo={
        <div className="flex items-center gap-2">
          {vaultExplorerUrl ? (
            <a
              href={vaultExplorerUrl}
              target="_blank"
              rel="noreferrer"
              className="z-20 flex items-center gap-1 text-mono-120 dark:text-mono-100 dark:hover:text-mono-80"
            >
              <Typography
                variant="body1"
                className="text-current dark:text-current dark:hover:text-current"
              >
                Vault: {vaultLabel}
              </Typography>
              <ArrowRightUp className="fill-current dark:fill-current" />
            </a>
          ) : (
            <Typography
              variant="body1"
              className="text-mono-120 dark:text-mono-100 dark:hover:text-mono-80"
            >
              Vault: {vaultLabel}
            </Typography>
          )}
          <CopyWithTooltip textToCopy={vaultAddress} isButton={false} />
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-100"
          >
            • {selectionLabel}
          </Typography>
        </div>
      }
      rightUpperText={`${tvlText}${tvlSymbol ? ` ${tvlSymbol}` : ''}`}
      rightBottomText="TVL"
    />
  );
};

export default VaultListItem;
