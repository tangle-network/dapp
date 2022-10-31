import { Typography } from '../../typography';
import { forwardRef } from 'react';

import { Button } from '../Button';
import { Card } from '../Card';
import { Chip } from '../Chip';
import { KeyValueWithButton } from '../KeyValueWithButton';
import { LabelWithValue } from '../LabelWithValue';
import { TimeProgress } from '../TimeProgress';
import { TitleWithInfo } from '../TitleWithInfo';
import { NetworkThresholdsCardProps } from './types';

/**
 * The `NetworkThresholdsCard` component displays the network thresholds data
 *
 * ```jsx
 *  import { useNetworkThresholdsSeedData } from "../..";
 *
 *  const seedData = useNetworkThresholdsSeedData();
 *
 *  // ...
 *
 *  <NetworkThresholdsCard {...seedData} className='max-w-[1376px] mt-6' />
 * ```
 */
export const NetworkThresholdsCard = forwardRef<HTMLDivElement, NetworkThresholdsCardProps>(
  (
    {
      endTime,
      keyValue,
      keygenThreshold,
      sessionNumber,
      signatureThreshold,
      startTime,
      thresholdType,
      title,
      titleInfo,
      viewHistoryUrl,
      ...props
    },
    ref
  ) => {
    return (
      <Card {...props} ref={ref}>
        {/** Top */}
        <TitleWithInfo title={title} info={titleInfo} variant='h5' titleComponent='h5' />

        {/** Content */}
        <div className='flex justify-evenly'>
          <div className='flex flex-col items-center justify-center'>
            <TitleWithInfo title='Keygen' info='Keygen' variant='body2' titleComponent='p' />
            <Typography variant='h4' fw='bold' className='mt-2'>
              {keygenThreshold}
            </Typography>
          </div>

          <div className='flex flex-col items-center justify-center'>
            <TitleWithInfo title='Signature' info='Signature' variant='body2' titleComponent='p' />
            <Typography variant='h4' fw='bold' className='mt-2'>
              {signatureThreshold}
            </Typography>
          </div>
        </div>

        <TimeProgress startTime={startTime} endTime={endTime} />

        {/** Bottom */}
        <div className='flex justify-between'>
          <div className='flex items-center space-x-2'>
            <Chip color='green' className='inline-block'>
              {thresholdType}
            </Chip>
            <LabelWithValue label='session:' value={sessionNumber} />
            <span className='inline-block font-semibold body2'>/</span>
            <KeyValueWithButton size='sm' keyValue={keyValue} />
          </div>
          <Button className='block' variant='link' href={viewHistoryUrl} target='_blank' size='sm'>
            View history
          </Button>
        </div>
      </Card>
    );
  }
);
