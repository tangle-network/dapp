import {
  CommunitySection,
  HeroSection,
  IntroducingSection,
} from '../components';

export function Index() {
  return (
    <div className="bg-body">
      <HeroSection />

      <IntroducingSection />

      <CommunitySection />
    </div>
  );
}

export default Index;
