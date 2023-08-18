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

      <div className="relative w-full">
        <Lottie
          path="/animations/hero-loop.json"
          play
          loop
          className="w-full h-full"
          rendererSettings={{ preserveAspectRatio: 'xMidYMax slice' }}
        />
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
