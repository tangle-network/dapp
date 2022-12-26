import { Button } from '@webb-tools/webb-ui-components/components/Button/Button';

import Heading1 from '../Heading1';
import SubHeading from '../SubHeading';

const manifestoUrl =
  'https://docs.webb.tools/v1/getting-started/privacy-manifesto/';

const HeroSection = () => {
  return (
    <section className="absolute flex justify-center w-full">
      <div className="max-w-[454px] md:max-w-none md:w-[934px] space-y-2 p-4 md:p-0 md:space-y-6 mt-[190px]">
        <Heading1 className="text-center">
          Privacy that Brings Blockchains Together{' '}
        </Heading1>

        <SubHeading className="text-center">
          Webb builds infrastructure for connecting zero-knowledge applications
          empowering developers to unlock user privacy in the Web3 ecosystem.
        </SubHeading>

        <Button
          href={manifestoUrl}
          target="_blank"
          rel="noreferrer"
          className="block mx-auto"
        >
          Read the Manifesto
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
