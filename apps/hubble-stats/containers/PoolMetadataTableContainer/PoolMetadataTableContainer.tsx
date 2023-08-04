import { Typography } from '@webb-tools/webb-ui-components';

import { PoolMetadataTable } from '../../components';
import { PoolAttributeType } from '../../components/PoolMetadataTable/types';
import { getPoolMetadataData } from '../../data';

export default async function PoolMetadataTableContainer({
  poolAddress,
}: {
  poolAddress: string;
}) {
  const {
    name,
    symbol,
    signatureBridge,
    vAnchor,
    fungibleToken,
    treasuryAddress,
    wrappingFees,
    creationDate,
  } = await getPoolMetadataData(poolAddress);

  const metadata: PoolAttributeType[] = [
    {
      name: 'Pool name',
      detail: name,
    },
    {
      name: 'Pool symbol',
      detail: symbol,
    },
    {
      name: 'Signature Bridge',
      detail: signatureBridge,
      isAddress: true,
      externalLink: '#',
    },
    {
      name: 'VAnchor',
      detail: vAnchor,
      isAddress: true,
      externalLink: '#',
    },
    {
      name: 'Fungible Token',
      detail: fungibleToken,
      isAddress: true,
      externalLink: '#',
    },
    {
      name: 'Treasury Address',
      detail: treasuryAddress,
      isAddress: true,
      externalLink: '#',
    },
    {
      name: 'Wrapping Fees',
      detail: `${wrappingFees}%`,
    },
    {
      name: 'Creation date',
      detail: creationDate,
    },
  ];

  return (
    <div className="space-y-4">
      <Typography variant="h5" fw="black">
        Pool Metadata
      </Typography>
      <PoolMetadataTable data={metadata} />
    </div>
  );
}
