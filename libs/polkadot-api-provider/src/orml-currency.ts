// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { LoggerService } from '@webb-tools/app-util';

import { WebbPolkadot } from './webb-provider';

export type ORMLAsset = {
  existentialDeposit: string;
  locked: false;
  name: string;
  id: string;
};

const logger = LoggerService.get('currencies');

export class ORMLCurrency {
  constructor(private api: WebbPolkadot) {}

  async list(): Promise<ORMLAsset[]> {
    if (!this.api.api.query.assetRegistry) {
      console.log('tried to get assets from a chain without support');
      return [];
    }
    let assets = await this.api.api.query.assetRegistry.assets.entries();

    return assets
      .map(([storageKey, i]) => {
        if (i) {
          let assetRegistryValues = i.unwrap();
          return {
            name: assetRegistryValues.name.toString(),
            existentialDeposit: assetRegistryValues.existentialDeposit.toString(),
            locked: assetRegistryValues.locked.toJSON(),
            id: storageKey[0].toString(),
          } as ORMLAsset;
        }
      })
      .filter((entry): entry is ORMLAsset => entry !== undefined);
  }

  async getBalance() {
    const activeAccount = await this.api.accounts.activeOrDefault;

    logger.info('active account', activeAccount);

    if (activeAccount) {
      const ormlBalances = await this.api.api.query.tokens.accounts.entries(activeAccount.address);

      logger.info(`ORML Balances ${ormlBalances.length}`, ormlBalances);

      return ormlBalances.map(([storageKey, balance]) => {
        const currencyId = storageKey[0];

        return {
          balance: balance.toHuman(),
          id: currencyId,
        };
      });
    }

    return [];
  }
}
