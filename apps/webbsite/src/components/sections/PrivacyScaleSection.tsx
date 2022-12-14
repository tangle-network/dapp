import cx from 'classnames';
import Heading2 from '../Heading2';
import SubHeading from '../SubHeading';

const PrivacyScaleSection = () => {
  return (
    <section
      className={cx(
        'object-cover bg-center bg-no-repeat bg-cover bg-dyed',
        'px-[72px] py-[156px] space-y-9'
      )}
    >
      <Heading2 className="text-center">
        How the Future of Privacy Scales
      </Heading2>
      <SubHeading className="text-center max-w-[900px] mx-auto">
        Webb connects cryptographic accumulators used in zero-knowledge
        applications so users can leverage the power of cross-chain
        zero-knowledge proofs.
      </SubHeading>

      <div className="w-[1000px] h-[483px] bg-mono-0 rounded-lg mx-auto"></div>
    </section>
  );
};

export default PrivacyScaleSection;
