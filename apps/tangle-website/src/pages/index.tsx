import {
  HeroSection,
  IntroducingSection,
  FeaturesSection,
} from '../components';

export function Index() {
  return (
    <div className="bg-body bg-top">
      <HeroSection />

      <IntroducingSection />

      <FeaturesSection />
    </div>
  );
}

export default Index;
