import WebbTextLogo from '@nepoche/logos/misc/WebbTextLogo';
import { useColorPallet } from '@nepoche/styled-components-theme';
import { getRoundedAmountString } from '@nepoche/ui-components/utils';
import * as React from 'react';
import styled from 'styled-components';

const DecalWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AmountCircle = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: ${({ theme }) => (theme.type === 'dark' ? 'transparent' : '#242424')};
  border: ${({ theme }) => `1px solid ${theme.accentColor}`};

  .resized-amount {
    font-weight: 600;
    letter-spacing: -1px;
    font-size: 20px;
    color: ${({ theme }) => theme.accentColor};
  }

  .resized-symbol {
    font-size: 8px;
    color: ${({ theme }) => theme.accentColor};
  }
`;

interface DepositAmountDecalProps {
  amount: number;
  symbol: string;
}

export const DepositAmountDecal: React.FC<DepositAmountDecalProps> = ({ amount, symbol }) => {
  const palette = useColorPallet();

  return (
    <DecalWrapper>
      {/* Amount chip */}
      <AmountCircle>
        <p className='resized-amount'>{getRoundedAmountString(amount)}</p>
        <p className='resized-symbol'>{symbol}</p>
      </AmountCircle>
      {/* Ellipsis */}
      <div style={{ padding: '10px' }}>
        <svg width='7.5' height='7.5' fill='#595959' xmlns='http://www.w3.org/2000/svg'>
          <circle cx='5' cy='5' r='2.5' fill='#595959' />
          <path fill='#595959' />
        </svg>
        <svg width='7.5' height='7.5' fill='#595959' xmlns='http://www.w3.org/2000/svg'>
          <circle cx='5' cy='5' r='2.5' fill='#595959' />
          <path fill='#595959' />
        </svg>
        <svg width='7.5' height='7.5' fill='#595959' xmlns='http://www.w3.org/2000/svg'>
          <circle cx='5' cy='5' r='2.5' fill='#595959' />
          <path fill='#595959' />
        </svg>
      </div>
      {/* Webb text logo */}
      {WebbTextLogo(palette.primaryText)}
    </DecalWrapper>
  );
};
