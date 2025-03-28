import { FC } from 'react';

type Props = {
  name: string;
  url?: string;
  size: 'sm' | 'lg';
};

const BlueprintLogo: FC<Props> = ({ name, url, size }) => {
  return (
    <div className="rounded-full border border-gray-300 dark:border-mono-120">
      <img src={url} alt={`${name}'s logo`} />
    </div>
  );
};

export default BlueprintLogo;
