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
    <section className="py-[80px]">
      <div className="px-5 mb-12">
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

      <div>
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
