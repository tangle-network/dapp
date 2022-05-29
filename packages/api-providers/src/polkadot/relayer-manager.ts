// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Note } from '@webb-tools/sdk-core';

import { OptionalActiveRelayer, OptionalRelayer, RelayerQuery, shuffleRelayers, WebbRelayer } from '../abstracts';
import { WebbRelayerManager } from '../abstracts/relayer/webb-relayer-manager';
import { InternalChainId } from '../chains';
import { getFixedAnchorAddressForBridge, webbCurrencyIdFromString } from '..';

export class PolkadotRelayerManager extends WebbRelayerManager {
  async mapRelayerIntoActive(
    relayer: OptionalRelayer,
    internalChainId: InternalChainId
  ): Promise<OptionalActiveRelayer> {
    if (!relayer) {
      return null;
    }

    return WebbRelayer.intoActiveWebRelayer(
      relayer,
      {
        basedOn: 'substrate',
        chain: internalChainId,
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
    const { baseOn, bridgeSupport, chainId, contractAddress, ipService } = query;
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

      if (bridgeSupport && baseOn && chainId) {
        if (baseOn === 'evm') {
          const anchorAddress = getFixedAnchorAddressForBridge(
            webbCurrencyIdFromString(bridgeSupport.tokenSymbol),
            chainId,
            bridgeSupport.amount,
            this.config.bridgeByAsset
          );

          if (anchorAddress) {
            return Boolean(
              capabilities.supportedChains[baseOn]
                .get(chainId)
                ?.contracts?.find((contract) => contract.address === anchorAddress.toLowerCase())
            );
          } else {
            return false;
          }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getRelayersByChainAndAddress(_chainId: InternalChainId, _address: string) {
    return this.getRelayers({});
  }
}
