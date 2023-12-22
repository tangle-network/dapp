import { type FC } from 'react';
import cx from 'classnames';

interface ProjectHeaderContainerProps {
  className?: string;
}

const ProjectHeaderContainer: FC<ProjectHeaderContainerProps> = ({
  className,
}) => {
  return (
    <div
      className={cx('dark:bg-mono-180 p-6 space-y-6 rounded-2xl', className)}
    >
      ProjectHeaderContainer
    </div>
  );
};

export default ProjectHeaderContainer;
