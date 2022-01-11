import { WebbPolkadot } from '@webb-dapp/react-environment/api-providers';
import { LoggerService } from '@webb-tools/app-util';

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
    const assets = await this.api.api.query.assetRegistry.assets.entries();
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
    console.log(this.api.accounts);
    if (activeAccount) {
      const ormlBalances = await this.api.api.query.tokens.accounts.entries(activeAccount.address);
      logger.info(`ORML Balances ${ormlBalances.length}`, ormlBalances);
      return ormlBalances.map(([storageKey, balance]) => {
        const currencyId = storageKey.toHuman()[0];
        return {
          id: currencyId,
          balance: balance.toHuman(),
        };
      });
    }
    return [];
  }
}
