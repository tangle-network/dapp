import cx from 'classnames';
import { Heading2, PrivacyScaleSwiper, SubHeading1 } from '../../components';

export const PrivacyScaleSection = () => {
  return (
    <section
      className={cx(
        'bg-mono-200 dark',
        'py-16 lg:px-[72px] md:py-[156px] space-y-9'
      )}
    >
      <div className="space-y-4 md:space-y-9">
        <Heading2 className="px-4 text-center">
          How the Future of Privacy Scales
        </Heading2>

        <SubHeading1 className="text-center max-w-[900px] px-4 mx-auto dark:text-mono-60">
          Webb connects cryptographic accumulators used in zero-knowledge
          applications so users can leverage the power of cross-chain
          zero-knowledge proofs.
        </SubHeading1>
      </div>

      <PrivacyScaleSwiper />
    </section>
  );
};
