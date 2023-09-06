import PoolWrappingTableCmp from './PoolWrappingTableCmp';
import { getPoolWrappingTableData } from '../../data';

export default async function PoolWrappingTableContainer({
  poolAddress,
}: {
  poolAddress: string;
}) {
  const { twlData, wrappingFeesData, typedChainIds } =
    await getPoolWrappingTableData(poolAddress);

  return (
    <PoolWrappingTableCmp
      twlData={twlData}
      wrappingFeesData={wrappingFeesData}
      typedChainIds={typedChainIds}
    />
  );
}
