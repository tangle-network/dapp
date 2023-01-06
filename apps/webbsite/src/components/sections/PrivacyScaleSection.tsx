import cx from 'classnames';
import Heading2 from '../Heading2';
import PrivacyScaleSwiper from '../PrivacyScaleSwiper';
import SubHeading from '../SubHeading';

const PrivacyScaleSection = () => {
  return (
    <section className={cx('bg-mono-200', 'px-[72px] py-[156px] space-y-9')}>
      <Heading2 className="text-center text-mono-0">
        How the Future of Privacy Scales
      </Heading2>
      <SubHeading className="text-center max-w-[900px] mx-auto text-mono-60">
        Webb connects cryptographic accumulators used in zero-knowledge
        applications so users can leverage the power of cross-chain
        zero-knowledge proofs.
      </SubHeading>

      <PrivacyScaleSwiper />
    </section>
  );
};

export default PrivacyScaleSection;
