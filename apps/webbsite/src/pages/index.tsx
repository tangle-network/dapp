import { NextSeo } from 'next-seo';
import Lottie from 'react-lottie-player';

import {
  ApplicationsAndInfrastructureSection,
  HeroSection,
  InActionSection,
  PrivacyConnectedSection,
  PrivacyScaleSection,
  ResearchAndDevelopmentSection,
} from '../components';

const description =
  'Webb builds infrastructure for connecting zero-knowledge applications empowering developers to unlock user privacy in the Web3 ecosystem.';

export function Index() {
  return (
    <>
      <NextSeo
        description={description}
        canonical="https://webb.tools/"
        openGraph={{
          title: 'Privacy that Brings Blockchains Together',
          description,
          url: 'https://webb.tools/',
        }}
      />

      <div className="relative w-full h-screen min-h-[900px] xl:min-h-[1500px]">
        <div className="absolute top-0 left-0 w-full h-full">
          <Lottie
            path="/animations/hero-loop.json"
            play
            loop
            className="w-full h-full"
            rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
          />
        </div>
        <HeroSection />
      </div>

      <PrivacyConnectedSection />

      <PrivacyScaleSection />

      <ApplicationsAndInfrastructureSection />

      <InActionSection />

      <ResearchAndDevelopmentSection />
    </>
  );
}

export default Index;
