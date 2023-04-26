import { Typography } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { NextSeo, NextSeoProps } from 'next-seo';

import ProcessingModal from '../components/ProcessingModal';
import TwitterLink from '../components/TwitterLink';
import InputsContainer from '../containers/InputsContainer';
import LoginWithTwitter from '../containers/LoginWithTwitter';

export const metadata: NextSeoProps = {
  additionalMetaTags: [
    {
      content: 'Faucet, Webb Faucet, Webb Protocol, Crypto Faucet',
      property: 'keywords',
    },
    {
      content: 'Webb Developers',
      property: 'author',
    },
  ],
};

const Page = () => {
  return (
    <div className={cx('max-w-[100vw] min-h-[1373px] py-9', 'hero-bg')}>
      <NextSeo {...metadata} />

      {/** The Faucet Card */}
      <div
        className={cx(
          'px-12 py-9 max-w-[956px] rounded-2xl mx-auto',
          'border-4 border-mono-0'
        )}
        style={{
          backdropFilter: 'blur(15px)',
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)',
        }}
      >
        <div className="max-w-[564px] mx-auto">
          {/** Static content */}
          <div className="flex flex-col gap-4">
            <div>
              <Typography
                component="h5"
                variant="mkt-quote"
                className="text-center"
              >
                Get tokens
              </Typography>
              <Typography
                component="h1"
                variant="mkt-h2"
                className="text-center"
              >
                Hubble Bridge Faucet
              </Typography>
            </div>
            <Typography variant="mkt-caption" className="text-center">
              This faucet enables the transfer of Test Tokens (wtTNT) on
              networks supported by Hubble Bridge.
            </Typography>
            <Typography variant="mkt-caption" className="text-center">
              To receive tokens, follow <TwitterLink />
              {
                " on Twitter and authenticate yourself by clicking the 'Login with Twitter' below to start the process. *You can claim faucet every 24 hours on each network."
              }
            </Typography>
          </div>

          {/** Logic content */}
          <div className="mt-16 space-y-8">
            <LoginWithTwitter />
            <InputsContainer />
          </div>
        </div>
      </div>

      <ProcessingModal />
    </div>
  );
};

export default Page;
