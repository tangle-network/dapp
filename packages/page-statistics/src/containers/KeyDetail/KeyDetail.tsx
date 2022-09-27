import { SessionKeyStatus, useKey } from '@webb-dapp/page-statistics/provider/hooks';
import {
  Avatar,
  AvatarGroup,
  Button,
  Chip,
  DrawerCloseButton,
  KeyCard,
  KeyValueWithButton,
  LabelWithValue,
  TimeLine,
  TimeLineItem,
  TimeProgress,
  TitleWithInfo,
} from '@webb-dapp/webb-ui-components/components';
import { ArrowLeft, ArrowRight, Close, Expand, Spinner } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import cx from 'classnames';
import { forwardRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { AuthoritiesTable } from '../AuthoritiesTable';
import { AuthorityRowType, KeyDetailProps } from './types';

export const KeyDetail = forwardRef<HTMLDivElement, KeyDetailProps>(({ isPage }, ref) => {
  const { keyId = '' } = useParams<{ keyId: string }>();
  const navigate = useNavigate();

  const { key, prevAndNextKey: prevAndNextKeyResp } = useKey(keyId);

  const { error, isFailed, isLoading, val: keyDetail } = key;
  const { val: prevAndNextKey } = prevAndNextKeyResp;

  const commonCardClsx = useMemo(() => 'rounded-lg bg-mono-0 dark:bg-mono-180', []);

  const authoritiesTblData = useMemo<AuthorityRowType[]>(() => {
    return keyDetail
      ? keyDetail.authorities.map((aut) => ({ ...aut, detaillUrl: 'https://webb.tools' })) // TODO: Determine the detail url
      : ([] as AuthorityRowType[]);
  }, [keyDetail]);

  const onNextKey = useCallback(() => {
    if (prevAndNextKey?.nextKeyId) {
      navigate(`/keys${isPage ? '' : '/drawer'}/${prevAndNextKey.nextKeyId}`);
    }
  }, [isPage, navigate, prevAndNextKey]);

  const onPreviousKey = useCallback(() => {
    if (prevAndNextKey?.previousKeyId) {
      navigate(`/keys${isPage ? '' : '/drawer'}/${prevAndNextKey.previousKeyId}`);
    }
  }, [isPage, navigate, prevAndNextKey]);

  if (isLoading) {
    return <Spinner size='xl' />;
  }

  if (isFailed) {
    return (
      <div>
        <Typography variant='body1' className='text-red-100 dark:text-red-10'>
          {error ?? 'Unexpected error'}
        </Typography>
      </div>
    );
  }

  if (!keyDetail) {
    return null; // Not display anything
  }

  return (
    <div className={cx('flex flex-col space-y-4', isPage ? '' : 'p-6 ')} ref={ref}>
      {/** Key detail */}
      <div className={cx('flex flex-col p-4 space-y-4', commonCardClsx)}>
        {/** Title */}
        <div className='flex items-center justify-between'>
          {/** Title with info and expand button */}
          <div className='flex items-center space-x-3'>
            <Link to={isPage ? `/keys` : `/keys/${keyDetail.id}`}>
              {isPage ? <ArrowLeft size='lg' /> : <Expand size='lg' />}
            </Link>
            <TitleWithInfo title='Key Details' variant='h4' info='Key Details' />
          </div>

          {/** Right buttons */}
          <div>
            <div className='flex items-center space-x-4'>
              {/** Previous/Next Buttons */}
              <div className='flex space-x-2'>
                <Button
                  size='sm'
                  leftIcon={<ArrowLeft className='!fill-current' />}
                  varirant='utility'
                  className='uppercase'
                  isDisabled={!prevAndNextKey || !prevAndNextKey.previousKeyId}
                  onClick={onPreviousKey}
                >
                  Prev Key
                </Button>
                <Button
                  size='sm'
                  rightIcon={<ArrowRight className='!fill-current' />}
                  varirant='utility'
                  className='uppercase'
                  isDisabled={!prevAndNextKey || !prevAndNextKey.nextKeyId}
                  onClick={onNextKey}
                >
                  Next Key
                </Button>
              </div>

              {/** Close modal */}
              {!isPage && (
                <DrawerCloseButton>
                  <Close size='lg' />
                </DrawerCloseButton>
              )}
            </div>
          </div>
        </div>

        {/** Session number */}
        <div className='flex items-center space-x-2'>
          <Chip color='green' className='uppercase'>
            {keyDetail.isCurrent ? 'Current' : 'Next'}
          </Chip>
          <LabelWithValue label='Session: ' value={keyDetail.session} />
        </div>

        {/** Active Period */}
        <div className='flex flex-col space-y-3'>
          <TitleWithInfo title='Active Period' variant='body1' titleComponent='h6' info='Active period' />

          <TimeProgress startTime={keyDetail.start} endTime={keyDetail.end} />
        </div>

        {/** Compressed/Uncompressed Keys */}
        <div className='flex space-x-4'>
          <KeyCard title='Compressed key' keyValue={keyDetail.compressed} className='grow shrink basis-0 max-w-none' />
          <KeyCard
            title='Uncompressed key'
            keyValue={keyDetail.uncompressed}
            className='grow shrink basis-0 max-w-none'
          />
        </div>
      </div>

      {/** Key history */}
      <div className={cx('flex flex-col p-4 space-y-4', commonCardClsx)}>
        <TitleWithInfo title='Key History' variant='h5' info='Key history' />

        <TimeLine>
          {keyDetail.history.map((hist, idx) => {
            const { at, hash, status } = hist;

            switch (status) {
              case SessionKeyStatus.Generated: {
                return (
                  <TimeLineItem
                    key={`${at.toString()}-${idx}`}
                    title={status}
                    time={at}
                    txHash={hash}
                    externalUrl='https://webb.tools' // TODO: Determine the external url
                  />
                );
              }

              case SessionKeyStatus.Signed: {
                return (
                  <TimeLineItem
                    key={`${at.toString()}-${idx}`}
                    title={status}
                    time={at}
                    txHash={hash}
                    externalUrl='https://webb.tools' // TODO: Determine the external url
                    extraContent={
                      <div className='flex items-center space-x-2'>
                        <KeyValueWithButton keyValue={keyDetail.uncompressed} size='sm' />
                        <Button varirant='link' size='sm' className='uppercase'>
                          Detail
                        </Button>
                      </div>
                    }
                  />
                );
              }

              case SessionKeyStatus.Rotated: {
                return (
                  <TimeLineItem
                    key={`${at.toString()}-${idx}`}
                    title={status}
                    time={at}
                    txHash={hash}
                    externalUrl='https://webb.tools'
                    extraContent={
                      <div className='flex items-center space-x-4'>
                        <LabelWithValue label='Height' value={keyDetail.height} />
                        {/** TODO: Proposal type */}
                        <LabelWithValue label='Proposal' value='KeyRotation' />
                        <LabelWithValue
                          label='Proposers'
                          value={
                            <AvatarGroup total={keyDetail.authorities.length}>
                              {keyDetail.authorities.map((author) => (
                                <Avatar key={author.id} value={author.account} />
                              ))}
                            </AvatarGroup>
                          }
                        />
                        <Button size='sm' varirant='link' className='uppercase'>
                          Details
                        </Button>
                      </div>
                    }
                  />
                );
              }

              default: {
                throw new Error('Unknown SessionKeyStatus in KeyDetail component');
              }
            }
          })}
        </TimeLine>
      </div>

      {/** Stats */}
      <div className={cx('flex space-x-4 rounded-')}>
        <div
          className={cx(
            'flex flex-col items-center justify-center py-3 space-y-1 rounded-lg grow',
            isPage ? 'bg-mono-0 dark:bg-mono-180' : 'bg-mono-20 dark:bg-mono-160'
          )}
        >
          <Typography variant='h4' fw='bold' className='block'>
            {keyDetail.keyGenThreshold}
          </Typography>
          <Typography variant='body1' fw='bold' className='block'>
            Threshold
          </Typography>
        </div>

        <div
          className={cx(
            'flex flex-col items-center justify-center py-3 space-y-1 rounded-lg grow',
            isPage ? 'bg-mono-0 dark:bg-mono-180' : 'bg-mono-20 dark:bg-mono-160'
          )}
        >
          <Typography variant='h4' fw='bold' className='block'>
            {keyDetail.numberOfValidators}
          </Typography>
          <Typography variant='body1' fw='bold' className='block'>
            Validator
          </Typography>
        </div>
      </div>

      {/** Authorities Table */}
      <AuthoritiesTable data={authoritiesTblData} />
    </div>
  );
});
