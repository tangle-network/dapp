import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowLeft,
  ArrowRight,
  Close,
  Expand,
  Spinner,
} from '@webb-tools/icons';
import {
  Avatar,
  Button,
  CardTable,
  Chip,
  DrawerCloseButton,
  KeyCard,
  KeyValueWithButton,
  LabelWithValue,
  Progress,
  Table,
  TimeLine,
  TimeLineItem,
  TimeProgress,
  TitleWithInfo,
} from '@webb-tools/webb-ui-components/components';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { POLKADOT_JS_EXPLORER_URL } from '@webb-tools/webb-ui-components/constants';
import { Typography } from '@webb-tools/webb-ui-components/typography';
import cx from 'classnames';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { ECPairFactory } from 'ecpair';
import { forwardRef, useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as tinysecp from 'tiny-secp256k1';
import {
  KeyGenAuthority,
  SessionKeyStatus,
  useKey,
} from '../../provider/hooks';
import { useStatsContext, useSubQLtime } from '../../provider/stats-provider';
import { getChipColorByKeyStatus } from '../../utils';
import { KeyDetailProps, KeyGenAuthoredTableProps } from './types';
import { AddressType } from '@webb-tools/dapp-config/types';

export const KeyDetail = forwardRef<HTMLDivElement, KeyDetailProps>(
  ({ isPage }, ref) => {
    const { keyId = '' } = useParams<{ keyId: string }>();
    const navigate = useNavigate();

    const { key, prevAndNextKey: prevAndNextKeyResp } = useKey(keyId);

    const { sessionHeight } = useStatsContext();

    const keysList = useMemo(() => {
      const keys = localStorage.getItem('keys');

      return keys ? JSON.parse(keys) : [];
    }, [keyId]);

    const { key: latestKey } = useKey(keysList[0]);

    const { error, isFailed, isLoading, val: keyDetail } = key;

    const { val: latestKeyDetail } = latestKey;

    const { val: prevAndNextKey } = prevAndNextKeyResp;

    const commonCardClsx = useMemo(
      () => 'rounded-lg bg-mono-0 dark:bg-mono-180',
      []
    );
    const time = useSubQLtime();

    useEffect(() => {
      const isKeyMatch =
        keysList && keysList.length > 1 && keysList[1] === keyId;

      if (isKeyMatch && latestKeyDetail?.start && keyDetail?.start) {
        const latestKeyStartTime =
          new Date(latestKeyDetail.start).getTime() / 1000;
        const currentKeyStartTime = new Date(keyDetail.start).getTime() / 1000;
        const timeDifference = latestKeyStartTime - currentKeyStartTime;

        if (timeDifference < sessionHeight) {
          keyDetail.end = latestKeyDetail.start;
        }
      }
    }, [keyId, keyDetail, latestKeyDetail]);

    const onNextKey = useCallback(() => {
      if (prevAndNextKey?.nextKeyId) {
        navigate(`/keys${isPage ? '' : '/drawer'}/${prevAndNextKey.nextKeyId}`);
      }
    }, [isPage, navigate, prevAndNextKey]);

    const onPreviousKey = useCallback(() => {
      if (prevAndNextKey?.previousKeyId) {
        navigate(
          `/keys${isPage ? '' : '/drawer'}/${prevAndNextKey.previousKeyId}`
        );
      }
    }, [isPage, navigate, prevAndNextKey]);

    if (isLoading || keyDetail === null) {
      return (
        <div className="flex items-center justify-center min-w-full min-h-full">
          <Spinner size="xl" />
        </div>
      );
    }

    if (isFailed) {
      return (
        <div>
          <Typography variant="body1" className="text-red-100 dark:text-red-10">
            {error ?? 'Unexpected error'}
          </Typography>
        </div>
      );
    }

    if (!keyDetail) {
      return null; // Not display anything
    }

    return (
      <div
        className={cx('flex flex-col space-y-4', isPage ? '' : 'p-6 ')}
        ref={ref}
      >
        {/** Key detail */}
        <div className={cx('flex flex-col p-4 space-y-4', commonCardClsx)}>
          {/** Title */}
          <div className="flex items-center justify-between">
            {/** Title with info and expand button */}
            <div className="flex items-center space-x-3">
              <Link to={isPage ? `/keys` : `/keys/${keyDetail.id}`}>
                {isPage ? (
                  <div className="flex items-center">
                    <ArrowLeft size="lg" />
                  </div>
                ) : (
                  <Expand size="lg" />
                )}
              </Link>
              <TitleWithInfo
                title="Key Details"
                variant="h4"
                info="Key Details"
              />
            </div>

            {/** Right buttons */}
            <div>
              <div className="flex items-center space-x-4">
                {/** Previous/Next Buttons */}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    leftIcon={<ArrowLeft className="!fill-current" />}
                    variant="utility"
                    isDisabled={
                      !prevAndNextKey || !prevAndNextKey.previousKeyId
                    }
                    onClick={onPreviousKey}
                  >
                    Prev Key
                  </Button>
                  <Button
                    size="sm"
                    rightIcon={<ArrowRight className="!fill-current" />}
                    variant="utility"
                    isDisabled={!prevAndNextKey || !prevAndNextKey.nextKeyId}
                    onClick={onNextKey}
                  >
                    Next Key
                  </Button>
                </div>

                {/** Close modal */}
                {!isPage && (
                  <DrawerCloseButton>
                    <Close size="lg" />
                  </DrawerCloseButton>
                )}
              </div>
            </div>
          </div>

          {/** Session number */}
          <div className="flex items-center space-x-2">
            <Chip color={getChipColorByKeyStatus(keyDetail.isCurrent)}>
              {keyDetail.isDone
                ? 'Previous'
                : keyDetail.isCurrent
                ? 'Current'
                : 'Next'}
            </Chip>
            <LabelWithValue label="Session: " value={keyDetail.session} />
          </div>

          {/** Active Period */}
          <div className="flex flex-col space-y-3">
            <TitleWithInfo
              title="Active Period"
              variant="body1"
              titleComponent="h6"
              info="Active period"
            />

            <TimeProgress
              now={time}
              startTime={keyDetail.start ?? null}
              endTime={keyDetail.end ?? null}
            />
          </div>

          {/** Compressed/Uncompressed Keys */}
          <div className="flex space-x-4">
            <KeyCard
              title="Compressed key"
              keyValue={keyDetail.compressed}
              className="grow shrink basis-0 max-w-none"
            />
            <KeyCard
              title="Uncompressed key"
              keyValue={uncompressPublicKey(keyDetail.compressed)}
              className="grow shrink basis-0 max-w-none"
            />
          </div>
        </div>

        {/** Key history */}
        <div className={cx('flex flex-col p-4 space-y-4', commonCardClsx)}>
          <TitleWithInfo title="Key History" variant="h5" info="Key history" />

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
                      blockHash={hash}
                      externalUrl={POLKADOT_JS_EXPLORER_URL + hash}
                    />
                  );
                }

                case SessionKeyStatus.Signed: {
                  return (
                    <TimeLineItem
                      key={`${at.toString()}-${idx}`}
                      title={status}
                      time={at}
                      blockHash={hash}
                      externalUrl={POLKADOT_JS_EXPLORER_URL + hash}
                    />
                  );
                }

                case SessionKeyStatus.Rotated: {
                  return (
                    <TimeLineItem
                      key={`${at.toString()}-${idx}`}
                      title={status}
                      time={at}
                      blockHash={hash}
                      externalUrl={POLKADOT_JS_EXPLORER_URL + hash}
                    />
                  );
                }

                default: {
                  throw new Error(
                    'Unknown SessionKeyStatus in KeyDetail component'
                  );
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
              isPage
                ? 'bg-mono-0 dark:bg-mono-180'
                : 'bg-mono-20 dark:bg-mono-160'
            )}
          >
            <Typography variant="h4" fw="bold" className="block">
              {keyDetail.signatureThreshold ?? '--'}
            </Typography>
            <Typography variant="body1" fw="bold" className="block">
              Signature Threshold
            </Typography>
          </div>

          <div
            className={cx(
              'flex flex-col items-center justify-center py-3 space-y-1 rounded-lg grow',
              isPage
                ? 'bg-mono-0 dark:bg-mono-180'
                : 'bg-mono-20 dark:bg-mono-160'
            )}
          >
            <Typography variant="h4" fw="bold" className="block">
              {keyDetail.keyGenThreshold ?? '--'}
            </Typography>
            <Typography variant="body1" fw="bold" className="block">
              Keygen Threshold
            </Typography>
          </div>
        </div>

        {/** Authorities Table */}
        <CardTable
          titleProps={{
            title: 'DKG Authorities',
            info: 'DKG Authorities',
            variant: 'h5',
          }}
        >
          <KeyGenAuthoredTable data={keyDetail.authorities} />
        </CardTable>
      </div>
    );
  }
);

const columnHelper = createColumnHelper<KeyGenAuthority>();

const columns = [
  columnHelper.accessor('id', {
    header: 'Participant',
    cell: (props) => (
      <div className="flex items-center space-x-2">
        <Avatar sourceVariant={'address'} value={props.getValue<string>()} />
        <KeyValueWithButton
          keyValue={props.getValue<string>()}
          size="sm"
          isHiddenLabel
        />
      </div>
    ),
  }),

  columnHelper.accessor('location', {
    header: 'Location',
    cell: (props) => {
      const countryCode = getUnicodeFlagIcon(props.getValue());
      return (
        <Typography
          variant="h5"
          fw="bold"
          component="span"
          className="!text-inherit"
        >
          {countryCode ? `🌎` : countryCode}
        </Typography>
      );
    },
  }),

  columnHelper.accessor('uptime', {
    header: 'Uptime',
    cell: (props) => (
      <Progress
        size="sm"
        value={parseInt(props.getValue().toString())}
        className="w-[100px]"
        suffixLabel="%"
      />
    ),
  }),

  columnHelper.accessor('reputation', {
    header: 'Reputation',
    cell: (props) => (
      <Progress
        size="sm"
        value={parseInt(props.getValue().toString())}
        className="w-[100px]"
        suffixLabel="%"
      />
    ),
  }),

  columnHelper.accessor('id', {
    header: '',
    id: 'detail',
    cell: (props) => (
      <Button variant="link" size="sm">
        <Link to={`/authorities/drawer/${props.getValue<string>()}`}>
          Details
        </Link>
      </Button>
    ),
  }),
];

const KeyGenAuthoredTable: React.FC<KeyGenAuthoredTableProps> = ({ data }) => {
  const table = useReactTable<KeyGenAuthority>({
    data: data,
    columns,
    pageCount: data.length,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    filterFns: {
      fuzzy: fuzzyFilter,
    },
    manualPagination: false,
  });
  return (
    <Table
      tableProps={table}
      totalRecords={data.length}
      title="DKG Authorities"
    />
  );
};

const uncompressPublicKey = (compressed: string): AddressType => {
  const ECPair = ECPairFactory(tinysecp);
  const dkgPubKey = ECPair.fromPublicKey(
    Buffer.from(compressed.slice(2), 'hex'),
    {
      compressed: false,
    }
  ).publicKey.toString('hex');
  // now we remove the `04` prefix byte and return it.
  return `0x${dkgPubKey.slice(2)}`;
};
