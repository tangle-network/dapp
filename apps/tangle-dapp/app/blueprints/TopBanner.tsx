import { ArrowRight } from '@webb-tools/icons';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

const TopBanner: FC = () => {
  return (
    <div
      className={twMerge(
        'px-6 py-9 rounded-xl bg-center bg-cover bg-no-repeat',
        'bg-[linear-gradient(79deg,rgba(17,22,50,0.60)_8.85%,rgba(17,30,95,0.60)_55.91%,rgba(89,83,249,0.60)_127.36%),url(/static/assets/blueprints/top-banner.png)]',
        'dark:bg-[linear-gradient(79deg,rgba(17,22,50,0.80)_8.85%,rgba(17,30,95,0.80)_55.91%,rgba(89,83,249,0.80)_127.36%),url(/static/assets/blueprints/top-banner.png)]',
      )}
    >
      <div className="max-w-[415px] space-y-3">
        <Typography variant="h4" className="text-mono-0">
          Create your first Blueprint
        </Typography>
        <Typography variant="body1" className="text-mono-60 dark:text-mono-100">
          Set up a minimal Tangle Blueprint in minutes accompanied by a
          step-by-step guide.
        </Typography>
        <Button rightIcon={<ArrowRight size="lg" className="!fill-mono-0" />}>
          Create Blueprint
        </Button>
      </div>
    </div>
  );
};

export default TopBanner;
