// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  OptionalActiveRelayer,
  OptionalRelayer,
  RelayerQuery,
  shuffleRelayers,
  WebbRelayer,
  WebbRelayerManager,
} from '@nepoche/abstract-api-provider/relayer';
import { BridgeStorage } from '@nepoche/browser-utils/storage';
import { WebbError, WebbErrorCodes } from '@nepoche/dapp-types/WebbError';
import { VAnchorContract } from '@nepoche/evm-contracts';
import { Storage } from '@nepoche/storage';
import { calculateTypedChainId, ChainType, MerkleTree, Note, parseTypedChainId } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';

export class Web3RelayerManager extends WebbRelayerManager {
  async mapRelayerIntoActive(relayer: OptionalRelayer, typedChainId: number): Promise<OptionalActiveRelayer> {
    if (!relayer) {
      return null;
    }

    return WebbRelayer.intoActiveWebRelayer(
      relayer,
      {
        basedOn: 'evm',
        typedChainId,
      },
      // Define the function for retrieving fee information for the relayer
      async (note: string) => {
        const depositNote = await Note.deserialize(note);
        const evmNote = depositNote.note;
        const typedChainId = Number(depositNote.note.targetChainId);
        const contractAddress = depositNote.note.targetIdentifyingData;

        // Given the note, iterate over the relayer's supported contracts and find the corresponding configuration
        // for the contract.
        const supportedContract = relayer.capabilities.supportedChains.evm
          .get(typedChainId)
          ?.contracts.find(({ address }) => {
            // Match on the relayer configuration as well as note
            return address.toLowerCase() === contractAddress.toLowerCase();
          });

        // The user somehow selected a relayer which does not support the mixer.
        // This should not be possible as only supported mixers should be selectable in the UI.
        if (!supportedContract) {
          throw WebbError.from(WebbErrorCodes.RelayerUnsupportedMixer);
        }

        const principleBig = ethers.utils.parseUnits(supportedContract.size.toString(), evmNote.denomination);
        const withdrawFeeMill = supportedContract.withdrawFeePercentage * 1000000;

        const withdrawFeeMillBig = ethers.BigNumber.from(withdrawFeeMill);
        const feeBigMill = principleBig.mul(withdrawFeeMillBig);

        const feeBig = feeBigMill.div(ethers.BigNumber.from(1000000));

        return {
          totalFees: feeBig.toString(),
          withdrawFeePercentage: supportedContract.withdrawFeePercentage,
        };
      }
    );
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
                (contract) => contract.address === contractAddress.toLowerCase() && contract.eventsWatcher.enabled
              )
          );
        }
      }

      if (query.contract && baseOn === 'evm' && typedChainId !== undefined) {
        const relayerIndex =
          capabilities.supportedChains['evm']
            .get(typedChainId)
            ?.contracts.findIndex((contract) => contract.contract === query.contract) ?? -1;
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
    contract: VAnchorContract,
    storage: Storage<BridgeStorage>,
    abortSignal: AbortSignal
  ): Promise<string[] | null> {
    let leaves: string[] = [];
    const sourceEvmId = await contract.getEvmId();
    const typedChainId = calculateTypedChainId(ChainType.EVM, sourceEvmId);

    // loop through the sourceRelayers to fetch leaves
    for (let i = 0; i < relayers.length; i++) {
      const relayerLeaves = await relayers[i].getLeaves(typedChainId, contract.inner.address, abortSignal);

      const validLatestLeaf = await contract.leafCreatedAtBlock(
        relayerLeaves.leaves[relayerLeaves.leaves.length - 1],
        relayerLeaves.lastQueriedBlock
      );

      // leaves from relayer somewhat validated, attempt to build the tree
      if (validLatestLeaf) {
        // Assume the destination anchor has the same levels as source anchor
        const levels = await contract.inner.levels();
        const tree = MerkleTree.createTreeWithRoot(levels, relayerLeaves.leaves, await contract.getLastRoot());

        // If we were able to build the tree, set local storage and break out of the loop
        if (tree) {
          leaves = relayerLeaves.leaves;

          await storage.set(contract.inner.address.toLowerCase(), {
            lastQueriedBlock: relayerLeaves.lastQueriedBlock,
            leaves: relayerLeaves.leaves,
          });

          return leaves;
        }
      }
    }

    return null;
  }
}
