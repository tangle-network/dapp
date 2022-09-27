import { randBoolean, randCountryCode, randEthereumAddress, randNumber, randRecentDate } from '@ngneat/falso';
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import { AuthorityStats, KeyGenAuthority, KeyGenKeyListItem } from '@webb-dapp/page-statistics/provider/hooks';
import {
  Avatar,
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
import { useSeedData } from '@webb-dapp/webb-ui-components/hooks';
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
import { randAccount32, shortenString } from '@webb-dapp/webb-ui-components/utils';
import cx from 'classnames';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { FC, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import { headerConfig } from '../KeygenTable';

const getNewKeygenAuthority = (): KeyGenAuthority => ({
  account: randAccount32(),
  id: randEthereumAddress() + randEthereumAddress().substring(2),
  location: randCountryCode(),
  reputation: randNumber({ min: 95, max: 100 }),
  uptime: randNumber({ min: 95, max: 100 }),
});

const getNewAuthorityStats = (): Pick<
  AuthorityStats,
  'numberOfKeys' | 'keyGenThreshold' | 'nextKeyGenThreshold' | 'pendingKeyGenThreshold'
> => ({
  numberOfKeys: randNumber({ max: 10 }).toString(),
  keyGenThreshold: {
    val: randNumber({ min: 10, max: 20 }).toString(),
    inTheSet: randBoolean(),
  },
  nextKeyGenThreshold: {
    val: randNumber({ min: 10, max: 20 }).toString(),
    inTheSet: randBoolean(),
  },
  pendingKeyGenThreshold: {
    val: randNumber({ min: 10, max: 20 }).toString(),
    inTheSet: randBoolean(),
  },
});

const getNewKeygenKey = (): KeyGenKeyListItem => ({
  authority: randAccount32(),
  height: (randRecentDate().getTime() / 1000).toString(),
  id: randEthereumAddress() + randEthereumAddress().substring(2),
  publicKey: randEthereumAddress(),
  session: randNumber({ min: 10, max: 50 }).toString(),
});

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
    cell: (props) => <KeyValueWithButton isHiddenLabel keyValue={props.getValue<string>()} size='sm' />,
    enableColumnFilter: false,
  }),

  columnHelper.accessor('authority', {
    header: () => <TitleWithInfo {...headerConfig['common']} {...headerConfig['authorities']} />,
    cell: (props) => <Avatar value={props.getValue<string>()} />,
    enableColumnFilter: false,
  }),

  columnHelper.accessor('id', {
    header: '',
    cell: (props) => (
      <Link to={`#`}>
        <Button className='uppercase' varirant='link' as='span' size='sm'>
          Details
        </Button>
      </Link>
    ),
    enableColumnFilter: false,
  }),
];

export const AuthorityDetail = () => {
  const { pathname } = useLocation();

  const isPage = useMemo(() => !pathname.includes('drawer'), [pathname]);

  const authority = useMemo(() => getNewKeygenAuthority(), []);

  const { fetchData } = useSeedData(getNewKeygenKey);

  const [dataQuery, setDataQuery] = useState<Awaited<ReturnType<typeof fetchData>> | undefined>();

  // Pagination state
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const totalItems = useMemo(() => dataQuery?.totalItems ?? 0, [dataQuery]);

  const pageCount = useMemo(() => Math.floor(totalItems / pageSize), [pageSize, totalItems]);

  const { keyGenThreshold, nextKeyGenThreshold, numberOfKeys, pendingKeyGenThreshold } = useMemo(
    () => getNewAuthorityStats(),
    []
  );

  const table = useReactTable<KeyGenKeyListItem>({
    data: dataQuery?.rows ?? ([] as KeyGenKeyListItem[]),
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

  useEffect(() => {
    const updateData = async () => {
      const fetchedData = await fetchData(pagination);

      setDataQuery(fetchedData);
    };

    updateData();
  }, [fetchData, pagination]);

  return (
    <div className='flex flex-col p-6 space-y-6'>
      <div className={cx('overflow-hidden rounded-lg bg-mono-0 dark:bg-mono-180', { 'p-4': isPage })}>
        {/** Title */}
        <div className='flex'>
          <div className='flex items-center space-x-3 grow'>
            <Link to={isPage ? '/authorities' : `/authorities/${authority.id}`}>
              {isPage ? <ArrowLeft size='lg' /> : <Expand size='lg' />}
            </Link>

            <Avatar value={authority.account} size='lg' />

            <Typography variant='h5' fw='bold'>
              {`${shortenString(authority.account, 4)} ${getUnicodeFlagIcon(authority.location)}`}
            </Typography>

            <KeyValueWithButton keyValue={authority.account} size='sm' isHiddenLabel />

            <div
              className={cx('flex items-center p-1 space-x-2 text-mono-120 dark:text-mono-80 grow', {
                'justify-start': !isPage,
                'justify-end': isPage,
              })}
            >
              <Key className='!fill-current' />
              <TwitterFill className='!fill-current' />
              <LinkIcon className='!fill-current' />
              <Mail className='!fill-current' />
              <QRCode className='!fill-current' />
            </div>
          </div>

          {!isPage && (
            <DrawerCloseButton>
              <Close size='lg' />
            </DrawerCloseButton>
          )}
        </div>

        {/** Content */}
        <div className='flex space-x-3'>
          <div className='flex flex-col p-3 space-y-3 rounded-md grow shrink basis-0 bg-mono-20 dark:bg-mono-160'>
            <Row>
              <Col />
              <Col className='text-center'>Keygen Threshold</Col>
              <Col className='text-center'>Keygen Authority</Col>
            </Row>
            <Divider />
            <Row>
              <Col className='justify-start'>Current</Col>
              <Col className='text-center'>{keyGenThreshold.val}</Col>
              <Col className='text-center'>
                {keyGenThreshold.inTheSet ? <CheckboxBlankCircleLine size='lg' className='!fill-green-60' /> : '-'}
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col className='justify-start'>Next</Col>
              <Col className='text-center'>{nextKeyGenThreshold.val}</Col>
              <Col className='text-center'>
                {nextKeyGenThreshold.inTheSet ? <CheckboxBlankCircleLine size='lg' className='!fill-green-60' /> : '-'}
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col className='justify-start'>Pending</Col>
              <Col className='text-center'>{pendingKeyGenThreshold.val}</Col>
              <Col className='text-center'>
                {pendingKeyGenThreshold.inTheSet ? (
                  <CheckboxBlankCircleLine size='lg' className='!fill-green-60' />
                ) : (
                  '-'
                )}
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

            <Progress value={authority.uptime} size='lg' prefixLabel='UPTIME ' suffixLabel='%' />

            <Progress value={authority.reputation} size='lg' prefixLabel='REPUTATION ' suffixLabel='%' />
          </div>
        </div>
      </div>

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

const Row: FC = ({ children }) => <div className='flex justify-end px-3 space-x-2'>{children}</div>;

const Col: FC<{ className?: string }> = ({ children, className }) => (
  <Typography
    variant='body2'
    fw='bold'
    className={twMerge('flex items-center justify-center grow shrink basis-0', className)}
  >
    {children}
  </Typography>
);
