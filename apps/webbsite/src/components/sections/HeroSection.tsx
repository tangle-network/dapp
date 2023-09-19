import { Button, Typography } from '@webb-tools/webb-ui-components';
import { WEBB_DOC_ROUTES_RECORD } from '@webb-tools/webb-ui-components/constants';
import populateDocsUrl from '@webb-tools/webb-ui-components/utils/populateDocsUrl';
import { twMerge } from 'tailwind-merge';

const manifestoUrl = populateDocsUrl(
  WEBB_DOC_ROUTES_RECORD.overview['privacy-manifesto']
);

export const HeroSection = () => {
  return (
    <section
      className={twMerge(
        'z-10 space-y-2 p-4 mx-auto w-full lg:p-0 md:space-y-6',
        'max-w-[454px] md:max-w-[934px] relative -top-[var(--header-height)]'
      )}
    >
      <Typography
        variant="mkt-h1"
        className="font-black text-center text-mono-200"
      >
        Privacy that Brings Blockchains Together{' '}
      </Typography>

      <Typography
        variant="mkt-subheading"
        className="text-center text-mono-140 font-medium !mt-[24px]"
      >
        Webb builds infrastructure for connecting zero-knowledge applications
        empowering developers to unlock user privacy in the Web3 ecosystem.
      </Typography>

      <Button
        href={manifestoUrl}
        target="_blank"
        rel="noreferrer"
        className="block mx-auto button-base button-primary !mt-[24px]"
      >
        Read the Manifesto
      </Button>
    </section>
  );
};
