import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { InteractiveFeedback, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import React, { useMemo } from 'react';

import DefaultErrorView from './DefaultErrorView';
import UnselectedNetworkView from './UnselectedNetworkView';

type InteractiveErrorViewProps = {
  activeFeedback: InteractiveFeedback | null;
};

const InteractiveErrorView: React.FC<InteractiveErrorViewProps> = ({ activeFeedback }) => {
  const content = useMemo(() => {
    if (activeFeedback) {
      // If the feedback is for Unselected network, display the appropriate error
      if (activeFeedback.reason === WebbErrorCodes.UnselectedChain) {
        return <UnselectedNetworkView activeFeedback={activeFeedback} />;
      }
      return <DefaultErrorView activeFeedback={activeFeedback} />;
    }
  }, [activeFeedback]);
  return <Modal open={Boolean(activeFeedback)}>{content}</Modal>;
};
export default InteractiveErrorView;
