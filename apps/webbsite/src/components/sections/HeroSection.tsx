import { Button } from '@webb-tools/webb-ui-components';
import { Heading1, SubHeading1 } from '../../components';

const manifestoUrl = 'https://docs.webb.tools/docs/overview/privacy-manifesto/';

export const HeroSection = () => {
  return (
    <section className="absolute w-full -translate-y-1/3 top-1/4">
      <div className="max-w-[454px] md:max-w-[934px] space-y-2 p-4 mx-auto w-full lg:p-0 md:space-y-6">
        <Heading1 className="text-center text-mono-200">
          Privacy that Brings Blockchains Together{' '}
        </Heading1>

        <SubHeading1 className="text-center text-mono-180">
          Webb builds infrastructure for connecting zero-knowledge applications
          empowering developers to unlock user privacy in the Web3 ecosystem.
        </SubHeading1>

        <Button
          href={manifestoUrl}
          target="_blank"
          rel="noreferrer"
          className="block button-primary mx-auto"
        >
          Read the Manifesto
        </Button>
      </div>
    </section>
  );
};
