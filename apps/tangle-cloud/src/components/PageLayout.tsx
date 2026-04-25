import { type FC, type PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = PropsWithChildren<{
  className?: string;
}>;

const PageLayout: FC<Props> = ({ children, className }) => {
  return (
    <div
      className={twMerge(
        'tangle-cloud-page max-w-screen-xl px-4 pt-8 pb-8 mx-auto space-y-5 md:px-5',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default PageLayout;
