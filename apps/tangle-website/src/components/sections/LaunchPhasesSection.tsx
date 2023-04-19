import {
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from '..';

export const LaunchPhasesSection = () => {
  return (
    <section className="py-[80px]">
      <div className="px-5">
        <SectionHeader className="mb-6">Launch Phases</SectionHeader>
        <div className="mb-6">
          <SectionTitle className="text-left">Tangle Network is </SectionTitle>
          <SectionTitle className="text-left text-purple-70">
            Open Source & Community Managed
          </SectionTitle>
        </div>
        <SectionDescription>
          As the hub for routing cross-chain messages using ZKP, Tangle enables
          the community to optimized for any use case.
        </SectionDescription>
      </div>
    </section>
  );
};
