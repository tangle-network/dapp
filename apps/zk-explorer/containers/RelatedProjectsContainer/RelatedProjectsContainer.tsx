import { type FC } from 'react';
import cx from 'classnames';

interface RelatedProjectsContainerProps {
  className?: string;
}

const RelatedProjectsContainer: FC<RelatedProjectsContainerProps> = ({
  className,
}) => {
  return <div className={cx(className)}>RelatedProjectsContainer</div>;
};

export default RelatedProjectsContainer;
