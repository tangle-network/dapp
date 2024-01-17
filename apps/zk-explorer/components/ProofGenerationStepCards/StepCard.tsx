import { Button } from '@webb-tools/webb-ui-components';
import { WEBB_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import { FC } from 'react';
import CollapsibleCard from './CollapsibleCard';

type StepCardProps = {
  number: number;
  activeStep: number;
  title: string;
  children: React.ReactNode;
  isLast?: boolean;
  isNextButtonDisabled: boolean;
  onNext: (isLast: boolean) => void;
};

const StepCard: FC<StepCardProps> = ({
  number,
  title,
  children,
  activeStep,
  isLast = false,
  isNextButtonDisabled,
  onNext,
}) => {
  return (
    <CollapsibleCard
      isOpen={activeStep === number}
      title={`${number}. ${title}:`}
    >
      <div className="flex flex-col gap-4">
        {children}

        <div className="flex flex-col md:flex-row gap-4">
          {/* TODO: Replace with link to more specific docs, when available. */}
          <Button isFullWidth variant="secondary" href={WEBB_DOCS_URL}>
            Learn More
          </Button>

          <Button
            isDisabled={isNextButtonDisabled}
            onClick={() => onNext(isLast)}
            isFullWidth
            variant="primary"
          >
            {isLast ? 'Initialize Proof Generation' : 'Next'}
          </Button>
        </div>
      </div>
    </CollapsibleCard>
  );
};

export default StepCard;
