import { Typography } from '@webb-tools/webb-ui-components';
import { NextSeo, NextSeoProps } from 'next-seo';

const metadata: NextSeoProps = {
  additionalMetaTags: [
    {
      property: 'keywords',
      content: 'Faucet,Webb Faucet,Webb Protocol,Crypto Faucet',
    },
    {
      property: 'creator',
      content: 'Webb Developers',
    },
  ],
};

export function Index() {
  return (
    <>
      <NextSeo {...metadata} />

      <Typography variant="h1" className="text-blue-50">
        Welcome to Webb Faucet!
      </Typography>
    </>
  );
}

export default Index;
