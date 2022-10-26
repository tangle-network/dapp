import { ButtonBase } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

type CloseButtonProps = {
  onClick: () => void;
};

const CloseDepositModal = styled.button`
  &&& {
    position: absolute;
    right: 20px;
    top: 20px;
  }
`;

export const CloseButton: React.FC<CloseButtonProps> = ({ onClick }) => {
  return (
    <CloseDepositModal as={ButtonBase} onClick={onClick}>
      <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M12.5074 10L19.5575 2.94985C20.1475 2.35988 20.1475 1.35693 19.5575 0.766962L19.233 0.442478C18.6431 -0.147493 17.6401 -0.147493 17.0501 0.442478L10 7.49263L2.94985 0.442478C2.35988 -0.147493 1.35693 -0.147493 0.766962 0.442478L0.442478 0.766962C-0.147493 1.35693 -0.147493 2.35988 0.442478 2.94985L7.49263 10L0.442478 17.0501C-0.147493 17.6401 -0.147493 18.6431 0.442478 19.233L0.766962 19.5575C1.35693 20.1475 2.35988 20.1475 2.94985 19.5575L10 12.5074L17.0501 19.5575C17.6401 20.1475 18.6431 20.1475 19.233 19.5575L19.5575 19.233C20.1475 18.6431 20.1475 17.6401 19.5575 17.0501L12.5074 10Z'
          fill='#C8CEDD'
        />
      </svg>
    </CloseDepositModal>
  );
};
