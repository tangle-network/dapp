import {
  InjectedExtension,
  MetadataDef,
} from '@polkadot/extension-inject/types';
import { HexString } from '@polkadot/util/types';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import isSubstrateAddress from '@webb-tools/dapp-types/utils/isSubstrateAddress';
import { RefreshLineIcon } from '@webb-tools/icons';
import {
  IconButton,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components';
import { NetworkId } from '@webb-tools/webb-ui-components/constants/networks';
import isEqual from 'lodash/isEqual';
import { FC, useCallback, useMemo, useState } from 'react';

import useNetworkStore from '../context/useNetworkStore';
import useActiveAccountAddress from '../hooks/useActiveAccountAddress';
import useLocalStorage, {
  LocalStorageKey,
  SubstrateWalletsMetadataEntry,
} from '../hooks/useLocalStorage';
import usePromise from '../hooks/usePromise';
import { findInjectorForAddress, getApiPromise } from '../utils/polkadot';

const UpdateMetadataButton: FC = () => {
  const [isHidden, setIsHidden] = useState(false);

  const activeAccountAddress = useActiveAccountAddress();
  const { network } = useNetworkStore();

  const { result: injector } = usePromise<InjectedExtension | null>(
    useCallback(() => {
      if (activeAccountAddress === null) {
        return Promise.resolve(null);
      }

      return findInjectorForAddress(activeAccountAddress);
    }, [activeAccountAddress]),
    null,
  );

  const { result: apiPromise } = usePromise(
    useCallback(
      () => getApiPromise(network.wsRpcEndpoint),
      [network.wsRpcEndpoint],
    ),
    null,
  );

  const { setWithPreviousValue: setCache, valueOpt: cachedMetadata } =
    useLocalStorage(LocalStorageKey.SUBSTRATE_WALLETS_METADATA, true);

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
    // Only update metadata for the mainnet. This is because
    // the testnet and local networks have the same genesis hash,
    // so they represent the same network. Only the mainnet's metadata
    // is relevant.
    if (apiPromise === null || network.id !== NetworkId.TANGLE_MAINNET) {
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
    apiPromise,
    cachedMetadata?.value,
    network.id,
    network.ss58Prefix,
    network.tokenSymbol,
  ]);

  const isSubstrateAccount = useMemo(
    () =>
      activeAccountAddress !== null
        ? isSubstrateAddress(activeAccountAddress)
        : null,
    [activeAccountAddress],
  );

  const handleClick = async () => {
    if (
      injector === null ||
      activeAccountAddress === null ||
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
    !isSubstrateAccount
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
