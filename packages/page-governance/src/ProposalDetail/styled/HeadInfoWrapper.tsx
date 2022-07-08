import styled from 'styled-components';

import { sharedPaddingStyle } from './shared';

export const HeadInfoWrapper = styled.div`
  ${sharedPaddingStyle}
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
`;
