export enum ChainType {
  None = 0,
  EVM = 256,
  Substrate = 512,
  SubstrateDevelopment = 592,
  PolkadotRelayChain = 769,
  KusamaRelayChain = 770,
  PolkadotParachain = 784,
  KusamaParachain = 785,
  Cosmos = 1024,
  Solana = 1280,
}

export const numToByteArray = (num: number, min: number): number[] => {
  let arr: number[] = [];

  while (num > 0) {
    arr.push(num % 256);
    num = Math.floor(num / 256);
  }

  arr.reverse();

  // maintain minimum number of bytes
  while (arr.length < min) {
    arr = [0, ...arr];
  }

  return arr;
};

export const byteArrayToNum = (arr: number[]): number => {
  let n = 0;

  for (const i of arr) {
    n = n * 256 + i;
  }

  return n;
};

export function toFixedHex(
  number: number | string | bigint | Buffer,
  length = 32,
): string {
  let result =
    '0x' +
    (number instanceof Buffer
      ? number.toString('hex')
      : BigInt(number).toString(16).replace('0x', '')
    ).padStart(length * 2, '0');

  if (result.indexOf('-') > -1) {
    result = '-' + result.replace('-', '');
  }

  return result;
}

export const getChainIdType = (chainID = 31337): number => {
  const CHAIN_TYPE = '0x0100';
  const chainIdType = CHAIN_TYPE + toFixedHex(chainID, 4).substr(2);
  return Number(BigInt(chainIdType));
};

export const calculateTypedChainId = (
  chainType: ChainType,
  chainId: number,
): number => {
  const chainTypeArray = numToByteArray(chainType, 2);
  const chainIdArray = numToByteArray(chainId, 4);
  const fullArray = [...chainTypeArray, ...chainIdArray];

  return byteArrayToNum(fullArray);
};

export const parseTypedChainId = (chainIdType: number) => {
  const byteArray = numToByteArray(chainIdType, 4);
  const chainType = byteArrayToNum(byteArray.slice(0, 2));
  const chainId = byteArrayToNum(byteArray.slice(2));

  return { chainId, chainType };
};
