'use client';

import { makeExplorerUrl } from '@webb-tools/api-provider-environment/transaction/utils';
import { ExternalLinkLine } from '@webb-tools/icons';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { TANGLE_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import { FC, useMemo } from 'react';

import GlassCard from '../../components/GlassCard/GlassCard';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import { ExplorerType } from '../../types';

const RecentTxContainer: FC = () => {
  const { network } = useNetworkStore();
  const activeAccountAddress = useActiveAccountAddress();
  const { isEvm } = useAgnosticAccountInfo();

  const explorerUrl = useMemo(() => {
    return isEvm
      ? network.evmExplorerUrl
      : (network.nativeExplorerUrl ?? network.polkadotJsDashboardUrl);
  }, [
    isEvm,
    network.evmExplorerUrl,
    network.nativeExplorerUrl,
    network.polkadotJsDashboardUrl,
  ]);

  const accountExplorerUrl = useMemo(() => {
    return activeAccountAddress && explorerUrl
      ? makeExplorerUrl(
          explorerUrl,
          activeAccountAddress,
          'address',
          isEvm ? ExplorerType.EVM : ExplorerType.Substrate,
        ).toString()
      : undefined;
  }, [activeAccountAddress, explorerUrl, isEvm]);

  return (
    <GlassCard className="flex flex-col gap-3 sm:gap-0">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="utility"
          color="primary"
          className="uppercase"
          target="_blank"
          href={accountExplorerUrl}
          isDisabled={!accountExplorerUrl}
          rightIcon={
            <ExternalLinkLine className="fill-current dark:fill-current" />
          }
        >
          Open Explorer
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
        <Typography variant="body1" className="max-w-lg text-center">
          Welcome to Tangle dApp &mdash; Your portal to managing Tangle Network
          assets and upcoming AVS Blueprints in Tangle&apos;s modular restaking
          infrastructure.
        </Typography>

        <Button href={TANGLE_DOCS_URL} target="_blank">
          Learn More
        </Button>
      </div>
    </GlassCard>
  );
};

export default RecentTxContainer;
