import { Typography } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import dynamic from 'next/dynamic';
import { fetchRelatedProjects } from '../../server/projectDetails';

const RelatedProjectsCarousel = dynamic(
  () => import('./client/RelatedProjectsCarousel'),
  { ssr: false }
);

type RelatedProjectsContainerProps = {
  className?: string;
};

export default async function RelatedProjectsContainer({
  className,
}: RelatedProjectsContainerProps) {
  const relatedProjects = await fetchRelatedProjects();

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
