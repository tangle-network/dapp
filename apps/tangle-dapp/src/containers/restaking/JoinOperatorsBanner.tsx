import { ArrowRight } from '@webb-tools/icons';
import RestakeBanner from '@webb-tools/tangle-shared-ui/components/blueprints/RestakeBanner';
import { Button } from '@webb-tools/webb-ui-components';
import { OPERATOR_JOIN_DOCS_LINK } from '@webb-tools/webb-ui-components/constants/tangleDocs';
import { FC, useState } from 'react';
import JoinOperatorsModal from './JoinOperatorsModal';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';

const JoinOperatorsBanner: FC = () => {
  const [isJoinOperatorsModalOpen, setIsJoinOperatorsModalOpen] =
    useState(false);

  const { isEvm } = useAgnosticAccountInfo();

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
            disabledTooltip="Only Substrate accounts can register as operators at this time."
            // Disable the button until it is known whether the current account
            // is an EVM account or not.
            isDisabled={isEvm ?? true}
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
