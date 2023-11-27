import { type FC, useMemo } from 'react';
import { formatEther } from 'viem';
import cx from 'classnames';
import {
  AddressChip,
  ChainChip,
  CopyWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ArrowLeft } from '@webb-tools/icons';
import { chainsConfig } from '@webb-tools/dapp-config';

import { SectionWrapper, NoteOrAmountWrapper } from './Wrapper';
import { InputOrOutputNotesProps } from './types';

const InputOrOutputNotes: FC<InputOrOutputNotesProps> = ({
  activity,
  type,
  notes,
  fungibleTokenSymbol,
  typedChainId,
  noteAccountAddress,
}) => {
  return (
    <SectionWrapper>
      <div className="flex justify-between items-center">
        <Typography variant="body2" fw="bold">
          {type === 'input' ? 'Source' : 'Destination'}
        </Typography>
        <div className="flex items-center gap-2">
          {typedChainId && (
            <ChainChip
              chainName={chainsConfig[typedChainId].name}
              chainType={chainsConfig[typedChainId].group}
            />
          )}
          <AddressChip address={noteAccountAddress} isNoteAccount />
        </div>
      </div>
      {notes.map((note) => {
        const amount = note.note.amount;
        const serialization = note.serialize();
        const shortenNoteSerialization = `${serialization
          .split('')
          .slice(0, 14)
          .join('')}...${serialization.split('').slice(-8).join('')}`;
        return (
          <NoteOrAmountWrapper className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Typography variant="body2">Note</Typography>
              <div className="flex items-center gap-1">
                <Typography variant="body2">
                  {shortenNoteSerialization}
                </Typography>
                <CopyWithTooltip textToCopy={serialization} isButton={false} />
              </div>
            </div>

            <div className="flex justify-end items-center gap-1">
              <Typography variant="body2" fw="semibold">
                {formatEther(BigInt(amount))} {fungibleTokenSymbol}
              </Typography>
              <ArrowBadge activity={activity} type={type} />
            </div>
          </NoteOrAmountWrapper>
        );
      })}
    </SectionWrapper>
  );
};

export default InputOrOutputNotes;

/** @internal */
const ArrowBadge: FC<Pick<InputOrOutputNotesProps, 'activity' | 'type'>> = ({
  activity,
  type,
}) => {
  const badgeColor = useMemo(() => {
    let color: 'green' | 'blue' | 'yellow' | undefined;

    switch (true) {
      case activity === 'deposit' && type === 'output':
        color = 'green';
        break;
      case activity === 'deposit' && type === 'input':
        color = undefined;
        break;
      case type === 'input':
        color = 'blue';
        break;
      case type === 'output':
        color = 'yellow';
        break;
      default:
        color = undefined;
        break;
    }

    return color;
  }, [activity, type]);

  if (!badgeColor) return null;

  return (
    <div
      className={cx('rounded-full w-6 h-6 flex justify-center items-center', {
        'bg-green-10 dark:bg-green-120': badgeColor === 'green',
        'bg-blue-10 dark:bg-blue-120': badgeColor === 'blue',
        'bg-yellow-10 dark:bg-yellow-120': badgeColor === 'yellow',
      })}
    >
      <ArrowLeft
        className={cx(
          {
            '!fill-green-90 dark:!fill-green-30': badgeColor === 'green',
            '!fill-blue-90 dark:!fill-blue-30': badgeColor === 'blue',
            '!fill-yellow-90 dark:!fill-yellow-30': badgeColor === 'yellow',
          },
          {
            'rotate-180': type === 'input',
          }
        )}
      />
    </div>
  );
};
