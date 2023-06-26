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
  RelayerQuery,
  shuffleRelayers,
  WebbRelayer,
  WebbRelayerManager,
} from '@webb-tools/abstract-api-provider/relayer';
import { BridgeStorage } from '@webb-tools/browser-utils';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import {
  calculateTypedChainId,
  ChainType,
  MerkleTree,
  Note,
  toFixedHex,
} from '@webb-tools/sdk-core';
import { Storage } from '@webb-tools/storage';

export class PolkadotRelayerManager extends WebbRelayerManager<'polkadot'> {
  async mapRelayerIntoActive(
    relayer: OptionalRelayer,
    typedChainId: number
  ): Promise<OptionalActiveRelayer> {
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
    const { baseOn, chainId, contractAddress, ipService } = query;
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

      if (contractAddress && baseOn && chainId) {
        if (baseOn === 'evm') {
          return Boolean(
            capabilities.supportedChains[baseOn]
              .get(chainId)
              ?.contracts?.find(
                (contract) => contract.address === contractAddress.toLowerCase()
              )
          );
        }
      }

      if (baseOn && chainId) {
        return Boolean(capabilities.supportedChains[baseOn].get(chainId));
      }

      if (baseOn && !chainId) {
        console.log(capabilities.supportedChains, baseOn);

        return capabilities.supportedChains[baseOn].size > 0;
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

  async getRelayersByChainAndAddress(_chainId: number, _address: string) {
    return this.getRelayers({});
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

      /*       const treeData = await api.query.merkleTreeBn254.trees(treeId);
      if (treeData.isNone) {
        this.logger.error(
          WebbError.getErrorMessage(WebbErrorCodes.TreeNotFound).message
        );
        return null;
      }

      const treeMetadata = treeData.unwrap();

      const levels = treeMetadata.depth.toNumber();
      const lastRootHex = treeMetadata.root.toHex();

      // Fixed the last root to be 32 bytes
      const lastRoot = toFixedHex(lastRootHex);
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
      } */
    }

    return null;
  }
}
