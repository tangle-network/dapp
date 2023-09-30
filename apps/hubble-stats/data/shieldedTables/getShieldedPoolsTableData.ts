import { VANCHORS_MAP, VANCHOR_ADDRESSES } from '../../constants';
import { ShieldedPoolType } from '../../components/ShieldedPoolsTable/types';
import { getTvlByVAnchor, getDepositInTimeRangeByVAnchor } from '../utils';
import { EPOCH_DAY_INTERVAL } from '../../utils';

const getPoolInfoFromVAnchor = async (
  vAnchorAddress: string,
  epochNow: number
) => {
  const vAnchor = VANCHORS_MAP[vAnchorAddress];

  // plus one for fungible token
  const tokenNum = vAnchor.composition.length + 1;

  const deposits24h = await getDepositInTimeRangeByVAnchor(
    vAnchorAddress,
    epochNow - EPOCH_DAY_INTERVAL,
    epochNow
  );
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

export default async function getShieldedPoolsTableData(
  epochNow: number
): Promise<ShieldedPoolType[]> {
  return await Promise.all(
    VANCHOR_ADDRESSES.map((vAnchor) =>
      getPoolInfoFromVAnchor(vAnchor, epochNow)
    )
  );
}
