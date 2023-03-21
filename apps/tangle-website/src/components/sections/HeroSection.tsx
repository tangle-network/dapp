import { Heading1, SubHeading1 } from '..';

export const HeroSection = () => {
  return (
    <section className="absolute w-full -translate-y-1/3 top-1/4">
      <div className="max-w-[454px] md:max-w-[934px] space-y-2 p-4 mx-auto w-full lg:p-0 md:space-y-6">
        <Heading1 className="text-center text-mono-200">
          Tangle Network
        </Heading1>

        <SubHeading1 className="text-center text-mono-180">
          The next-generation TSS based blockchain powering cross-chain
          zero-knowledge messaging and applications.
        </SubHeading1>
      </div>
    </section>
  );
};
