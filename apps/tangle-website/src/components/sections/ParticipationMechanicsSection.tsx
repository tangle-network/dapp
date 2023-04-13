import { SectionDescription, SectionHeader, SectionTitle } from '..';

export const ParticipationMechanicsSection = () => {
  return (
    <section className="bg-mono-0 py-20 px-5">
      <div className="flex flex-col items-center">
        <SectionHeader className="text-center pb-2">Participation Mechanics</SectionHeader>
        <SectionTitle className="pb-4">Join the Tangle Ecosystem</SectionTitle>
        <SectionDescription className="text-center lg:w-3/5">
          With Tangle Network, we can create a more scalable and interoperable
          web3 privacy ecosystem that is truly a positive-sum game.
        </SectionDescription>
      </div>

      <div></div>
    </section>
  );
};
