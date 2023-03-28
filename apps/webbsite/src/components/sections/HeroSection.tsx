import { Button, Typography } from '@webb-tools/webb-ui-components';

const manifestoUrl = 'https://docs.webb.tools/docs/overview/privacy-manifesto/';

export const HeroSection = () => {
  return (
    <section className="absolute w-full -translate-y-1/3 top-1/4">
      <div className="max-w-[454px] md:max-w-[934px] space-y-2 p-4 mx-auto w-full lg:p-0 md:space-y-6">
        <Typography variant="mkt-h1" className="text-center text-mono-200">
          Privacy that Brings Blockchains Together{' '}
        </Typography>

        <Typography variant="mkt-body" className="text-center text-mono-180">
          Webb builds infrastructure for connecting zero-knowledge applications
          empowering developers to unlock user privacy in the Web3 ecosystem.
        </Typography>

        <Button
          href={manifestoUrl}
          target="_blank"
          rel="noreferrer"
          className="block mx-auto button-base button-primary"
        >
          Read the Manifesto
        </Button>
      </div>
    </section>
  );
};
