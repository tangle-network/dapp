import Lottie from 'lottie-react';

import ApplicationsAndInfrastructureSection from '../components/sections/ApplicationsAndInfrastructureSection';
import HeroSection from '../components/sections/HeroSection';
import InActionSection from '../components/sections/InActionSection';
import PrivacyConnectedSection from '../components/sections/PrivacyConnectedSection';
import PrivacyScaleSection from '../components/sections/PrivacyScaleSection';
import ResearchAndDevelopmentSection from '../components/sections/ResearchAndDevelopmentSection';

export function Index() {
  return (
    <>
      <div className="relative w-full h-screen min-h-[900px] xl:min-h-[1500px]">
        <div className="absolute top-0 left-0 w-full h-full">
          <Lottie
            animationData={require('../assets/animations/hero-loop.json')}
            autoplay
            loop
            style={{ height: '100%', width: '100%' }}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice',
            }}
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
