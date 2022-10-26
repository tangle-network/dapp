import { Checkbox, FormControlLabel } from '@mui/material';
import { useColorPallet } from '@nepoche/styled-components-theme';
import React from 'react';

import { CheckBoxProps } from './checkbox-props';
import { CheckBoxText } from './styled';

export const CheckBox: React.FC<CheckBoxProps> = ({ checked, label, onChange, size }) => {
  const pallet = useColorPallet();

  return (
    <FormControlLabel
      style={{ marginRight: '0px' }}
      label={label && <CheckBoxText>{label}</CheckBoxText>}
      control={
        <Checkbox
          size={size}
          checked={checked}
          onChange={onChange}
          style={{ color: pallet.accentColor, padding: '0px', paddingRight: '4px' }}
        />
      }
    />
  );
};
