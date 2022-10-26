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
import { Note } from '@webb-tools/sdk-core';

export class PolkadotRelayerManager extends WebbRelayerManager {
  async mapRelayerIntoActive(relayer: OptionalRelayer, typedChainId: number): Promise<OptionalActiveRelayer> {
    if (!relayer) {
      return null;
    }

    return WebbRelayer.intoActiveWebRelayer(
      relayer,
      {
        basedOn: 'substrate',
        typedChainId,
      },
      async () => {
        return {
          totalFees: '0',
          withdrawFeePercentage: 0,
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
    const { baseOn, chainId, contractAddress, ipService } = query;
    const relayers = this.relayers.filter((relayer) => {
      const capabilities = relayer.capabilities;

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
                (contract) => contract.address === contractAddress.toLowerCase() && contract.eventsWatcher.enabled
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
}
