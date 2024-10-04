import { IconBase } from '@webb-tools/icons/types';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

export type OnboardingItemProps = {
  Icon: (props: IconBase) => JSX.Element;
  title: string;
  description: string;
};

const OnboardingItem: FC<OnboardingItemProps> = ({
  title,
  description,
  Icon,
}) => {
  return (
    <div className="flex items-start justify-start gap-4">
      <Icon size="lg" className="mt-2" />

      <div className="flex flex-col items-start justify-center">
        <Typography variant="h5" fw="medium">
          {title}
        </Typography>

        <Typography variant="body1">{description}</Typography>
      </div>
    </div>
  );
};

export default OnboardingItem;
