'use client';

import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

interface DetailTabsProps {
  serviceId: string;
  className?: string;
}

const DetailTabs: FC<DetailTabsProps> = ({ serviceId, className }) => {
  console.log('serviceId :', serviceId);
  return <div className={twMerge(className)}></div>;
};

export default DetailTabs;
