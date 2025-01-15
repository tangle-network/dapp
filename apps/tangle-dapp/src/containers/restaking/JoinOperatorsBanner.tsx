import { ArrowRight } from '@webb-tools/icons';
import RestakeBanner from '@webb-tools/tangle-shared-ui/components/blueprints/RestakeBanner';
import { Button } from '@webb-tools/webb-ui-components';
import { OPERATOR_JOIN_DOCS_LINK } from '@webb-tools/webb-ui-components/constants/tangleDocs';
import { FC, useState } from 'react';
import JoinOperatorsModal from './JoinOperatorsModal';

const JoinOperatorsBanner: FC = () => {
  const [isJoinOperatorsModalOpen, setIsJoinOperatorsModalOpen] =
    useState(false);

  return (
    <>
      <RestakeBanner
        title="Register as an Operator"
        description="Interested in becoming an operator? Operators host blueprints and earn rewards for their delegators. Register as an operator to get started."
        buttonText="Learn More"
        buttonHref={OPERATOR_JOIN_DOCS_LINK}
        action={
          <Button
            variant="primary"
            rightIcon={<ArrowRight />}
            onClick={() => setIsJoinOperatorsModalOpen(true)}
          >
            Join Operators
          </Button>
        }
      />

      <JoinOperatorsModal
        isOpen={isJoinOperatorsModalOpen}
        setIsOpen={setIsJoinOperatorsModalOpen}
      />
    </>
  );
};

export default JoinOperatorsBanner;
