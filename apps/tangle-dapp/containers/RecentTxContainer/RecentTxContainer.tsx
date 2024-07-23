'use client';

import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { TANGLE_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { FC, useMemo } from 'react';

import GlassCard from '../../components/GlassCard/GlassCard';
import useNetworkStore from '../../context/useNetworkStore';
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
      ? getExplorerURI(
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
        >
          Open Explorer
        </Button>
      </div>

      <div className="flex flex-col gap-5 justify-center items-center h-full text-center">
        <Typography variant="body1" className="text-center max-w-lg">
          Welcome to Tangle dApp &mdash; Your portal to managing Tangle Network
          assets and upcoming AVS Blueprints in Tangle&apos;s modular restaking
          infrastructure.
        </Typography>

        <Link href={TANGLE_DOCS_URL} target="_blank">
          <Button isFullWidth>Learn More</Button>
        </Link>
      </div>
    </GlassCard>
  );
};

export default RecentTxContainer;
