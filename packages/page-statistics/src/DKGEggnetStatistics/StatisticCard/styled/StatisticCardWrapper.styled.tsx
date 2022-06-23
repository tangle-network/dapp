import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import styled, { css } from 'styled-components';

export type StatisticCardWrapperProps = {
  width?: string;
  labelColor?: string;
};

export const StatisticCardWrapper = styled.div<StatisticCardWrapperProps>`
  width: ${({ width }) => (width ? width : '104px')};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-evenly;
  padding: 4px;
  position: relative;

  ${({ labelColor }) =>
    labelColor
      ? css`
          padding-left: 8px;

          ::before {
            position: absolute;
            content: '';
            top: 4px;
            bottom: 8px;
            left: 0;
            width: 4px;
            border-radius: 2px;
            background-color: ${labelColor};
          }
        `
      : css``}
`;
