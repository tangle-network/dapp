import { type FC, type PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';
import Header from './Header';

type Props = PropsWithChildren<{
  className?: string;
}>;

const PageLayout: FC<Props> = ({ children, className }) => {
  return (
    <div
      className={twMerge(
        'max-w-screen-xl px-4 mx-auto space-y-5 md:px-8 lg:px-10',
        className,
      )}
    >
      <Header />

      {children}
    </div>
  );
};

export default PageLayout;
