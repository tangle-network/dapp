import {
  InjectedExtension,
  MetadataDef,
} from '@polkadot/extension-inject/types';
import { ArrowUpIcon } from '@radix-ui/react-icons';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import {
  IconButton,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components';
import _ from 'lodash';
import { FC, useCallback } from 'react';

import useNetworkStore from '../context/useNetworkStore';
import useActiveAccountAddress from '../hooks/useActiveAccountAddress';
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

  const handleClick = async () => {
    if (
      injector === null ||
      activeAccountAddress === null ||
      network.ss58Prefix === undefined
    ) {
      return;
    }

    const api = await getApiPromise(network.wsRpcEndpoint);
    const existingMetadata = await injector.metadata?.get();

    const metadata: MetadataDef = {
      tokenDecimals: TANGLE_TOKEN_DECIMALS,
      tokenSymbol: network.tokenSymbol,
      genesisHash: api.genesisHash.toHex(),
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

    // No metadata exists yet; provide it.
    if (existingMetadata === undefined) {
      await injector.metadata?.provide(metadata).catch(handleError);
    }
    // Metadata exists; check if it's up to date.
    else {
      for (const existing of existingMetadata) {
        // Already up to date; ignore.
        if (_.isEqual(existing, metadata)) {
          return;
        }

        await injector.metadata?.provide(metadata).catch(handleError);

        break;
      }
    }
  };

  const isVisible =
    activeAccountAddress !== null &&
    network.ss58Prefix !== undefined &&
    injector !== null;

  if (!isVisible) {
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
