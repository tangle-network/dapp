import { VANCHORS_MAP, VANCHOR_ADDRESSES } from '../../constants';
import { ShieldedPoolType } from '../../components/ShieldedPoolsTable/types';
import { getTvlByVAnchor, getDeposit24hByVAnchor } from '../utils';

const getPoolInfoFromVAnchor = async (vAnchorAddress: string) => {
  const vAnchor = VANCHORS_MAP[vAnchorAddress];

  // plus one for fungible token
  const tokenNum = vAnchor.composition.length + 1;

  const deposits24h = await getDeposit24hByVAnchor(vAnchorAddress);
  const tvl = await getTvlByVAnchor(vAnchorAddress);

  return {
    address: vAnchorAddress,
    symbol: vAnchor.fungibleTokenName,
    poolType: vAnchor.poolType,
    token: tokenNum,
    deposits24h,
    tvl,
    currency: vAnchor.fungibleTokenSymbol,
    typedChainIds: vAnchor.supportedChains,
  };
};

export default async function getShieldedPoolsTableData(): Promise<
  ShieldedPoolType[]
> {
  return await Promise.all(
    VANCHOR_ADDRESSES.map((vAnchor) => getPoolInfoFromVAnchor(vAnchor))
  );
}
