import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import {
  AuthorityQuery,
  AuthorityStats,
  DiscreteList,
  KeyGenKeyListItem,
  useAuthority,
} from '@webb-dapp/page-statistics/provider/hooks';
import { useStatsContext } from '@webb-dapp/page-statistics/provider/stats-provider';
import {
  Avatar,
  AvatarGroup,
  Button,
  CardTable,
  Divider,
  DrawerCloseButton,
  KeyValueWithButton,
  Progress,
  Table,
  TitleWithInfo,
} from '@webb-dapp/webb-ui-components/components';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import {
  ArrowLeft,
  CheckboxBlankCircleLine,
  Close,
  Expand,
  Key,
  Link as LinkIcon,
  Mail,
  QRCode,
  TwitterFill,
} from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { shortenString } from '@webb-dapp/webb-ui-components/utils';
import cx from 'classnames';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { FC, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import { headerConfig } from '../KeygenTable';

const columnHelper = createColumnHelper<KeyGenKeyListItem>();

const columns: ColumnDef<KeyGenKeyListItem, any>[] = [
  columnHelper.accessor('height', {
    header: () => <TitleWithInfo {...headerConfig['common']} {...headerConfig['height']} />,
    enableColumnFilter: false,
  }),

  columnHelper.accessor('session', {
    header: () => <TitleWithInfo {...headerConfig['common']} {...headerConfig['session']} />,
    enableColumnFilter: false,
  }),

  columnHelper.accessor('publicKey', {
    header: () => <TitleWithInfo {...headerConfig['common']} {...headerConfig['key']} />,
    cell: (props) => (
      <KeyValueWithButton valueVariant='body1' isHiddenLabel keyValue={props.getValue<string>()} size='sm' />
    ),
    enableColumnFilter: false,
  }),

  columnHelper.accessor('authority', {
    header: () => <TitleWithInfo {...headerConfig['common']} {...headerConfig['authorities']} />,
    cell: (props) => {
      const authorities = props.getValue<DiscreteList>();
      return (
        <AvatarGroup total={authorities.count}>
          {authorities.firstElements.map((au, idx) => (
            <Avatar sourceVariant={'address'} key={`${au}${idx}`} value={au} />
          ))}
        </AvatarGroup>
      );
    },
    enableColumnFilter: false,
  }),

  columnHelper.accessor('id', {
    header: '',
    cell: (props) => {
      const id = props.row.original.publicKey;
      return (
        <Link to={`/keys/drawer/${id}`}>
          <Button varirant='link' as='span' size='sm'>
            Details
          </Button>
        </Link>
      );
    },
    enableColumnFilter: false,
  }),
];

export const AuthorityDetail = () => {
  const { pathname } = useLocation();
  const { authorityId = '' } = useParams<{ authorityId: string }>();
  const {
    metaData: { activeSession },
  } = useStatsContext();

  const isPage = useMemo(() => !pathname.includes('drawer'), [pathname]);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const authorityQuery: AuthorityQuery = useMemo(() => {
    return {
      offset: pageIndex * pageSize,
      perPage: pageSize,
      filter: {
        authorityId,
      },
    };
  }, [authorityId, pageSize, pageIndex]);
  const authority = useAuthority(authorityQuery);

  const stats = useMemo(() => authority.stats.val, [authority]);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const totalItems = useMemo(() => authority.keyGens.val?.pageInfo.count ?? 0, [authority]);
  const pageCount = useMemo(() => Math.ceil(totalItems / pageSize), [pageSize, totalItems]);

  const keyGens = useMemo(() => authority.keyGens.val?.items ?? [], [authority]);
  const table = useReactTable<KeyGenKeyListItem>({
    data: keyGens,
    columns,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  return (
    <div className='flex flex-col p-6 space-y-6'>
      {stats ? <DetailsView id={authorityId} isPage={isPage} stats={stats} /> : <div>loading..</div>}
      {/** Keygen table */}
      <CardTable
        titleProps={{
          title: 'List of Keygens',
          info: 'List of Keygens',
          variant: 'h5',
        }}
      >
        <Table tableProps={table as RTTable<unknown>} isPaginated />
      </CardTable>
    </div>
  );
};

/***********************
 * Internal components *
 ***********************/

const DetailsView: FC<{ stats: AuthorityStats; isPage: boolean; id: string }> = ({ id, isPage, stats }) => {
  const { keyGenThreshold, nextKeyGenThreshold, numberOfKeys, reputation, uptime } = stats;
  const location = 'EG';
  const account = id;
  return (
    <div
      className={cx('overflow-hidden rounded-lg bg-mono-0 dark:bg-mono-180', 'flex flex-col space-y-6', {
        'px-4 py-6': isPage,
      })}
    >
      <div className={cx('flex items-center justify-between', { hidden: isPage })} hidden={isPage}>
        <Link to={`/authorities/${id}`} className='inline-block'>
          <Expand size='lg' />
        </Link>

        {!isPage && (
          <DrawerCloseButton>
            <Close size='lg' />
          </DrawerCloseButton>
        )}
      </div>

      {/** Title */}
      <div className='flex'>
        <div className='flex items-start grow'>
          <Link to={'/authorities'} className={cx('mr-4 inline-block', { hidden: !isPage })} hidden={!isPage}>
            <ArrowLeft size='lg' />
          </Link>
          <div className='flex items-center space-x-2'>
            <Avatar value={id} size='lg' />
            <div className='flex flex-col space-y-1'>
              <Typography variant='h5' fw='bold'>
                {`${shortenString(id, 4)} ${getUnicodeFlagIcon(location)}`}
              </Typography>
              <KeyValueWithButton hasShortenValue={false} keyValue={account} size='sm' isHiddenLabel />
            </div>
          </div>

          <div className={cx('flex items-center p-1 space-x-2 text-mono-120 dark:text-mono-80 grow justify-end')}>
            <Key className='!fill-current' />
            <TwitterFill className='!fill-current' />
            <LinkIcon className='!fill-current' />
            <Mail className='!fill-current' />
            <QRCode className='!fill-current' />
          </div>
        </div>
      </div>

      {/** Content */}
      <div className='flex space-x-3'>
        <div className='flex flex-col p-3 space-y-3 rounded-md grow shrink basis-0 bg-mono-20 dark:bg-mono-160'>
          <Row>
            <Col />
            <Col className='text-center'>Keygen Threshold</Col>
            <Col className='text-center'>Keygen Authority</Col>
          </Row>
          <Row hasDivider>
            <Col className='justify-start'>Current</Col>
            <Col className='text-center'>{keyGenThreshold.val}</Col>
            <Col className='text-center'>
              {keyGenThreshold.inTheSet ? <CheckboxBlankCircleLine size='lg' className='!fill-green-60' /> : '-'}
            </Col>
          </Row>
          <Row hasDivider>
            <Col className='justify-start'>Next</Col>
            <Col className='text-center'>{nextKeyGenThreshold.val}</Col>
            <Col className='text-center'>
              {nextKeyGenThreshold.inTheSet ? <CheckboxBlankCircleLine size='lg' className='!fill-green-60' /> : '-'}
            </Col>
          </Row>
        </div>

        <div className='flex flex-col space-y-3 grow shrink basis-0'>
          <div className='bg-mono-20 dark:bg-mono-160 rounded-md p-3 flex flex-col space-y-1.5 justify-center items-center'>
            <Typography variant='body1' fw='bold' className='opacity-60'>
              {numberOfKeys}
            </Typography>
            <Typography variant='body3' fw='bold' className='!text-mono-100'>
              # of keygens
            </Typography>
          </div>

          <Progress value={uptime} size='lg' prefixLabel='UPTIME ' suffixLabel='%' />

          <Progress value={reputation} size='lg' prefixLabel='REPUTATION ' suffixLabel='%' />
        </div>
      </div>
    </div>
  );
};

const Row: FC<{ hasDivider?: boolean }> = ({ children, hasDivider }) => (
  <div className='flex flex-col grow shrink basis-0'>
    {hasDivider && <Divider />}
    <div className='flex justify-end px-3 space-x-2 grow'>{children}</div>
  </div>
);

const Col: FC<{ className?: string }> = ({ children, className }) => (
  <Typography
    variant='body2'
    fw='bold'
    className={twMerge('flex items-center justify-center grow shrink basis-0', className)}
  >
    {children}
  </Typography>
);
