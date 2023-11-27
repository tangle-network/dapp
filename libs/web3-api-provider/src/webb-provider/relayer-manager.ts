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
import { BridgeStorage } from '@webb-tools/browser-utils/storage';
import Storage from '@webb-tools/dapp-types/Storage';
import type { Note } from '@webb-tools/sdk-core/note';
import {
  calculateTypedChainId,
  ChainType,
  parseTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';

import {
  NewNotesTxResult,
  TransactionExecutor,
  TransactionState,
} from '@webb-tools/abstract-api-provider';
import { VAnchor__factory } from '@webb-tools/contracts';
import { LOCALNET_CHAIN_IDS } from '@webb-tools/dapp-config';
import { GetContractReturnType, PublicClient } from 'viem';

export class Web3RelayerManager extends WebbRelayerManager<'web3', 'evm'> {
  cmdKey = 'evm' as const;

  mapRelayerIntoActive(
    relayer: OptionalRelayer,
    typedChainId: number
  ): OptionalActiveRelayer {
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
          return (
            Boolean(
              capabilities.supportedChains[baseOn]
                .get(typedChainId)
                ?.contracts?.find(
                  (contract) =>
                    contract.address === contractAddress.toLowerCase()
                )
            ) && capabilities.features.dataQuery
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

  getRelayersByChainAndAddress(typedChainId: number, address: string) {
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
   * @param treeHeight - The height of the merkle tree.
   * @param targetRoot - The target root of the merkle tree.
   * @param commitment - The commitment to find the index in the tree.
   * param abortSignal - A signal to abort the fetching process.
   */
  async fetchLeavesFromRelayers(
    relayers: WebbRelayer[],
    vanchorContract: GetContractReturnType<
      typeof VAnchor__factory.abi,
      PublicClient
    >,
    storage: Storage<BridgeStorage>,
    options: {
      treeHeight: number;
      targetRoot: string;
      commitment: bigint;
      tx?: TransactionExecutor<NewNotesTxResult>;
    }
  ): Promise<{
    provingLeaves: string[];
    commitmentIndex: number;
  } | null> {
    const { treeHeight, targetRoot, commitment, tx } = options;

    const sourceEvmId = await vanchorContract.read.getChainId();

    const typedChainId = calculateTypedChainId(
      ChainType.EVM,
      +sourceEvmId.toString()
    );

    // loop through the sourceRelayers to fetch leaves
    for (let i = 0; i < relayers.length; i++) {
      try {
        const { leaves, lastQueriedBlock } = await relayers[i].getLeaves(
          typedChainId,
          vanchorContract.address,
          tx?.cancelToken.abortSignal
        );

        console.log(
          `Got ${leaves.length} leaves from relayer ${relayers[i].endpoint}`
        );

        const result = await this.validateRelayerLeaves(
          treeHeight,
          leaves,
          targetRoot,
          commitment,
          tx
        );

        if (!result || result.commitmentIndex === -1) {
          continue;
        }

        // Cached all the leaves returned from the relayer to re-use later
        // if the chain id is not localnet
        if (!LOCALNET_CHAIN_IDS.includes(+`${sourceEvmId}`)) {
          await storage.set('lastQueriedBlock', lastQueriedBlock);
          await storage.set('leaves', leaves);
        }

        // Return the leaves for proving
        return result;
      } catch (e) {
        console.error('Error fetching leaves from relayer', e);
        tx?.next(TransactionState.ValidatingLeaves, false);
        continue;
      }
    }

    return null;
  }
}
