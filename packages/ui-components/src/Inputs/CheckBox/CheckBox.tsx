import { Checkbox, FormControlLabel } from '@material-ui/core';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import React from 'react';

import { CheckBoxProps } from './checkbox-props';
import { CheckBoxText } from './styled';

export const CheckBox: React.FC<CheckBoxProps> = ({ checked, label, onChange, size }) => {
  const pallet = useColorPallet();

  return (
    <FormControlLabel
      label={label && <CheckBoxText>{label}</CheckBoxText>}
      control={<Checkbox size={size} checked={checked} onChange={onChange} style={{ color: pallet.accentColor }} />}
    />
  );
};
