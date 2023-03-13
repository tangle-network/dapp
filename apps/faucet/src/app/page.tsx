import { Typography } from '../components';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  keywords: ['Faucet', 'Webb Faucet', 'Webb Protocol', 'Crypto Faucet'],
  creator: 'Webb Developers',
};

const Page = () => {
  return (
    <Typography variant="h1" className="text-red-60">
      App dir
    </Typography>
  );
};

export default Page;
