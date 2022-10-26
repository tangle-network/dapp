import styled from 'styled-components';

export const ItemWrapper = styled.li<{ idx: number; selected: boolean }>`
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: none;
  padding: 4px 8px;
  background-color: ${({ theme }) => theme.lightSelectionBackground};
  cursor: ${({ selected }) => (selected ? 'no-drop' : 'pointer')};
  :hover {
    background-color: ${({ selected, theme }) =>
      selected ? theme.lightSelectionBackground : theme.heavySelectionBackground};
  }

  margin-top: ${({ idx }) => (idx ? '12px' : '0px')};
  border: ${({ selected, theme }) =>
    selected ? `1px solid ${theme.type === 'dark' ? theme.accentColor : '#000'}` : 'none'};

  .MuiListItemAvatar-root {
    min-width: 0px;
    margin-right: 6px;
  }

  .list-item-avatar {
    background: transparent;
    width: 28px;
    height: 28px;
  }

  .list-item-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;
