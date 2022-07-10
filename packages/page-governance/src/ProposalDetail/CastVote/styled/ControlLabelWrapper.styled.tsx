import styled from 'styled-components';

export const ControlLabelWrapper = styled.div<{ checked: boolean }>`
  padding: 2px 16px;
  border: 1px solid;
  border-color: ${({ checked, theme }) => {
    if (checked) {
      return theme.type === 'dark' ? theme.accentColor : theme.primaryText;
    } else {
      return theme.borderColor;
    }
  }};
  border-radius: 8px;
  margin-bottom: 8px;

  .MuiRadio-colorSecondary.Mui-checked {
    color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : theme.primaryText)};
  }

  label {
    display: flex;
  }

  span {
    :last-child {
      flex-grow: 1;
    }
  }
`;
