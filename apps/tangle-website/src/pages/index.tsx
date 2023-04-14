import {
  HeroSection,
  IntroducingSection,
  FeaturesSection,
  SupportedBySection,
} from '../components';

export function Index() {
  return (
    <div className="bg-body bg-top block max-w-[1440px] mx-auto">
      <HeroSection />

      <IntroducingSection />

      <FeaturesSection />

      <SupportedBySection />
    </div>
  );
}

export default Index;
