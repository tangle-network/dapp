import Image from 'next/image';
import { Socials } from '@webb-tools/webb-ui-components';

import { Heading, SectionDescription, LinkButton } from '..';
import { STATS_DEV_URL, WEBB_DOCS_URL } from '../../constants';

export const HeroSection = () => {
  return (
    <section>
      <div className="mx-auto flex flex-col items-stretch lg:flex-row md:px-0">
        <div className="flex-1 flex items-center justify-end bg-purple-10 px-5 py-16 md:py-32 lg:px-0">
          <div className="lg:w-[716px]">
            <div className="flex flex-col gap-8 md:w-[80%] lg:w-[65%] lg:ml-[22.5%]">
              <Heading className="w-3/5 text-mono-200">Tangle Network</Heading>
              <SectionDescription>
                The next-generation blockchain for seamless and private
                cross-chain messaging and applications.
              </SectionDescription>
              <div className="flex gap-4">
                <LinkButton
                  href={WEBB_DOCS_URL}
                  variant="secondary"
                  className="bg-inherit"
                >
                  Read Docs
                </LinkButton>
                <LinkButton href={STATS_DEV_URL}>View Network</LinkButton>
              </div>
              <Socials />
            </div>
          </div>
        </div>
        <div className="relative aspect-[428/460] w-full flex-1">
          <Image src={'/static/assets/hero-section.jpg'} alt="hero-img" fill />
        </div>
      </div>
    </section>
  );
};
