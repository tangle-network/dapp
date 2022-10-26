import {
  ClickAwayListener,
  Icon,
  IconButton,
  List,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@mui/material';
import Popper from '@mui/material/Popper';
import { useAccounts } from '@nepoche/react-hooks';
import { Flex } from '@nepoche/ui-components/Flex/Flex';
import React, { useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

const AccountName = styled.p`
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 150px;
  overflow: hidden;
`;

const StyledList = styled.ul`
  background: ${({ theme }) => theme.background};

  li {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding-left: 15px;

    &.selected,
    :hover {
      background: ${({ theme }) => theme.mainBackground};
    }

    position: relative;
  }
`;

const AccountManagerContent = styled.div<{ open: boolean }>`
  width: '100%';
  border-radius: 25px;
  border: 1px solid ${({ theme }) => theme.heavySelectionBorderColor};
  background: ${({ theme }) => theme.heavySelectionBackground};
  overflow: hidden;

  ${({ open, theme }) => {
    return open
      ? css`
          border-radius: 25px 25px 0px 0px;
        `
      : css``;
  }}

  .account-header {
    height: 30px;
    padding-left: 15px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid ${({ open, theme }) => (open ? theme.gray13 : 'transparent')};
  }

  .account-avatar {
    background: transparent;
  }
`;

const PopperList = styled.div<{ open: boolean }>`
  ${StyledList} {
    border-radius: 0px 0px 25px 25px;
    overflow: hidden;
    .account-avatar {
      background: transparent;
    }
    border: 1px solid ${({ theme }) => (theme.type === 'dark' ? 'black' : theme.gray13)};
    background: ${({ theme }) => theme.layer3Background};
    overflow: hidden;

    ${({ open }) => {
      return open
        ? css`
            max-height: 200px;
            overflow-y: auto;
          `
        : css`
            padding: 0 !important;
            margin: 0 !important;
            max-height: 0px !important;
          `;
    }}
  }
`;

type AccountManagerProps = {};

export const AccountManager: React.FC<AccountManagerProps> = () => {
  const { accounts, active, setActiveAccount } = useAccounts();
  const name = useMemo(
    () => active?.name || (active && `${active?.address.slice(0, 4)}..${active?.address.slice(-4)}`) || '',
    [active]
  );

  const accountAddresses = useMemo(() => {
    return (
      accounts?.map((acc) => ({
        address: acc.address || '',
        name: acc.name,
        self: acc,
        avatar: acc.avatar,
      })) ?? []
    );
  }, [accounts]);
  const $wrapper = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ width: '230px' }}>
      <ClickAwayListener
        onClickAway={() => {
          setIsOpen(false);
        }}
      >
        <AccountManagerContent open={isOpen} ref={$wrapper}>
          <div className='account-header'>
            <div
              style={{
                display: 'flex',
                flex: '1',
                marginLeft: '10px',
              }}
            >
              <AccountName as={Typography} color={'textPrimary'}>
                {name}
              </AccountName>
            </div>

            <div className={'account-button-wrapper'}>
              <IconButton
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'all ease .3s',
                }}
                onClick={() => {
                  setIsOpen((p) => !p);
                }}
              >
                <Icon>expand_more</Icon>
              </IconButton>
            </div>
          </div>
          <Popper placement={'bottom-end'} open={isOpen} anchorEl={$wrapper?.current} style={{ zIndex: '1500' }}>
            <PopperList open={isOpen} style={{ width: $wrapper.current?.clientWidth }}>
              <StyledList as={List} dense disablePadding>
                {accountAddresses.map((account, inx) => {
                  const { address, name } = account;
                  const isActive = address === active?.address;
                  return (
                    <li
                      role={'button'}
                      onClick={async () => {
                        await setActiveAccount(account.self);
                        setIsOpen(false);
                      }}
                      className={isActive ? 'selected' : ''}
                      key={address + 'accountlist'}
                    >
                      <ListItemText>
                        <Flex flex={1}>
                          <AccountName as={Typography} color={'textPrimary'}>
                            {name}
                          </AccountName>
                        </Flex>
                      </ListItemText>

                      <ListItemSecondaryAction>
                        <IconButton>
                          {isActive ? (
                            <svg
                              width='15'
                              height='15'
                              viewBox='0 0 15 15'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M7.5 0C3.35785 0 0 3.35785 0 7.5C0 11.6421 3.35785 15 7.5 15C11.6422 15 15 11.6421 15 7.5C15 3.35785 11.6422 0 7.5 0ZM10.8734 6.22375L7.43652 9.66003C7.31445 9.7821 7.15454 9.84314 6.99463 9.84314C6.83472 9.84314 6.6748 9.7821 6.55273 9.66003L4.98962 8.09692C4.74548 7.85278 4.74548 7.45728 4.98962 7.21313C5.23376 6.96899 5.62927 6.96899 5.87341 7.21313L6.99463 8.33435L9.98962 5.33997C10.2338 5.09583 10.6293 5.09583 10.8734 5.33997C11.1176 5.58411 11.1176 5.97961 10.8734 6.22375Z'
                                fill='#52B684'
                              />
                            </svg>
                          ) : (
                            <svg
                              width='16'
                              height='16'
                              viewBox='0 0 12 16'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M0.177376 3.51503C0.121172 3.45784 0.0765611 3.3898 0.0461176 3.31484C0.015674 3.23988 0 3.15948 0 3.07827C0 2.99706 0.015674 2.91666 0.0461176 2.8417C0.0765611 2.76674 0.121172 2.6987 0.177376 2.64151L2.57599 0.180911C2.6319 0.123555 2.69827 0.0780579 2.77132 0.0470172C2.84437 0.0159765 2.92267 8.54667e-10 3.00174 0C3.08081 -8.54667e-10 3.1591 0.0159765 3.23215 0.0470172C3.30521 0.0780579 3.37158 0.123555 3.42749 0.180911C3.4834 0.238266 3.52775 0.306358 3.55801 0.381297C3.58827 0.456235 3.60384 0.536554 3.60384 0.617668C3.60384 0.698781 3.58827 0.7791 3.55801 0.854039C3.52775 0.928978 3.4834 0.997069 3.42749 1.05442L2.04829 2.46312H7.79896C8.91222 2.46312 9.97989 2.91679 10.7671 3.72433C11.5543 4.53188 11.9965 5.62714 11.9965 6.76917C11.9965 6.93232 11.9333 7.08879 11.8209 7.20415C11.7084 7.31951 11.5559 7.38432 11.3969 7.38432C11.2378 7.38432 11.0853 7.31951 10.9729 7.20415C10.8604 7.08879 10.7972 6.93232 10.7972 6.76917C10.7972 6.36526 10.7197 5.9653 10.569 5.59213C10.4183 5.21897 10.1975 4.8799 9.91905 4.59429C9.64063 4.30868 9.31011 4.08212 8.94634 3.92755C8.58258 3.77298 8.19269 3.69342 7.79896 3.69342H2.04829L3.42749 5.10212C3.4837 5.1593 3.52831 5.22734 3.55875 5.3023C3.58919 5.37726 3.60487 5.45767 3.60487 5.53887C3.60487 5.62008 3.58919 5.70048 3.55875 5.77544C3.52831 5.85041 3.4837 5.91844 3.42749 5.97563C3.37175 6.03329 3.30542 6.07905 3.23235 6.11028C3.15928 6.14151 3.0809 6.15759 3.00174 6.15759C2.92258 6.15759 2.8442 6.14151 2.77113 6.11028C2.69805 6.07905 2.63173 6.03329 2.57599 5.97563L0.177376 3.51503ZM9.42401 10.0233C9.3111 9.90749 9.15795 9.84241 8.99826 9.84241C8.83857 9.84241 8.68543 9.90749 8.57251 10.0233C8.45959 10.1392 8.39616 10.2963 8.39616 10.4601C8.39616 10.6239 8.45959 10.781 8.57251 10.8968L9.95171 12.3055H4.20104C3.40585 12.3055 2.64324 11.9815 2.08095 11.4047C1.51867 10.8278 1.20278 10.0455 1.20278 9.22978C1.20278 9.06663 1.1396 8.91016 1.02715 8.7948C0.914691 8.67944 0.762167 8.61463 0.603129 8.61463C0.444092 8.61463 0.291568 8.67944 0.179111 8.7948C0.0666546 8.91016 0.00347699 9.06663 0.00347699 9.22978C0.00347699 10.3718 0.44572 11.4671 1.23292 12.2746C2.02011 13.0822 3.08778 13.5358 4.20104 13.5358H9.95171L8.57251 14.9445C8.5163 15.0017 8.47169 15.0697 8.44125 15.1447C8.41081 15.2197 8.39513 15.3001 8.39513 15.3813C8.39513 15.4625 8.41081 15.5429 8.44125 15.6179C8.47169 15.6928 8.5163 15.7609 8.57251 15.818C8.62825 15.8757 8.69458 15.9215 8.76765 15.9527C8.84072 15.9839 8.9191 16 8.99826 16C9.07742 16 9.1558 15.9839 9.22887 15.9527C9.30195 15.9215 9.36827 15.8757 9.42401 15.818L11.8226 13.3574C11.8788 13.3003 11.9234 13.2322 11.9539 13.1573C11.9843 13.0823 12 13.0019 12 12.9207C12 12.8395 11.9843 12.7591 11.9539 12.6841C11.9234 12.6091 11.8788 12.5411 11.8226 12.4839L9.42401 10.0233Z'
                                fill='#3351F2'
                              />
                            </svg>
                          )}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </li>
                  );
                })}
              </StyledList>
            </PopperList>
          </Popper>
        </AccountManagerContent>
      </ClickAwayListener>
    </div>
  );
};
