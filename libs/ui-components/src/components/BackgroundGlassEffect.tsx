import { FC } from 'react';

const BackgroundGlassEffect: FC = () => {
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 backdrop-blur-2xl pointer-events-none" />
  );
};

export default BackgroundGlassEffect;
