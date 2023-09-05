import NetworkTablesCmp from './NetworkTablesCmp';
import { getNetworkTablesData } from '../../data';

export default async function NetworkTablesContainer({
  poolAddress,
}: {
  poolAddress: string;
}) {
  const {
    deposit24hData,
    withdrawal24hData,
    relayerEarningsData,
    twlData,
    wrappingFeesData,
    typedChainIds,
  } = await getNetworkTablesData(poolAddress);

  return (
    <NetworkTablesCmp
      deposit24hData={deposit24hData}
      withdrawal24hData={withdrawal24hData}
      relayerEarningsData={relayerEarningsData}
      twlData={twlData}
      wrappingFeesData={wrappingFeesData}
      typedChainIds={typedChainIds}
    />
  );
}
