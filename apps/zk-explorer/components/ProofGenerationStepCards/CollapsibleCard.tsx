import { ChevronDown, ChevronUp } from '@webb-tools/icons';
import { Card, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

type CollapsibleCardProps = {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
};

const CollapsibleCard: FC<CollapsibleCardProps> = ({
  title,
  children,
  isOpen,
}) => {
  return (
    <Card className="flex flex-col gap-4 space-y-0 rounded-lg w-full">
      <div className="flex items-center justify-between">
        <Typography variant="body1" fw="normal" className="dark:text-mono-0">
          {title}
        </Typography>

        {isOpen ? <ChevronUp size="lg" /> : <ChevronDown size="lg" />}
      </div>

      {isOpen && children}
    </Card>
  );
};

export default CollapsibleCard;
