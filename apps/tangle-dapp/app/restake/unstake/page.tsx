import RestakeTabs from '../RestakeTabs';

const Page = () => {
  return (
    <div className="grid items-start grid-cols-1 gap-4 sm:grid-cols-2 justify-stretch">
      <div className="max-w-lg">
        <RestakeTabs />

        <div>Unstake Content</div>
      </div>
    </div>
  );
};

export default Page;
