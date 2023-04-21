import { Socials } from '@webb-tools/webb-ui-components';

import { Heading, SectionDescription, LinkButton } from '..';
import { STATS_DEV_URL, WEBB_DOCS_URL } from '../../constants';

export const HeroSection = () => {
  return (
    <section>
      <div className="max-w-[1440px] mx-auto flex flex-col items-stretch lg:flex-row md:px-4 lg:px-6">
        <div className="flex-1 flex items-center bg-purple-10 px-5 py-16 md:py-32 md:pl-4 md:pr-36 lg:p-0">
          <div className="flex flex-col gap-8 lg:w-[65%] lg:ml-[calc(11.25vw_-_25px)]">
            <Heading className="w-3/5 text-mono-200">Tangle Network</Heading>
            <SectionDescription>
              The next-generation TSS based blockchain powering cross-chain
              zero-knowledge messaging and applications.
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
        <div className="bg-hero_section w-full flex-1 bg-cover bg-no-repeat bg-center object-fill min-h-[459.98px] md:min-h-[791px] lg:border" />
      </div>
    </section>
  );
};
