import {
  SectionDescription,
  SectionHeader,
  SectionTitle,
  RoadMapItem,
} from '..';

const roadMapItems = [
  {
    timeline: 'Early 2023',
    action: 'Initial ⚡️',
    activities: [
      'Pre-register Tangle Crowdloan',
      'Test Runtime Upgrade',
      'Finalize Tangle Token Distribution',
      'Launch Crowdloan Campaign',
    ],
  },
  {
    timeline: 'Late 2023',
    action: 'Growth 🌕',
    activities: [
      'Secure Kusama Parachain Slot',
      'Update Tangle Genesis for Launch',
      'Distribute TNT Tokens',
    ],
  },
  {
    timeline: '2024',
    action: 'Scale 🪐',
    activities: [
      'Launch Cross-chain Transfers',
      'Launch Democracy Governance',
      'Launch VAnchor Bridges',
      'Collator Staking Upgrades',
    ],
  },
  {
    timeline: 'Tbd',
    action: 'Expand 🌌',
    activities: ['Remove Sudo', 'Improve Relayer & Proposer Security'],
  },
];

export const LaunchPhasesSection = () => {
  return (
    <section className="py-[80px] lg:py-[96px]">
      <div className="px-5 mb-12 lg:px-[11.25%]">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:flex-[5.5] lg:flex-[4.5]">
            <SectionHeader className="mb-6">Launch Phases</SectionHeader>
            <SectionTitle className="text-left">
              Tangle Network is{' '}
            </SectionTitle>
            <SectionTitle className="text-left text-purple-70">
              Open Source & Community Managed
            </SectionTitle>
          </div>
          <div className="md:flex-[4.5] lg:flex-[5.5] md:flex md:items-center">
            <SectionDescription>
              As the hub for routing cross-chain messages using ZKP, Tangle
              enables the community to optimized for any use case.
            </SectionDescription>
          </div>
        </div>
      </div>

      <div className="md:px-5 lg:px-[11.25%]">
        {roadMapItems.map((phase, i) => (
          <RoadMapItem
            key={i}
            timeline={phase.timeline}
            order={i + 1}
            action={phase.action}
            activities={phase.activities}
          />
        ))}
      </div>
    </section>
  );
};
