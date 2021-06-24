import React, { useMemo } from 'react';
import styled from 'styled-components';
import { InterActiveFeedback } from '@webb-dapp/react-environment';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';

const InteractiveErrorViewWrapper = styled.div``;
type InteractiveErrorViewProps = {
  activeFeedback: InterActiveFeedback | null;
};

const InteractiveErrorView: React.FC<InteractiveErrorViewProps> = ({ activeFeedback }) => {
  const actions = useMemo(() => {
    if (activeFeedback) {
      return Object.keys(activeFeedback.actions).map((name) => (
        <button
          onClick={() => {
            activeFeedback?.actions[name].onTrigger();
          }}
        >
          {name} | {activeFeedback?.actions[name]?.level}
        </button>
      ));
    }
  }, [activeFeedback]);
  return (
    <Modal open={Boolean(activeFeedback)}>
      <InteractiveErrorViewWrapper>{actions}</InteractiveErrorViewWrapper>
    </Modal>
  );
};
export default InteractiveErrorView;
