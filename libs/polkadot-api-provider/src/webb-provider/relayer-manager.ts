// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import {
  NewNotesTxResult,
  Transaction,
  TransactionState,
} from '@webb-tools/abstract-api-provider';
import {
  OptionalActiveRelayer,
  OptionalRelayer,
  RelayedChainConfig,
  RelayerQuery,
  WebbRelayer,
  WebbRelayerManager,
  shuffleRelayers,
} from '@webb-tools/abstract-api-provider/relayer';
import { BridgeStorage } from '@webb-tools/browser-utils';
import Storage from '@webb-tools/dapp-types/Storage';
import { ChainType, Note, calculateTypedChainId } from '@webb-tools/sdk-core';

export class PolkadotRelayerManager extends WebbRelayerManager<'polkadot'> {
  supportedPallet = 'VAnchorBn254';

  mapRelayerIntoActive(
    relayer: OptionalRelayer,
    typedChainId: number
  ): OptionalActiveRelayer {
    if (!relayer) {
      return null;
    }

    return WebbRelayer.intoActiveWebRelayer(relayer, {
      basedOn: 'substrate',
      typedChainId,
    });
  }

  /*
   *  get a list of the suitable relayers for a given query
   *  the list is randomized
   *  Accepts a 'RelayerQuery' object with optional, indexible fields.
   **/
  getRelayers(query: RelayerQuery): WebbRelayer[] {
    const { baseOn, typedChainId, contractAddress, ipService } = query;
    const relayers = this.relayers.filter((relayer) => {
      const capabilities = relayer.capabilities;
      if (!capabilities) {
        return false;
      }

      if (ipService) {
        if (!capabilities.hasIpService) {
          return false;
        }
      }

      if (contractAddress && baseOn && typedChainId) {
        if (baseOn === 'evm') {
          return Boolean(
            capabilities.supportedChains[baseOn]
              .get(typedChainId)
              ?.contracts?.find(
                (contract) => contract.address === contractAddress.toLowerCase()
              )
          );
        }
      }

      if (baseOn && typedChainId) {
        const chainConfig =
          capabilities.supportedChains[baseOn].get(typedChainId);
        return (
          chainConfig &&
          Array.isArray(chainConfig.pallets) &&
          chainConfig.pallets.find((p) => p.pallet === this.supportedPallet)
        );
      }

      if (baseOn && !typedChainId) {
        if (baseOn === 'substrate') {
          const chainConfigMap: Map<
            number,
            RelayedChainConfig<'substrate'>
          > = capabilities.supportedChains[baseOn];
          return Array.from(chainConfigMap.values()).some(
            (chainConfig) =>
              Array.isArray(chainConfig.pallets) &&
              chainConfig.pallets.find((p) => p.pallet === this.supportedPallet)
          );
        } else {
          const chainConfigMap: Map<
            number,
            RelayedChainConfig<'evm'>
          > = capabilities.supportedChains[baseOn];
          return chainConfigMap.size > 0;
        }
      }

      return true;
    });

    shuffleRelayers(relayers);

    return relayers;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getRelayersByNote(evmNote: Note) {
    return Promise.resolve(
      this.getRelayers({
        baseOn: 'substrate',
      })
    );
  }

  async getRelayersByChainAndAddress(typedChainId: number, _: string) {
    return this.getRelayers({
      baseOn: 'substrate',
      chainId: typedChainId,
    });
  }

  async fetchLeavesFromRelayers(
    relayers: WebbRelayer[],
    api: ApiPromise,
    storage: Storage<BridgeStorage>,
    options: {
      treeHeight: number;
      targetRoot: string;
      commitment: bigint;
      treeId: number;
      palletId: number;
      tx?: Transaction<NewNotesTxResult>;
    }
  ): Promise<{
    provingLeaves: string[];
    commitmentIndex: number;
  } | null> {
    const { treeId, palletId, treeHeight, targetRoot, commitment, tx } =
      options;

    const abortSignal = tx?.cancelToken?.abortSignal;

    const chainId = api.consts.linkableTreeBn254.chainIdentifier.toNumber();
    const typedChainId = calculateTypedChainId(chainId, ChainType.Substrate);

    // loop through relayers and get leaves
    for (const relayer of relayers) {
      try {
        const { leaves, lastQueriedBlock } = await relayer.getLeaves(
          typedChainId,
          { treeId, palletId },
          abortSignal
        );

        const result = await this.validateRelayerLeaves(
          treeHeight,
          leaves,
          targetRoot,
          commitment,
          tx
        );

        if (!result) {
          continue;
        }

        // Cached all the leaves returned from the relayer to re-use later
        await storage.set('lastQueriedBlock', lastQueriedBlock);
        await storage.set('leaves', leaves);

        // Return the leaves for proving
        return result;
      } catch (e) {
        tx?.next(TransactionState.ValidatingLeaves, false);
        continue;
      }
    }

    return null;
  }
}
