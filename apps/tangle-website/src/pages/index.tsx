import {
  HeroSection,
  IntroducingSection,
  FeaturesSection,
  ParticipationMechanicsSection,
} from '../components';

export function Index() {
  return (
    <div className="bg-body bg-top">
      <HeroSection />

      <IntroducingSection />

      <FeaturesSection />

      <ParticipationMechanicsSection />
    </div>
  );
}

export default Index;
