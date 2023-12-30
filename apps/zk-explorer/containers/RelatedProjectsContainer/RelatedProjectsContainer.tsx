import dynamic from 'next/dynamic';
import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';

import { getRelatedProjectsContainerData } from '../../server';

const RelatedProjectsCarousel = dynamic(
  () => import('./client/RelatedProjectsCarousel'),
  { ssr: false }
);

interface RelatedProjectsContainerProps {
  className?: string;
}

export default async function RelatedProjectsContainer({
  className,
}: RelatedProjectsContainerProps) {
  const relatedProjects = await getRelatedProjectsContainerData();

  return (
    <div className={cx('space-y-6', className)}>
      <Typography
        variant="h5"
        fw="bold"
        className="!text-mono-200 dark:!text-mono-0"
      >
        Related Projects
      </Typography>

      <RelatedProjectsCarousel projects={relatedProjects} />
    </div>
  );
}
