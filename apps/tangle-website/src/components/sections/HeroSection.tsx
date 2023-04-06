import { Button, Socials } from '@webb-tools/webb-ui-components';

import { Heading, SectionDescription } from '..';
import { STATS_DEV_URL, WEBB_DOCS_URL } from '../../constants';

export const HeroSection = () => {
  return (
    <section className="flex flex-col items-stretch w-full lg:flex-row md:px-4 lg:px-6">
      <div className="flex-1 bg-purple-10 flex justify-center items-center py-16 px-[25px] md:py-32 md:pl-4 md:pr-36 lg:p-0">
        <div className="flex flex-col gap-8 lg:w-[65%]">
          <Heading className="w-3/5 text-mono-200">Tangle Network</Heading>
          <SectionDescription>
            The next-generation TSS based blockchain powering cross-chain
            zero-knowledge messaging and applications.
          </SectionDescription>
          <div className="flex gap-4">
            <Button
              href={WEBB_DOCS_URL}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
              className="button-base-2 bg-inherit"
            >
              Read Docs
            </Button>
            <Button
              href={STATS_DEV_URL}
              target="_blank"
              rel="noreferrer"
              className="button-base-2"
            >
              View Network
            </Button>
          </div>
          <Socials />
        </div>
      </div>
      <div className="bg-hero_section w-full flex-1 bg-cover bg-no-repeat bg-center object-fill min-h-[459.98px] md:min-h-[791px] lg:border" />
    </section>
  );
};
