import { useState } from 'react';
import Link from 'next/link';
import { TangleLogo, Typography } from '@webb-tools/webb-ui-components';
import { Close } from '@webb-tools/icons';
import { Navbar, InternalOrExternalLink } from '.';

export const Header = () => {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <header className="sticky flex flex-col top-0 z-50 bg-mono-0 min-h-[72px] webb-shadow-sm">

      {/* Banner */}
      {showBanner && (
        <div className="bg-[#624FBE] p-2 lg:order-2 relative">
          <Typography
            variant="mkt-utility"
            className="block text-center max-w-[80%] mx-auto !text-mono-0 !font-bold uppercase leading-[24px]"
          >
            TANGLE NETWORK CROWDLOAN IS HAPPENING SOON ✨ |{' '}
            <InternalOrExternalLink url="#" className="inline-block">
              <Typography
                variant="body1"
                className="!text-mono-0 capitalize underline"
              >
                Join Waitlist!
              </Typography>
            </InternalOrExternalLink>
          </Typography>
          <Close
            onClick={() => {
              setShowBanner(false);
            }}
            className="fill-mono-0 absolute top-1.5 right-2 md:right-5 w-6 h-6"
          />
        </div>
      )}

      {/* Nav */}
      <div className="w-full max-w-[1440px] mx-auto px-[20px] lg:px-0 py-4 lg:order-1">
        <div className="lg:px-[11.25%] flex items-center justify-between">
          <Link href="/">
            <TangleLogo hideNameOnMobile />
          </Link>
          <Navbar />
        </div>
      </div>
    </header>
  );
};
