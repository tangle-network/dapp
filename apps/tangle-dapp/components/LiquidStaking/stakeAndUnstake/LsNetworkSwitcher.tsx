import { ChainConfig } from '@webb-tools/dapp-config';
import { chainsConfig } from '@webb-tools/dapp-config/chains';
import { ChainIcon } from '@webb-tools/icons';
import {
  calculateTypedChainId,
  ChainType,
} from '@webb-tools/sdk-core/typed-chain-id';
import {
  Modal,
  ModalContent,
  Typography,
  useModal,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { IS_PRODUCTION_ENV } from '../../../constants/env';
import { LS_NETWORKS } from '../../../constants/liquidStaking/constants';
import { LsNetworkId } from '../../../constants/liquidStaking/types';
import { NETWORK_FEATURE_MAP } from '../../../constants/networks';
import { NetworkFeature } from '../../../types';
import getLsNetwork from '../../../utils/liquidStaking/getLsNetwork';
import getLsTangleNetwork from '../../../utils/liquidStaking/getLsTangleNetwork';
import { ChainList } from '../../Lists/ChainList';
import DropdownChevronIcon from './DropdownChevronIcon';

type LsNetworkSwitcherProps = {
  activeLsNetworkId: LsNetworkId;

  /**
   * If this function is not provided, the selector will be
   * considered read-only.
   */
  setNetworkId?: (newNetworkId: LsNetworkId) => void;
};

const LsNetworkSwitcher: FC<LsNetworkSwitcherProps> = ({
  activeLsNetworkId,
  setNetworkId,
}) => {
  const isReadOnly = setNetworkId === undefined;
  const activeLsNetwork = getLsNetwork(activeLsNetworkId);

  const {
    status: isLsNetworkSwitcherOpen,
    open: openLsNetworkSwitcher,
    close: closeLsNetworkSwitcher,
  } = useModal(false);

  const base = (
    <div
      onClick={isReadOnly ? undefined : openLsNetworkSwitcher}
      className={twMerge(
        'group flex gap-1 items-center justify-center',
        !isReadOnly && 'cursor-pointer',
      )}
    >
      <div className="flex gap-2 items-center justify-center">
        <ChainIcon size="lg" name={activeLsNetwork.chainIconFileName} />

        <Typography variant="h5" fw="bold" className="dark:text-mono-40">
          {activeLsNetwork.networkName}
        </Typography>
      </div>

      {!isReadOnly && <DropdownChevronIcon isLarge />}
    </div>
  );

  // Filter out networks that don't support liquid staking yet.
  const supportedLsNetworks = LS_NETWORKS.filter((network) => {
    if (network.id === LsNetworkId.TANGLE_LOCAL && IS_PRODUCTION_ENV) {
      return false;
    }

    // TODO: Obtain the Tangle network from the LS Network's properties instead.
    const tangleNetwork = getLsTangleNetwork(network.id);

    // TODO: This is getting spammed, likely many requests to this function are being made by a bug. Might have to do with the URL param sync, check the consumers of this hook.
    // console.debug('TANGLE NETWORK', tangleNetwork);

    return NETWORK_FEATURE_MAP[tangleNetwork.id].includes(
      NetworkFeature.LsPools,
    );
  });

  const networkOptions = useMemo<ChainConfig[]>(() => {
    return supportedLsNetworks.map((network) => {
      const tangleNetwork = getLsTangleNetwork(network.id);

      const typedChainId = calculateTypedChainId(
        tangleNetwork.substrateChainId ? ChainType.Substrate : ChainType.EVM,
        tangleNetwork.substrateChainId ?? tangleNetwork.evmChainId ?? 0,
      );

      const chainConfig = chainsConfig[typedChainId];

      return {
        ...chainConfig,
        name: network.networkName,
        id: network.id,
      } satisfies ChainConfig;
    });
  }, [supportedLsNetworks]);

  const handleOnSelectNetwork = useCallback(
    (chain: ChainConfig) => {
      setNetworkId?.(chain.id as LsNetworkId);
      closeLsNetworkSwitcher();
    },
    [closeLsNetworkSwitcher, setNetworkId],
  );

  return (
    <>
      {base}

      <Modal>
        <ModalContent
          isOpen={isLsNetworkSwitcherOpen}
          onInteractOutside={closeLsNetworkSwitcher}
          size="sm"
        >
          <ChainList
            searchInputId="ls-network-switcher-search"
            showSearchInput={false}
            onClose={closeLsNetworkSwitcher}
            chains={networkOptions}
            onSelectChain={handleOnSelectNetwork}
            chainType="source"
            title="Switch Network"
          />
        </ModalContent>
      </Modal>
    </>
  );
};

export default LsNetworkSwitcher;
