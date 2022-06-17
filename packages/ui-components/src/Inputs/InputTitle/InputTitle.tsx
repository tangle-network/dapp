import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import React from 'react';
import styled, { css } from 'styled-components';

import { FlexBox } from '../..';

export const sharedLabelCss = css`
  font-family: 'Work Sans', sans-serif;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.02em;

  ${above.xs`
    font-size: 16px;
  `}
`;

const InputTitleWrapper = styled(FlexBox).attrs({
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
})`
  ${sharedLabelCss}
  margin-bottom: 8px;
`;

export type InputTitleProps = {
  leftLabel?: React.ReactNode;
  rightLabel?: React.ReactNode;
};

export const InputTitle: React.FC<InputTitleProps> = ({ leftLabel, rightLabel }) => {
  return (
    <InputTitleWrapper>
      <div style={{ marginRight: 'auto' }}>{leftLabel}</div>
      <div style={{ marginLeft: 'auto' }}>{rightLabel}</div>
    </InputTitleWrapper>
  );
};
