import { ArrowRight } from '@webb-tools/icons';
import RestakeBanner from '@webb-tools/tangle-shared-ui/components/blueprints/RestakeBanner';
import { Button } from '@webb-tools/webb-ui-components';
import { OPERATOR_JOIN_DOCS_LINK } from '@webb-tools/webb-ui-components/constants/tangleDocs';
import { FC, useState } from 'react';
import JoinOperatorsModal from './JoinOperatorsModal';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import useIsAccountConnected from '../../hooks/useIsAccountConnected';

const JoinOperatorsBanner: FC = () => {
  const [isJoinOperatorsModalOpen, setIsJoinOperatorsModalOpen] =
    useState(false);

  const { isEvm } = useAgnosticAccountInfo();
  const isAccountConnected = useIsAccountConnected();

  const disabledTooltip = isAccountConnected
    ? 'Only Substrate accounts can register as operators at this time.'
    : 'Connect a Substrate account to join as an operator.';

  return (
    <>
      <RestakeBanner
        title="Register as an Operator"
        description="With Tangle, operators and their delegators get rewarded by hosting blueprints. Interested in becoming an operator? Bond some tokens to get started."
        buttonText="Learn More"
        buttonHref={OPERATOR_JOIN_DOCS_LINK}
        action={
          <Button
            className="w-full max-w-none sm:max-w-max sm:w-auto"
            variant="primary"
            rightIcon={
              <ArrowRight
                size="lg"
                className="fill-current dark:fill-current"
              />
            }
            onClick={() => setIsJoinOperatorsModalOpen(true)}
            disabledTooltip={disabledTooltip}
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
