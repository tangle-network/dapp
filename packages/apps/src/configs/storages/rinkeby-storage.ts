import { EvmChainStorage } from '@webb-dapp/apps/configs/storages/evm-chain-storage.inerface';
import { StorageHandler } from '@webb-dapp/utils';
import { EVMStorage } from '@webb-dapp/react-environment/api-providers/web3';

const rainkebyStore = new EvmChainStorage([
  {
    size: 0.1,
    address: '0x876eCe69618e8E8dd743250B036785813824D2D7',
  },
]);

const ethMainNet = new EvmChainStorage([
  {
    size: 0.1,
    address: '0x876eCe69618e8E8dd743250B036785813824D2D7',
  },
]);

const defaultHandler: Omit<StorageHandler<EVMStorage>, 'inner'> = {
  async fetch(key: string) {
    const data = localStorage.getItem(key);
    if (!data) {
      return {
        nativeAnchor: new EvmChainStorage([]),
      };
    }
    const address = JSON.parse(data).contractsAddresses;
    return {
      nativeAnchor: new EvmChainStorage(address),
    };
  },
  async commit(key: string, data) {
    localStorage.setItem(key, JSON.stringify(data.contractsAddresses));
  },
};

export const rankebyStorage: StorageHandler<EVMStorage> = {
  ...defaultHandler,
  inner: {
    nativeAnchor: rainkebyStore,
  },
};

export const mainStorage: StorageHandler<EVMStorage> = {
  ...defaultHandler,
  inner: {
    nativeAnchor: ethMainNet,
  },
};
