import {
  HeroSection,
  IntroducingSection,
  FeaturesSection,
} from '../components';

export function Index() {
  return (
    <div className="bg-body_bg_image">
      <HeroSection />

      <IntroducingSection />

      <FeaturesSection />
    </div>
  );
}

export default Index;
