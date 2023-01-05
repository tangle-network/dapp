import { Transition } from '@headlessui/react';
import { FC } from 'react';

const PrivacyScaleIllustration: FC<{ activeIndex: number }> = ({
  activeIndex,
}) => {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <Transition
          className="absolute top-0 left-0 flex items-start justify-center w-full h-full md:items-center"
          appear={true}
          key={index}
          show={index === activeIndex}
          enter="transition-opacity duration-[500ms]"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-[500ms]"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/static/svgs/privacy-set-illustration-step-${index + 1}.svg`}
            alt={`privacy-scale-${index + 1}`}
          />
        </Transition>
      ))}
    </>
  );
};

export default PrivacyScaleIllustration;
