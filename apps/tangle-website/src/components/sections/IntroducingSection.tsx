import { Typography } from '@webb-tools/webb-ui-components';

import { SubHeading, IntroducingTangleSVG } from '..';

export const IntroducingSection = () => {
  return (
    <section className="flex flex-col w-full gap-6 md:gap-[72px] md:pb-[60px] bg-introduction_bg">
      <div className="flex flex-col gap-4 items-center px-5 justify-center pt-[60px]">
        <div className="flex flex-col items-center gap-2">
          <h3 className="uppercase text-tangle_purple font-bold">
            Introducing
          </h3>
          <Typography variant="h2" fw="bold" >
            Tangle Network
          </Typography>
        </div>
        <SubHeading className="text-center lg:w-[60%]">
          The next-generation blockchain connecting cross-chain dApps with
          threshold signature scheme (TSS) governance system.
        </SubHeading>
      </div>
      <div className="flex justify-center">
        <IntroducingTangleSVG />
      </div>
    </section>
  );
};
