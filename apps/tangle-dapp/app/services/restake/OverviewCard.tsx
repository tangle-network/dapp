import { type ComponentProps, type ElementRef, forwardRef } from 'react';

import TangleCard from '../../../components/TangleCard';

const OverviewCard = forwardRef<ElementRef<'div'>, ComponentProps<'div'>>(
  (props, ref) => {
    return (
      <TangleCard {...props} ref={ref}>
        <div className=""></div>
      </TangleCard>
    );
  }
);

OverviewCard.displayName = 'OverviewCard';

export default OverviewCard;
