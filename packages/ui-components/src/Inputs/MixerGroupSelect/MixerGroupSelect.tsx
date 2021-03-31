/* eslint-disable @typescript-eslint/indent */
import { ButtonBase } from '@material-ui/core';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { lightPallet } from '@webb-dapp/ui-components/styling/colors';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import React from 'react';
import styled, { css } from 'styled-components';
import { MixerGroupItem } from '@webb-dapp/react-hooks';

const MixerGroupSelectWrapper = styled.div`
  height: 38px;
  display: flex;
  align-items: center;
`;
type MixerGroupSelectProps = {
  items: MixerGroupItem[];
  value?: MixerGroupItem;
  onChange?(item: MixerGroupItem): void;
};
const AmountChipWrapper = styled.span<{ selected?: boolean }>`
  && {
    border: 1px solid #ebeefd;
    border-radius: 20px;
    ${({ selected }) => {
      return selected
        ? css`
            background: #ebedf2;
          `
        : '';
    }};
    font-family: ${FontFamilies.AvenirNext};
    color: ${lightPallet.primaryText};
    height: 31px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const MixerGroupSelect: React.FC<MixerGroupSelectProps> = ({}) => {
  return (
    <InputLabel label={'Select Amount'}>
      <MixerGroupSelectWrapper>
        <AmountChipWrapper as={ButtonBase}>0.1 ETH</AmountChipWrapper>
      </MixerGroupSelectWrapper>
    </InputLabel>
  );
};
