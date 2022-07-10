import styled from 'styled-components';

export const Bar = styled.span<{ percent: number; label: 'yes' | 'no' }>`
  display: flex;
  justify-content: center;
  width: ${({ percent }) => (percent === 0 ? '100' : percent)}%;
  background-color: ${({ label, percent, theme }) =>
    percent === 0 ? theme.heavySelectionBackground : label === 'yes' ? theme.accentColor : '#FFC149'};
  color: #fff;
  padding: 12px 0px;
  border-radius: 8px;
  text-transform: uppercase;
`;
