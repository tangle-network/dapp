import NetworkTablesCmp from './NetworkTablesCmp';
import { getNetworkTablesData } from '../../data';

export default async function NetworkTablesContainer({
  poolAddress,
}: {
  poolAddress: string;
}) {
  const { tvlData, relayerEarningsData, networkTokenData, typedChainIds } =
    await getNetworkTablesData(poolAddress);

  return (
    <NetworkTablesCmp
      tvlData={tvlData}
      relayerEarningsData={relayerEarningsData}
      networkTokenData={networkTokenData}
      typedChainIds={typedChainIds}
    />
  );
}
