import { Button } from '@webb-tools/webb-ui-components/components/Button/Button';

import SubHeading from '../SubHeading';

const manifestoUrl =
  'https://docs.webb.tools/v1/getting-started/privacy-manifesto/';

const HeroSection = () => {
  return (
    <section className="absolute flex justify-center w-full">
      <div className="w-[934px] space-y-6 mt-[190px]">
        <h1 className="text-[84px] text-center font-bold leading-[96px] text-mono-200">
          Privacy that Brings Blockchains Together{' '}
        </h1>
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
