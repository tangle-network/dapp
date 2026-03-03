import { FC, ReactNode } from 'react';
import { Typography } from '@tangle-network/ui-components';

type DetailItemProps = {
  title: string;
  value: ReactNode;
  tooltip?: ReactNode;
};

const DetailItem: FC<DetailItemProps> = ({ title, value }) => {
  return (
    <div className="flex justify-between items-center py-1">
      <Typography variant="body2" className="text-mono-100">
        {title}
      </Typography>
      <Typography variant="body2" fw="semibold">
        {value}
      </Typography>
    </div>
  );
};

export default DetailItem;
