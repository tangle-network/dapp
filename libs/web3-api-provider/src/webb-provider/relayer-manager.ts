// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  OptionalActiveRelayer,
  OptionalRelayer,
  RelayerQuery,
  shuffleRelayers,
  WebbRelayer,
  WebbRelayerManager,
} from '@webb-tools/abstract-api-provider/relayer';
import { VAnchor } from '@webb-tools/anchors';
import { BridgeStorage } from '@webb-tools/browser-utils/storage';
import {
  calculateTypedChainId,
  ChainType,
  MerkleTree,
  Note,
  parseTypedChainId,
  toFixedHex,
} from '@webb-tools/sdk-core';
import { Storage } from '@webb-tools/storage';

export class Web3RelayerManager extends WebbRelayerManager {
  async mapRelayerIntoActive(
    relayer: OptionalRelayer,
    typedChainId: number
  ): Promise<OptionalActiveRelayer> {
    if (!relayer) {
      return null;
    }

    return WebbRelayer.intoActiveWebRelayer(relayer, {
      basedOn: 'evm',
      typedChainId,
    });
  }

  /*
   *  get a list of the suitable relayers for a given query
   *  the list is randomized
   *  Accepts a 'RelayerQuery' object with optional, indexible fields.
   **/
  getRelayers(query: RelayerQuery): WebbRelayer[] {
    const { baseOn, contractAddress, ipService, typedChainId } = query;
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
                (contract) =>
                  contract.address === contractAddress.toLowerCase() &&
                  contract.eventsWatcher.enabled
              )
          );
        }
      }

      if (query.contract && baseOn === 'evm' && typedChainId !== undefined) {
        const relayerIndex =
          capabilities.supportedChains['evm']
            .get(typedChainId)
            ?.contracts.findIndex(
              (contract) => contract.contract === query.contract
            ) ?? -1;
        return relayerIndex > -1;
      }

      if (baseOn && typedChainId) {
        return Boolean(capabilities.supportedChains[baseOn].get(typedChainId));
      }

      if (baseOn && !typedChainId) {
        return capabilities.supportedChains[baseOn].size > 0;
      }

      return true;
    });

    shuffleRelayers(relayers);

    return relayers;
  }

  async getRelayersByNote(evmNote: Note) {
    const typedChainId = Number(evmNote.note.targetChainId);
    const chainId = parseTypedChainId(typedChainId).chainId;

    return this.getRelayers({
      baseOn: 'evm',
      typedChainId,
      chainId,
      contract: 'VAnchor',
    });
  }

  async getRelayersByChainAndAddress(typedChainId: number, address: string) {
    const chainId = parseTypedChainId(typedChainId).chainId;
    return this.getRelayers({
      baseOn: 'evm',
      typedChainId,
      chainId,
      contractAddress: address,
    });
  }

  /**
   * This routine queries the passed relayers for the leaves of an anchor instance on an evm chain.
   * It validates the leaves with on-chain data, and saves to the storage once validated.
   * An array of leaves is returned if validated, otherwise null is returned.
   * @param relayers - A list of relayers that support the passed contract
   * @param contract - A VAnchorContract wrapper for EVM chains.
   * @param storage - A storage to save the fetched leaves.
   * param abortSignal - A signal to abort the fetching process.
   */
  async fetchLeavesFromRelayers(
    relayers: WebbRelayer[],
    vanchor: VAnchor,
    storage: Storage<BridgeStorage>,
    options: {
      abortSignal?: AbortSignal;
    }
  ): Promise<string[] | null> {
    const { abortSignal } = options;

    let leaves: string[] = [];
    const sourceEvmId = (await vanchor.contract.provider.getNetwork()).chainId;
    const typedChainId = calculateTypedChainId(ChainType.EVM, sourceEvmId);

    // loop through the sourceRelayers to fetch leaves
    for (let i = 0; i < relayers.length; i++) {
      let relayerLeaves: Awaited<ReturnType<WebbRelayer['getLeaves']>>;
      try {
        relayerLeaves = await relayers[i].getLeaves(
          typedChainId,
          vanchor.contract.address,
          abortSignal
        );
      } catch (e) {
        continue;
      }

      const validLatestLeaf = await vanchor.leafCreatedAtBlock(
        relayerLeaves.leaves[relayerLeaves.leaves.length - 1],
        relayerLeaves.lastQueriedBlock
      );

      // leaves from relayer somewhat validated, attempt to build the tree
      if (validLatestLeaf) {
        // Assume the destination anchor has the same levels as source anchor
        const levels = await vanchor.contract.getLevels();
        const lastRootBigNumber = await vanchor.contract.getLastRoot();

        // Fixed the last root to be 32 bytes
        const lastRoot = toFixedHex(lastRootBigNumber.toHexString());
        const tree = MerkleTree.createTreeWithRoot(
          levels,
          relayerLeaves.leaves,
          lastRoot
        );

        // If we were able to build the tree, set local storage and break out of the loop
        if (tree) {
          leaves = relayerLeaves.leaves;

          await storage.set('lastQueriedBlock', relayerLeaves.lastQueriedBlock);
          await storage.set('leaves', relayerLeaves.leaves);

          return leaves;
        }
      }
    }

    return null;
  }
}
