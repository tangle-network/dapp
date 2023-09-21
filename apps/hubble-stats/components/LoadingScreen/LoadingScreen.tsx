import { Spinner } from '@webb-tools/icons';

const LoadingScreen = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner size="xl" />
    </div>
  );
};

export default LoadingScreen;
