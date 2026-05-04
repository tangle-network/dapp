import { type FC, type PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = PropsWithChildren<{
  className?: string;
}>;

const PageLayout: FC<Props> = ({ children, className }) => {
  return (
    <div
      className={twMerge(
        'tangle-cloud-page mx-auto max-w-[1440px] space-y-6 px-4 pb-10 pt-6 md:px-8',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default PageLayout;
