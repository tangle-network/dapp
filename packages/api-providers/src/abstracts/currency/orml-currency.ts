// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { LoggerService } from '@webb-tools/app-util';

import { WebbPolkadot } from '../../polkadot';

export type ORMLAsset = {
  existentialDeposit: string;
  locked: false;
  name: string;
  id: string;
};

const logger = LoggerService.get('currencies');

export class ORMLCurrency {
  constructor(private api: WebbPolkadot) {}

  async list() {
    let assets;

    try {
      assets = await this.api.api.query.assetRegistry.assets.entries();
    } catch (ex) {
      console.log('tried to get assets from a chain without support');
      return [];
    }

    return assets.map(([storageKey, i]) => ({
      // @ts-ignore
      ...i.toHuman(),
      // @ts-ignore
      id: storageKey.toHuman()[0] as string,
    })) as ORMLAsset[];
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
