interface TangleFeatureCardProps {
  tabName: string;
}

export const ParticipationTabTrigger: React.FC<TangleFeatureCardProps> = (
  props
) => {
  const { tabName } = props;
  return (
    <>
      <div className="participation-tab w-full aspect-square flex justify-center items-center rounded-lg">
        <div className="w-full text-inherit">
          <div className="flex flex-col items-center gap-2 text-inherit">
            <div className="w-12 h-12 bg-mono-40 rounded-full" />
            <p className="text-[16px] leading-[25.6px] md:text-[24px] md:leading-[40px] font-bold text-inherit">
              {tabName}
            </p>
          </div>
        </div>
      </div>
      <div className="participation-tab-polygon w-0 h-0 border-transparent border-solid border-x-[8px] border-t-[16px]" />
    </>
  );
};
