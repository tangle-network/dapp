'use client';

import { MetadataDef } from '@polkadot/extension-inject/types';
import { HexString } from '@polkadot/util/types';
import { useActiveWallet } from '@tangle-network/api-provider-environment/hooks/useActiveWallet';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import { RefreshLineIcon } from '@tangle-network/icons';
import {
  IconButton,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@tangle-network/ui-components';
import isEqual from 'lodash/isEqual';
import { FC, useCallback, useMemo, useState } from 'react';
import useNetworkStore from '../../context/useNetworkStore';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import useLocalStorage, {
  LocalStorageKey,
  SubstrateWalletsMetadataEntry,
} from '../../hooks/useLocalStorage';
import usePromise from '../../hooks/usePromise';
import useSubstrateInjectedExtension from '../../hooks/useSubstrateInjectedExtension';
import { getApiPromise } from '../../utils/polkadot/api';

const UpdateMetadataButton: FC = () => {
  const [isHidden, setIsHidden] = useState(false);

  const { substrateAddress } = useAgnosticAccountInfo();
  const [activeWallet] = useActiveWallet();
  const injector = useSubstrateInjectedExtension();
  const { network } = useNetworkStore();

  const { result: apiPromise } = usePromise(
    useCallback(
      () => getApiPromise(network.wsRpcEndpoint),
      [network.wsRpcEndpoint],
    ),
    null,
  );

  const { setWithPreviousValue: setCache, valueOpt: cachedMetadata } =
    useLocalStorage(LocalStorageKey.SUBSTRATE_WALLETS_METADATA);

  const updateCache = useCallback(
    (genesisHash: HexString, metadata: SubstrateWalletsMetadataEntry) => {
      setCache((cache) => ({
        ...cache,
        [genesisHash]: metadata,
      }));
    },
    [setCache],
  );

  const isMetadataUpToDate = useMemo(() => {
    if (apiPromise === null) {
      return null;
    }

    // If the active wallet is an EVM wallet, we don't need to update the metadata
    if (activeWallet?.platform === 'EVM') {
      return null;
    }

    const genesisHash = apiPromise.genesisHash.toHex();
    const cachedEntry = cachedMetadata?.value?.[genesisHash];

    if (cachedEntry === undefined) {
      return false;
    }

    return isEqual(cachedEntry, {
      ss58Prefix: network.ss58Prefix,
      tokenSymbol: network.tokenSymbol,
      tokenDecimals: TANGLE_TOKEN_DECIMALS,
    });
  }, [
    activeWallet?.platform,
    apiPromise,
    cachedMetadata?.value,
    network.ss58Prefix,
    network.tokenSymbol,
  ]);

  const handleClick = async () => {
    if (
      injector === null ||
      substrateAddress === null ||
      network.ss58Prefix === undefined
    ) {
      return;
    }

    const api = await getApiPromise(network.wsRpcEndpoint);
    const genesisHash = api.genesisHash.toHex();

    const metadata: MetadataDef = {
      tokenDecimals: TANGLE_TOKEN_DECIMALS,
      tokenSymbol: network.tokenSymbol,
      genesisHash,
      specVersion: api.runtimeVersion.specVersion.toNumber(),
      icon: 'substrate',
      ss58Format: network.ss58Prefix,
      types: {},
      chain: api.runtimeChain.toString(),
    };

    // The 'provide' request will throw an error if the user
    // rejects the request. Leniently catch the error and log it.
    const handleError = (error: unknown) => {
      console.error(
        `Failed to provide updated metadata to injected extension: ${error}`,
      );
    };

    await injector.metadata
      ?.provide(metadata)
      // Only update the cache if the metadata was successfully
      // provided.
      .then(() => {
        if (network.ss58Prefix === undefined) {
          return;
        }

        updateCache(genesisHash, {
          ss58Prefix: network.ss58Prefix,
          tokenSymbol: network.tokenSymbol,
          tokenDecimals: TANGLE_TOKEN_DECIMALS,
        });

        // Hide the button after the metadata has been updated.
        setIsHidden(true);
      })
      .catch(handleError);
  };

  // Hide the button if the metadata is up-to-date, if it's not yet known,
  // and after metadata has been updated.
  if (
    isMetadataUpToDate === null ||
    isMetadataUpToDate ||
    isHidden ||
    substrateAddress === null
  ) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton
          onClick={handleClick}
          className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 border rounded-full shadow-md bg-mono-20 dark:bg-mono-160 border-mono-60 dark:border-mono-120"
        >
          <RefreshLineIcon />
        </IconButton>
      </TooltipTrigger>

      <TooltipBody side="bottom">
        Update metadata for Substrate wallets
      </TooltipBody>
    </Tooltip>
  );
};

export default UpdateMetadataButton;
