import { FC } from 'react';
import { Typography } from '@webb-tools/webb-ui-components';
import { ChevronRight } from '@webb-tools/icons';

interface RoadMapItemProps {
  timeline: string;
  order: number;
  action: string;
  activities: string[];
}

const roadMapItems = [
  {
    timeline: 'Mid 2023',
    action: 'Initial ⚡️',
    activities: [
      'Test Runtime Upgrade',
      'Finalize Tangle Token Distribution',
      'Launch Incentivized testnet',
    ],
  },
  {
    timeline: 'Late 2023',
    action: 'Growth 🌕',
    activities: [
      'Update Tangle Genesis for Launch',
      'Distribute TNT Tokens',
      'Launch Democracy Governance',
      'Launch OFAC VAnchor Bridges',
    ],
  },
  {
    timeline: 'Early 2024',
    action: 'Scale 🪐',
    activities: [
      'Launch Cross-chain Transfers',
      'Validator Staking Upgrades',
      'Launch Semaphore VAnchor bridges',
    ],
  },
  {
    timeline: 'Mid 2024',
    action: 'Expand 🌌',
    activities: ['Remove Sudo', 'Improve Relayer & Proposer Security'],
  },
];

export const LaunchPhasesSection = () => {
  return (
    <section className="py-[60px]">
      <div className="max-w-[1440px] mx-auto">
        <div className="px-5 mb-12 lg:px-[11.25%]">
          <Typography
            variant="mkt-small-caps"
            className="mb-6 font-black text-purple-70"
          >
            Launch Phases
          </Typography>
          <Typography
            variant="mkt-h3"
            className="text-left font-black text-mono-200"
          >
            Tangle Network is{' '}
          </Typography>
          <Typography
            variant="mkt-h3"
            className="text-left font-black text-purple-70"
          >
            Open Source & Community Managed
          </Typography>
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
      </div>
    </section>
  );
};

const RoadMapItem: FC<RoadMapItemProps> = (props) => {
  const { timeline, order, action, activities } = props;

  return (
    <div>
      <hr className="w-full border-mono-100 relative" />
      <div className="flex">
        <div className="w-[30%] lg:w-[22.5%] flex flex-col items-center">
          <div className="bg-purple-40 bg-opacity-25 rounded-full p-1.5 my-[-6px]">
            <div className="bg-tangle_dark_purple w-3 h-3 rounded-full" />
          </div>
          <div className="bg-tangle_dark_purple w-[2px] flex-1 z-10" />
          <div className="bg-mono-0 py-1 px-3 rounded-xl">
            <Typography
              variant="mkt-small-caps"
              className="!text-xs text-purple-90 font-black"
            >
              {timeline}
            </Typography>
          </div>
          <div className="bg-tangle_dark_purple w-[2px] flex-1 z-10" />
        </div>
        <div className="w-[70%] lg:w-[77.5%] flex flex-col md:flex-row gap-6 py-5 pr-5 md:pr-0">
          <div className="md:flex md:flex-col md:justify-center md:flex-[1] lg:flex lg:items-center">
            <div className="lg:w-fit">
              <Typography variant="mkt-subheading" className="font-black">
                Phase {order}
              </Typography>
              <Typography variant="mkt-body1" className="font-medium">
                {action}
              </Typography>
            </div>
          </div>
          <div className="space-y-3 md:flex-[2] lg:flex-[2.5]">
            {activities.map((activity, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="flex items-center justify-center rounded-full bg-blue-10 p-[2px]">
                  <ChevronRight className="fill-purple-70" />
                </div>
                <Typography
                  variant="mkt-body1"
                  className="font-medium text-mono-140"
                >
                  {activity}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
