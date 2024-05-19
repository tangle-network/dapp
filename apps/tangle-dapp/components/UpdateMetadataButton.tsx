import {
  InjectedExtension,
  MetadataDef,
} from '@polkadot/extension-inject/types';
import { HexString } from '@polkadot/util/types';
import { ArrowUpIcon } from '@radix-ui/react-icons';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import {
  IconButton,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components';
import _ from 'lodash';
import { FC, useCallback, useMemo } from 'react';

import useNetworkStore from '../context/useNetworkStore';
import useActiveAccountAddress from '../hooks/useActiveAccountAddress';
import useLocalStorage, {
  LocalStorageKey,
  SubstrateWalletsMetadataEntry,
} from '../hooks/useLocalStorage';
import usePromise from '../hooks/usePromise';
import { findInjectorForAddress, getApiPromise } from '../utils/polkadot';

const UpdateMetadataButton: FC = () => {
  const activeAccountAddress = useActiveAccountAddress();
  const { network } = useNetworkStore();

  const { result: injector } = usePromise<InjectedExtension | null>(
    useCallback(() => {
      if (activeAccountAddress === null) {
        return Promise.resolve(null);
      }

      return findInjectorForAddress(activeAccountAddress);
    }, [activeAccountAddress]),
    null
  );

  const { result: apiPromise } = usePromise(
    useCallback(
      () => getApiPromise(network.wsRpcEndpoint),
      [network.wsRpcEndpoint]
    ),
    null
  );

  const { get: getCache, setWithPreviousValue: setCache } = useLocalStorage(
    LocalStorageKey.SUBSTRATE_WALLETS_METADATA,
    true
  );

  const updateCache = useCallback(
    (genesisHash: HexString, metadata: SubstrateWalletsMetadataEntry) => {
      setCache((cache) => ({
        ...cache,
        [genesisHash]: metadata,
      }));
    },
    [setCache]
  );

  const isMetadataUpToDate = useMemo(() => {
    if (apiPromise === null) {
      return null;
    }

    const genesisHash = apiPromise.genesisHash.toHex();
    const cachedMetadata = getCache();
    const relevantEntry = cachedMetadata?.[genesisHash];

    if (cachedMetadata === null || relevantEntry === undefined) {
      return true;
    }

    return !_.isEqual(relevantEntry, {
      ss58Prefix: network.ss58Prefix,
      tokenSymbol: network.tokenSymbol,
      tokenDecimals: TANGLE_TOKEN_DECIMALS,
    });
  }, [apiPromise, getCache, network.ss58Prefix, network.tokenSymbol]);

  const handleClick = async () => {
    if (
      injector === null ||
      activeAccountAddress === null ||
      network.ss58Prefix === undefined ||
      isMetadataUpToDate === null
    ) {
      return;
    }

    const api = await getApiPromise(network.wsRpcEndpoint);
    const genesisHash = api.genesisHash.toHex();
    const existingMetadata = await injector.metadata?.get();

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
        `Failed to provide metadata to injected extension: ${error}`
      );
    };

    const updateMetadata = async () => {
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
        })
        .catch(handleError);
    };

    if (existingMetadata === undefined || !isMetadataUpToDate) {
      await updateMetadata();
    }
  };

  // Hide the button if the metadata is up-to-date or if it's not yet known.
  if (isMetadataUpToDate === null || !isMetadataUpToDate) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <IconButton
          onClick={handleClick}
          className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full shadow-md bg-mono-20 dark:bg-mono-160 border border-mono-60 dark:border-mono-120"
        >
          <ArrowUpIcon />
        </IconButton>
      </TooltipTrigger>

      <TooltipBody side="bottom" sideOffset={-10}>
        Update metadata for Substrate wallets
      </TooltipBody>
    </Tooltip>
  );
};

export default UpdateMetadataButton;
