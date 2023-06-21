import Image from 'next/image';
import { Socials, Typography } from '@webb-tools/webb-ui-components';
import {
  WEBB_DOCS_URL,
  STATS_URL,
} from '@webb-tools/webb-ui-components/constants';

import { LinkButton } from '..';

export const HeroSection = () => {
  return (
    <section>
      <div className="flex flex-col items-stretch mx-auto lg:flex-row md:px-0">
        <div className="flex items-center justify-end flex-1 px-5 py-16 bg-purple-10 md:py-32 lg:py-0 lg:px-0">
          <div className="lg:w-full lg:max-w-[716px]">
            <div className="flex flex-col gap-8 md:w-[80%] lg:w-[65%] lg:ml-[22.5%]">
              <Typography
                variant="mkt-h2"
                className="w-3/5 font-black text-mono-200"
              >
                Tangle Network
              </Typography>
              <Typography
                variant="mkt-subheading"
                className="font-medium text-mono-140"
              >
                The next-generation blockchain for seamless and private
                cross-chain messaging and applications.
              </Typography>
              <div className="flex gap-4">
                <LinkButton
                  href={WEBB_DOCS_URL}
                  variant="secondary"
                  className="bg-inherit"
                >
                  Read Docs
                </LinkButton>
                <LinkButton href={STATS_URL}>View Network</LinkButton>
              </div>
              <Socials />
            </div>
          </div>
        </div>
        <div className="relative aspect-[864/765] w-full flex-1">
          <Image src={'/static/assets/hero-banner.jpeg'} alt="hero-img" fill />
        </div>
      </div>
    </section>
  );
};
