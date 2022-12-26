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
        <div className="relative min-h-[1290px] max-h-screen w-full">
          <div className="absolute top-0 left-0 w-full h-full">
            <lottie-player
              src="/animations/spiral-with-gradient.json"
              autoplay
              loop
              style={{ height: '100%', width: '100%' }}
              preserveAspectRatio="xMidYMax slice"
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
