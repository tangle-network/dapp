import {
  SectionDescription,
  SectionHeader,
  SectionTitle,
  IntroducingTangleSvg,
} from '..';
import { Typography } from '@webb-tools/webb-ui-components';

export const IntroducingSection = () => {
  return (
    <section className="md:gap-[72px] md:pb-[60px] bg-introduction_section">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6 ">
        <div className="flex flex-col gap-4 items-center px-5 justify-center pt-[60px]">
          <div className="flex flex-col items-center gap-2">
            <Typography
              variant="mkt-small-caps"
              className="font-black text-purple-70"
            >
              Introducing
            </Typography>
            <Typography variant="mkt-h3" className="font-black text-mono-200">
              Tangle Network
            </Typography>
          </div>
          <Typography
            variant="mkt-body1"
            className="text-center lg:w-[60%] font-medium text-mono-140 mb-12"
          >
            The next-generation blockchain connecting cross-chain dApps with
            threshold signature scheme (TSS) governance system.
          </Typography>
        </div>
        <div className="flex justify-center">
          <IntroducingTangleSvg />
        </div>
      </div>
    </section>
  );
};
