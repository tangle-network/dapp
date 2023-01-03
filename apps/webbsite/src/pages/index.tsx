import { Player } from '@lottiefiles/react-lottie-player';

import * as spiralAnimationJson from '../assets/animations/spiral-with-gradient.json';

import ApplicationsAndInfrastructureSection from '../components/sections/ApplicationsAndInfrastructureSection';
import HeroSection from '../components/sections/HeroSection';
import InActionSection from '../components/sections/InActionSection';
import PrivacyConnectedSection from '../components/sections/PrivacyConnectedSection';
import PrivacyScaleSection from '../components/sections/PrivacyScaleSection';
import ResearchAndDevelopmentSection from '../components/sections/ResearchAndDevelopmentSection';

export function Index() {
  return (
    <>
      <div className=" bg-[#f9faf9]">
        <div className="relative min-h-[1000px] xl:min-h-[1300px] max-h-screen w-full">
          <div className="absolute top-0 left-0 w-full h-full">
            <Player
              src={spiralAnimationJson}
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
      </div>

      <PrivacyScaleSection />

      <ApplicationsAndInfrastructureSection />

      <InActionSection />

      <ResearchAndDevelopmentSection />
    </>
  );
}

export default Index;
