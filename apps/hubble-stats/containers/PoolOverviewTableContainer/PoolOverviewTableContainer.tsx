import PoolOverviewTableCmp from './PoolOverviewTableCmp';
import { getPoolOverviewTableData } from '../../data';

export default async function PoolOverviewTableContainer({
  poolAddress,
}: {
  poolAddress: string;
}) {
  const {
    deposit24hData,
    withdrawal24hData,
    relayerEarningsData,
    typedChainIds,
  } = await getPoolOverviewTableData(poolAddress);

  return (
    <PoolOverviewTableCmp
      deposit24hData={deposit24hData}
      withdrawal24hData={withdrawal24hData}
      relayerEarningsData={relayerEarningsData}
      typedChainIds={typedChainIds}
    />
  );
}
