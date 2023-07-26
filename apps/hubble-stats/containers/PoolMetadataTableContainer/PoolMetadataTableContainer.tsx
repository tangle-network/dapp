'use client';

import { Typography } from '@webb-tools/webb-ui-components';

import { PoolMetadataTable } from '../../components';
import { PoolAttributeType } from '../../components/PoolMetadataTable/types';

const metadata: PoolAttributeType[] = [
  {
    name: 'Pool name',
  },
  {
    name: 'Pool symbol',
  },
  {
    name: 'Signature Bridge',
    isAddress: true,
    externalLink: '#',
  },
  {
    name: 'VAnchor',
    isAddress: true,
    externalLink: '#',
  },
  {
    name: 'Fungible Token',
    isAddress: true,
    externalLink: '#',
  },
  {
    name: 'Treasury Address',
    isAddress: true,
    externalLink: '#',
  },
  {
    name: 'Wrapping Fees',
  },
  {
    name: 'Creation date',
  },
];

const PoolMetadataTableContainer = () => {
  return (
    <div className="space-y-4">
      <Typography variant="h5" fw="black">
        Pool Metadata
      </Typography>
      <PoolMetadataTable data={metadata} />
    </div>
  );
};

export default PoolMetadataTableContainer;
