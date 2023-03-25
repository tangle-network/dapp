import cx from 'classnames';
import { Metadata } from 'next';

import { Typography } from '../components';

export const metadata: Metadata = {
  keywords: ['Faucet', 'Webb Faucet', 'Webb Protocol', 'Crypto Faucet'],
  creator: 'Webb Developers',
};

const Page = () => {
  return (
    <div className={cx('max-w-[100vw] min-h-[1373px]', 'hero-bg')}>
      <Typography variant="h1">Faucet</Typography>
    </div>
  );
};

export default Page;
