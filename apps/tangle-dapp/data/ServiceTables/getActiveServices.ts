import { type Service, ServiceType } from '../../types';

const participationArr = new Array(5).fill(
  '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy'
);

export default async function getActiveServices(): Promise<Service[]> {
  return [
    {
      id: 123,
      serviceType: ServiceType.ZK_SAAS_GROTH16,
      participants: participationArr,
      thresholds: 3,
      earnings: 10,
      expirationBlock: 456,
    },
    {
      id: 124,
      serviceType: ServiceType.TSS_ZENGOGG20SECP256K1,
      participants: participationArr,
      phase2Executions: 5,
      earnings: 10,
      expirationBlock: 456,
    },
    {
      id: 125,
      serviceType: ServiceType.LIGHT_CLIENT_RELAYING,
      participants: participationArr,
      expirationBlock: 456,
    },
    {
      id: 126,
      serviceType: ServiceType.ZK_SAAS_MARLIN,
      participants: participationArr,
      thresholds: 3,
      earnings: 10,
      expirationBlock: 456,
    },
    {
      id: 127,
      serviceType: ServiceType.LIGHT_CLIENT_RELAYING,
      participants: participationArr,
      expirationBlock: 456,
    },
  ];
}
