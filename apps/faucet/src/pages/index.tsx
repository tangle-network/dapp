import { Footer, SideBar, Typography } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import type { GetServerSideProps } from 'next';
import { NextSeo, NextSeoProps } from 'next-seo';

import Header from '../components/Header';
import ProcessingModal from '../components/ProcessingModal';
import TwitterLink from '../components/TwitterLink';
import sideBarProps from '../constants/sidebar';
import InputsContainer from '../containers/InputsContainer';
import LoginWithTwitter from '../containers/LoginWithTwitter';
import {
  getSideBarStateFromCookie,
  setSideBarCookieOnToggle,
} from '../utils/sidebar';

interface PageProps {
  sideBarInitialState?: boolean;
}

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

export default function Page({ sideBarInitialState }: PageProps) {
  return (
    <div className="h-screen flex">
      <SideBar
        {...sideBarProps}
        isExpandedAtDefault={sideBarInitialState}
        onSideBarToggle={setSideBarCookieOnToggle}
        className="!z-0 hidden lg:block"
      />
      <main className="flex-[1] h-full overflow-y-auto">
        <div className="mx-3 md:mx-5 lg:mx-10 space-y-4">
          <Header />

          <main className="max-w-[100vw]">
            <NextSeo {...metadata} />

            {/** The Faucet Card */}
            <div
              className={cx(
                'px-4 md:px-12 py-12 max-w-[964px] rounded-2xl mx-auto',
                'border-4 border-mono-0 dark:border-mono-170',
                'bg-glass dark:bg-glass_dark'
              )}
              style={{ backdropFilter: 'blur(15px)' }}
            >
              <div className="max-w-[564px] mx-auto">
                {/** Static content */}
                <div className="flex flex-col gap-4">
                  <div>
                    <Typography
                      variant="mkt-small-caps"
                      className="font-black text-center text-blue-70"
                    >
                      Get tokens
                    </Typography>
                    <Typography
                      variant="mkt-h3"
                      className="font-black text-center text-mono-200"
                    >
                      Tangle Network Faucet
                    </Typography>
                  </div>
                  <Typography
                    variant="mkt-body1"
                    className="font-medium text-center text-mono-140"
                  >
                    Receive Test Tokens on Devnet and Testnet supported by
                    Tangle Network and Webb Protocol for development and
                    experimental purposes.
                  </Typography>
                  <Typography
                    variant="mkt-body1"
                    className="font-medium text-center text-mono-140"
                  >
                    Follow <TwitterLink />
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
          </main>

          <Footer isMinimal isNext className="py-12 mx-auto" />
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  req,
  res,
}) => {
  return {
    props: {
      sideBarInitialState: getSideBarStateFromCookie({ req, res }),
    },
  };
};
