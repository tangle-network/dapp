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
import { FC } from 'react';

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
    <div className="group flex gap-1 items-center justify-center">
      <div className="flex gap-2 items-center justify-center">
        <ChainIcon size="lg" name={activeLsNetwork.chainIconFileName} />

        <Typography variant="h5" fw="bold" className="dark:text-mono-40">
          {activeLsNetwork.networkName}
        </Typography>
      </div>

      {!isReadOnly && (
        <DropdownChevronIcon
          isLarge
          onClick={!isReadOnly ? openLsNetworkSwitcher : undefined}
        />
      )}
    </div>
  );

  // Filter out networks that don't support liquid staking yet.
  const supportedLsNetworks = LS_NETWORKS.filter((network) => {
    if (network.id === LsNetworkId.TANGLE_LOCAL && IS_PRODUCTION_ENV) {
      return false;
    }
    // Filter out the selected network.
    else if (activeLsNetwork.id === network.id) {
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

  const networkOptions: ChainConfig[] = supportedLsNetworks.map((network) => {
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
    };
  });

  const handleOnSelectNetwork = (chain: ChainConfig) => {
    setNetworkId?.(chain.id as LsNetworkId);
    closeLsNetworkSwitcher();
  };

  return (
    <>
      {base}

      <Modal>
        <ModalContent
          isCenter
          isOpen={isLsNetworkSwitcherOpen}
          onInteractOutside={closeLsNetworkSwitcher}
          className="w-[500px] h-[600px]"
        >
          <ChainList
            onClose={closeLsNetworkSwitcher}
            chains={networkOptions}
            onSelectChain={handleOnSelectNetwork}
            chainType="source"
          />
        </ModalContent>
      </Modal>
    </>
  );
};

export default LsNetworkSwitcher;
