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
          'bg-[linear-gradient(180deg,_rgba(255,255,255,0.2)_0%,_rgba(255,255,255,0)_100%)]',
          'drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-lg	',
          'border-4 border-mono-0'
        )}
      >
        <div className="max-w-[564px] mx-auto">
          {/** Static content */}
          <div className="flex flex-col gap-4">
            <div>
              <h5 className="text-center link-sm font-satoshi-var">
                Get tokens
              </h5>
              <h1 className="text-center title font-satoshi-var">
                Hubble Bridge Faucet
              </h1>
            </div>
            <p className="text-center font-satoshi-var body">
              This faucet enables the transfer of Test Tokens (wtTNT) on
              networks supported by Hubble Bridge.
            </p>
            <p className="text-center font-satoshi-var body">
              To receive tokens, follow <TwitterLink />
              {
                " on Twitter and authenticate yourself by clicking the 'Login with Twitter' below to start the process. *You can claim faucet every 24 hours on each network."
              }
            </p>
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
