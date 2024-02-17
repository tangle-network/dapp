import type { Service } from '../../types';

const participationArr = new Array(5).fill(
  '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy'
);

export default async function getPastServicesByValidator(): Promise<Service[]> {
  return [
    {
      serviceType: 'zksaas (groth16)',
      roleType: 'ZkSaaS',
      initialJobId: 123,
      participants: participationArr,
      thresholds: 3,
      earnings: 10,
      expirationBlock: 456,
    },
    {
      serviceType: 'DKG/TSS (cggmp)',
      roleType: 'Tss',
      initialJobId: 124,
      participants: participationArr,
      phase2Executions: 5,
      earnings: 10,
      expirationBlock: 456,
    },
    {
      serviceType: 'Tx Relay',
      roleType: 'TxRelay',
      initialJobId: 125,
      participants: participationArr,
      expirationBlock: 456,
    },
  ];
}
