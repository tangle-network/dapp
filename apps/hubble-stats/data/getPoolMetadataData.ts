import { randNumber, randEthereumAddress } from '@ngneat/falso';

type PoolMetadataDataType = {
  name: string;
  symbol: string;
  signatureBridge: string;
  vAnchor: string;
  fungibleToken: string;
  treasuryAddress: string;
  wrappingFees: number;
  creationDate: string;
};

export default async function getPoolMetadataData(
  poolAddress: string
): Promise<PoolMetadataDataType> {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    name: 'Webb Parachain',
    symbol: 'webbPRC',
    signatureBridge: randEthereumAddress(),
    vAnchor: randEthereumAddress(),
    fungibleToken: randEthereumAddress(),
    treasuryAddress: randEthereumAddress(),
    wrappingFees: randNumber({ min: 1, max: 99 }),
    creationDate: '13 August 2023',
  };
}
