import { FC } from 'react';

type Props = {
  name: string;
  url?: string;
  size: 'sm' | 'lg';
};

const LOGO_SIZES = {
  sm: 'w-5 h-5',
  lg: 'w-10 h-10',
} as const;

const BlueprintLogo: FC<Props> = ({ name, url, size }) => {
  return (
    <div>
      <img
        src={'https://avatars.githubusercontent.com/u/76852793?s=200&v=4'}
        alt={`${name}'s logo`}
        className={LOGO_SIZES[size]}
      />
    </div>
  );
};

export default BlueprintLogo;
