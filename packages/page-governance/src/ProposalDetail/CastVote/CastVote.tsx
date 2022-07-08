import { FormControl, FormControlLabel, Icon, Radio, RadioGroup, Typography } from '@material-ui/core';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import React, { useCallback, useState } from 'react';

import { ControlLabelWrapper, Wrapper } from './styled';

const Label: React.FC<{ label: string; votesNumber: number; checked: boolean }> = ({ checked, label, votesNumber }) => {
  const pallet = useColorPallet();

  return (
    <Flex row jc='space-between' ai='center'>
      <Typography variant='body1' style={{ fontWeight: 700, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography
        variant='caption'
        component='p'
        style={{
          color: checked ? (pallet.type === 'dark' ? pallet.accentColor : pallet.primaryText) : pallet.secondaryText,
        }}
      >
        {isNaN(votesNumber) ? '-' : votesNumber} Votes
      </Typography>
    </Flex>
  );
};

export interface CastVoteProps {
  yesVotesAmount: number;
  noVotesAMount: number;
}

export const CastVote: React.FC<CastVoteProps> = ({ noVotesAMount, yesVotesAmount }) => {
  const [vote, setVote] = useState<'yes' | 'no' | null>(null);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setVote((event.target as HTMLInputElement).value as 'yes' | 'no');
    },
    [setVote]
  );

  const onVote = useCallback(() => {
    alert(`You are voting for '${vote}'`);
  }, [vote]);

  return (
    <Wrapper>
      <Typography variant='h5' component='h6' style={{ fontWeight: 600 }}>
        Cast your vote
      </Typography>
      <FormControl style={{ width: '100%', marginTop: '12px' }}>
        <RadioGroup
          aria-labelledby='controlled-radio-buttons-group'
          name='controlled-radio-buttons-group'
          value={vote}
          onChange={handleChange}
        >
          <ControlLabelWrapper checked={vote === 'yes'}>
            <FormControlLabel
              value='yes'
              control={<Radio checkedIcon={<Icon>check_circle</Icon>} />}
              label={<Label label='yes' votesNumber={yesVotesAmount} checked={vote === 'yes'} />}
            />
          </ControlLabelWrapper>
          <ControlLabelWrapper checked={vote === 'no'}>
            <FormControlLabel
              value='no'
              control={<Radio checkedIcon={<Icon>check_circle</Icon>} />}
              label={<Label label='no' votesNumber={noVotesAMount} checked={vote === 'no'} />}
            />
          </ControlLabelWrapper>
        </RadioGroup>
      </FormControl>

      <MixerButton
        style={{ width: '50%', padding: '12px', maxWidth: '180px', marginTop: '8px' }}
        disabled={vote === null}
        onClick={onVote}
      >
        Vote
      </MixerButton>
    </Wrapper>
  );
};
