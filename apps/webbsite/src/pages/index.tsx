import ApplicationsAndInfrastructureSection from '../components/sections/ApplicationsAndInfrastructureSection';
import HeroSection from '../components/sections/HeroSection';
import InActionSection from '../components/sections/InActionSection';
import PrivacyConnectedSection from '../components/sections/PrivacyConnectedSection';
import PrivacyScaleSection from '../components/sections/PrivacyScaleSection';
import ResearchAndDevelopmentSection from '../components/sections/ResearchAndDevelopmentSection';

export function Index() {
  return (
    <>
      <div className="relative min-h-[1400px] h-[2250px]">
        <div className="absolute top-0 left-0">
          <dotlottie-player
            src="/animations/spiral.lottie"
            autoplay
            loop
            style={{ height: '100%', width: '100%' }}
          />
        </div>
        <HeroSection />

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
