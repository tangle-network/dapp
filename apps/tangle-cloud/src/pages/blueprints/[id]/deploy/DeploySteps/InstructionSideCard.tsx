import { Typography } from '@tangle-network/ui-components';
import InfoSidebar from '../../../../../components/InfoSidebar';
import { FC } from 'react';

type InstructionSideCardProps = {
  title: string;
  description: string;
};

export const InstructionSideCard: FC<InstructionSideCardProps> = ({
  title,
  description,
}) => {
  return (
    <InfoSidebar>
      <Typography variant="h5">{title}</Typography>

      <Typography variant="body1" className="text-mono-120 dark:text-mono-100">
        {description}
      </Typography>
    </InfoSidebar>
  );
};
