import React from 'react';
import styled from 'styled-components';

import { FlexBox } from '../..';
import { sharedLabelCss } from '../shared';
import { TextLabel } from '../TextLabel/TextLabel';

const InputTitleWrapper = styled(FlexBox).attrs({
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
})`
  ${sharedLabelCss}
  margin-bottom: 8px;
`;

export type InputTitleProps = {
  leftLabel?: string | React.ReactNode;
  rightLabel?: string | React.ReactNode;
};

export const InputTitle: React.FC<InputTitleProps> = ({ leftLabel, rightLabel }) => {
  return (
    <InputTitleWrapper>
      <div style={{ marginRight: 'auto' }}>
        {typeof leftLabel === 'string' ? <TextLabel value={leftLabel} /> : leftLabel}
      </div>
      <div style={{ marginLeft: 'auto' }}>
        {typeof rightLabel === 'string' ? <TextLabel value={rightLabel} /> : rightLabel}
      </div>
    </InputTitleWrapper>
  );
};
