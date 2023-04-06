import React from 'react';
import Image from 'next/image';
import { Button, Typography } from '@webb-tools/webb-ui-components';

import { SectionDescription } from '.';

interface TangleFeatureCardProps {
  img: string;
  index: number;
  title: string;
  description: string;
  link: string;
}

export const TangleFeatureCard: React.FC<TangleFeatureCardProps> = (props) => {
  const { img, index, title, description, link } = props;
  return (
    <div className="bg-mono-0 rounded-lg overflow-hidden flex flex-col md:w-[300px] min-h-[647px] md:min-h-min md:h-full lg:h-auto flex-1">
      <div className="relative h-[150px] w-full object-contain">
        <Image src={img} alt={title} fill />
      </div>
      <div className="py-[42px] px-6 flex flex-col justify-between flex-1">
        <div>
          <p className="mono1 mb-4">0{index}</p>
          <hr />
          <Typography variant="h4" fw="bold" className="mt-4 mb-6">
            {title}
          </Typography>
          <SectionDescription className="text-left !text-xl !leading-8 md:!text-lg md:!leading-[32.4px] lg:!text-xl lg:!leading-8">
            {description}
          </SectionDescription>
        </div>
        <Button href={link} className="mt-4">
          Learn More
        </Button>
      </div>
    </div>
  );
};
