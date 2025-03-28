import { FC } from 'react';

type Props = {
  name: string;
  url?: string;
};

const BlueprintItemIcon: FC<Props> = ({ name, url }) => {
  return (
    <div className="rounded-full border border-gray-300 dark:border-mono-120">
      <img src={url} alt={`${name}'s icon`} />
    </div>
  );
};

export default BlueprintItemIcon;
