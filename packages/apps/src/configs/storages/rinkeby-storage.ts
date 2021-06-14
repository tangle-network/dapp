import { EvmChainStorage } from '@webb-dapp/apps/configs/storages/evm-chain-storage.inerface';
import { StorageHandler } from '@webb-dapp/utils';

const rainkebyStore = new EvmChainStorage([
  {
    size: 0.1,
    address: 'adsfadsfdsf',
  },
]);

const ethMainNet = new EvmChainStorage([
  {
    size: 0.1,
    address: 'adsfadsfdsf',
  },
]);

const defaultHandler = {
  async fetch(key: string): Promise<EvmChainStorage> {
    const data = localStorage.getItem(key);
    if (!data) {
      return new EvmChainStorage([]);
    }
    const address = JSON.parse(data).contractsAddresses;
    return new EvmChainStorage(address);
  },
  async commit(key: string, data: EvmChainStorage): Promise<void> {
    localStorage.setItem(key, JSON.stringify(data.contractsAddresses));
  },
};

export const rankebyStorage: StorageHandler<EvmChainStorage> = {
  ...defaultHandler,
  inner: rainkebyStore,
};

export const ethMainNetHandler: StorageHandler<EvmChainStorage> = {
  ...defaultHandler,
  inner: ethMainNet,
};
