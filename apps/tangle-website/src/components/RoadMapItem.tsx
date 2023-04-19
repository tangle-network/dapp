import React from 'react';
import { Typography } from '@webb-tools/webb-ui-components';
import { ChevronRight } from '@webb-tools/icons';
import { SectionDescription } from './SectionDescription';

interface RoadMapItemProps {
  timeline: string;
  order: number;
  action: string;
  activities: string[];
}

export const RoadMapItem: React.FC<RoadMapItemProps> = (props) => {
  const { timeline, order, action, activities } = props;

  return (
    <div>
      <hr className="w-full border-mono-100 relative" />
      <div className="flex">
        <div className="w-[30%] flex flex-col items-center">
          <div className="bg-purple-30 rounded-full p-1.5 my-[-6px]">
            <div className="bg-tangle_dark_purple w-3 h-3 rounded-full" />
          </div>
          <div className="bg-tangle_dark_purple w-[2px] flex-1" />
          <div className="bg-mono-0 py-1 px-3 rounded-xl">
            <Typography
              variant="h5"
              fw="bold"
              className="!text-xs text-purple-70 uppercase"
            >
              {timeline}
            </Typography>
          </div>
          <div className="bg-tangle_dark_purple w-[2px] flex-1" />
        </div>
        <div className="w-[70%] py-5 pr-5">
          <Typography variant="h4" fw="bold">
            Phase {order}
          </Typography>
          <Typography variant="body1">{action}</Typography>
          <div className="mt-6 space-y-3">
            {activities.map((activity, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="flex items-center justify-center rounded-full bg-blue-10 p-[2px]">
                  <ChevronRight color="rgb(98 79 190)" />
                </div>
                <SectionDescription>{activity}</SectionDescription>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
