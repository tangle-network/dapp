import { WebbErrorCodes } from '@webb-tools/dapp-types';
import { Modal, ModalContent } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { DefaultErrorView } from './DefaultErrorView';
import { UnselectedNetworkView } from './UnselectedNetworkView';
import { InteractiveFeedbackViewProps } from './types';

export const InteractiveFeedbackView: FC<InteractiveFeedbackViewProps> = ({
  activeFeedback,
}) => {
  return (
    <Modal open={Boolean(activeFeedback)}>
      <ModalContent
        isCenter
        className="bg-mono-0 dark:bg-mono-160 rounded-xl w-[420px]"
        isOpen={Boolean(activeFeedback)}
      >
        {activeFeedback &&
          (activeFeedback.reason === WebbErrorCodes.UnselectedChain ? (
            <UnselectedNetworkView activeFeedback={activeFeedback} />
          ) : (
            <DefaultErrorView activeFeedback={activeFeedback} />
          ))}
      </ModalContent>
    </Modal>
  );
};
