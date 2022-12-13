import ApplicationsAndInfrastructureSection from '../components/sections/ApplicationsAndInfrastructureSection';
import HeroSection from '../components/sections/HeroSection';
import InActionSection from '../components/sections/InActionSection';
import PrivacyConnectedSection from '../components/sections/PrivacyConnectedSection';
import PrivacyScaleSection from '../components/sections/PrivacyScaleSection';
import ResearchAndDevelopmentSection from '../components/sections/ResearchAndDevelopmentSection';

export function Index() {
  return (
    <>
      <div className="relative object-cover bg-no-repeat bg-cover bg-hero_bg_image min-h-[1400px] h-[2250px] bg-top">
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
