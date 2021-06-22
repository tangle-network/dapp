import { EvmChainStorage } from '@webb-dapp/apps/configs/storages/evm-chain-storage.interface';
import { StorageHandler } from '@webb-dapp/utils';
import { EVMStorage } from '@webb-dapp/react-environment/api-providers/web3';

const rinkebyStore = new EvmChainStorage([
  {
    size: 0.1,
    address: '0x876eCe69618e8E8dd743250B036785813824D2D7',
    symbol: 'ETH',
  },
]);

const ethMainNet = new EvmChainStorage([
  {
    size: 0.1,
    address: '0x876eCe69618e8E8dd743250B036785813824D2D7',
    symbol: 'ETH',
  },
]);

const beresheet = new EvmChainStorage([
  {
    size: 10,
    address: '0x5f771fc87F87DB48C9fB11aA228D833226580689',
    symbol: 'tEDG',
  },
  {
    size: 100,
    address: '0x2ee2e51cab1561E4482cacc8Be8b46CE61E46991',
    symbol: 'tEDG',
  },
  {
    size: 1000,
    address: '0x5696b4AfBc169454d7FA26e0a41828d445CFae20',
    symbol: 'tEDG',
  },
  {
    size: 10000,
    address: '0x626FEc5Ffa7Bf1EE8CEd7daBdE545630473E3ABb',
    symbol: 'tEDG',
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

export const rinkebyStorage: StorageHandler<EVMStorage> = {
  ...defaultHandler,
  inner: {
    nativeAnchor: rinkebyStore,
  },
};

export const mainStorage: StorageHandler<EVMStorage> = {
  ...defaultHandler,
  inner: {
    nativeAnchor: ethMainNet,
  },
};

export const beresheetStorage: StorageHandler<EVMStorage> = {
  ...defaultHandler,
  inner: {
    nativeAnchor: beresheet,
  }
}
