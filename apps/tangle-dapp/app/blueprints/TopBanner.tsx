import { ArrowRight } from '@webb-tools/icons';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { BLUEPRINT_DOCS } from '@webb-tools/webb-ui-components/constants/tangleDocs';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

const TopBanner: FC = () => {
  return (
    <div
      className={twMerge(
        'px-6 py-9 rounded-xl bg-center bg-cover bg-no-repeat',
        'bg-[url(/static/assets/blueprints/top-banner.png)]',
        'dark:bg-[url(/static/assets/blueprints/top-banner-dark.png)]',
      )}
    >
      <div className="max-w-[415px] space-y-3">
        <Typography variant="h4" className="text-mono-0">
          Create your first{' '}
          <span className="text-blue-40 dark:text-blue-40">Blueprint</span>
        </Typography>
        <Typography variant="body1" className="text-mono-60 dark:text-mono-100">
          Set up a minimal Tangle Blueprint in minutes accompanied by a
          step-by-step guide.
        </Typography>
        <Button
          href={BLUEPRINT_DOCS}
          target="_blank"
          rightIcon={<ArrowRight size="lg" className="!fill-mono-0" />}
        >
          Create Blueprint
        </Button>
      </div>
    </div>
  );
};

export default TopBanner;
