import {
  ShieldedPoolHeroSection,
  ShieldedPoolUseCasesSection,
  ShieldedPoolExtensionsSection,
} from '../components/shielded-pool';

const ShieldedPoolProtocolsPage = () => {
  return (
    <div className="bg-mono-20">
      <ShieldedPoolHeroSection />
      <ShieldedPoolUseCasesSection />
      <div></div>
      <ShieldedPoolExtensionsSection />
    </div>
  );
};

export default ShieldedPoolProtocolsPage;
