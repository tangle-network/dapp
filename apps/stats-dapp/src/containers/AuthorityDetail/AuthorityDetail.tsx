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
  useAuthorityAccount,
} from '../../provider/hooks';
import { useStatsContext } from '../../provider/stats-provider';
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
} from '@webb-tools/webb-ui-components/components';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import {
  ArrowLeft,
  CheckboxBlankCircleLine,
  Close,
  Expand,
  KeyIcon,
  Link as LinkIcon,
  Mail,
  QRCode,
  Spinner,
  TwitterFill,
} from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components/typography';
import { shortenString } from '@webb-tools/webb-ui-components/utils';
import cx from 'classnames';
import { FC, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import { CountryIcon } from '../../components/CountryIcon/CountryIcon';
import { headerConfig } from '../KeygenTable';
import { PropsOf } from '@webb-tools/webb-ui-components/types';

const columnHelper = createColumnHelper<KeyGenKeyListItem>();

const columns: ColumnDef<KeyGenKeyListItem, any>[] = [
  columnHelper.accessor('height', {
    header: () => (
      <TitleWithInfo {...headerConfig['common']} {...headerConfig['height']} />
    ),
    enableColumnFilter: false,
  }),

  columnHelper.accessor('session', {
    header: () => (
      <TitleWithInfo {...headerConfig['common']} {...headerConfig['session']} />
    ),
    enableColumnFilter: false,
  }),

  columnHelper.accessor('publicKey', {
    header: () => (
      <TitleWithInfo {...headerConfig['common']} {...headerConfig['key']} />
    ),
    cell: (props) => (
      <KeyValueWithButton
        valueVariant="body1"
        isHiddenLabel
        keyValue={props.getValue<string>()}
        size="sm"
      />
    ),
    enableColumnFilter: false,
  }),

  columnHelper.accessor('authority', {
    header: () => (
      <TitleWithInfo
        {...headerConfig['common']}
        {...headerConfig['authorities']}
      />
    ),
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
          <Button variant="link" as="span" size="sm">
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

  const isStatsLoading = useMemo(
    () => authority.stats.isLoading || stats === null,
    [authority.stats.isLoading, stats]
  );

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const totalItems = useMemo(
    () => authority.keyGens.val?.pageInfo.count ?? 0,
    [authority]
  );
  const pageCount = useMemo(
    () => Math.ceil(totalItems / pageSize),
    [pageSize, totalItems]
  );

  const keyGens = useMemo(
    () => authority.keyGens.val?.items ?? [],
    [authority]
  );
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
    <div className="flex flex-col p-6 space-y-6">
      <DetailsView
        id={authorityId}
        isPage={isPage}
        stats={stats}
        isLoading={isStatsLoading}
      />

      {/** Keygen table */}
      <CardTable
        titleProps={{
          title: 'List of Keygens',
          info: 'List of Keygens',
          variant: 'h5',
        }}
      >
        <Table
          tableProps={table as RTTable<unknown>}
          isPaginated={true}
          title="Keygens"
        />
      </CardTable>
    </div>
  );
};

/***********************
 * Internal components *
 ***********************/

const DetailsView: FC<{
  stats: AuthorityStats | null;
  isLoading?: boolean;
  isPage: boolean;
  id: string;
}> = ({ id, isLoading, isPage, stats }) => {
  const location = stats?.location;
  const account = id;
  const accountDetails = useAuthorityAccount(account);

  const validatorMetaData = useMemo(() => {
    const loading = accountDetails.isLoading;
    const activeColor =
      'text-blue-50 hover:text-blue-10 dark:text-blue-50 dark:hover:text-blue-10';
    const disabledColor = 'dark:text-blue-100 text-blue-10';
    const twitter = accountDetails.val?.twitter;
    const web = accountDetails.val?.web;
    const email = accountDetails.val?.email;
    const id = accountDetails.val?.id ?? '';
    function getProps(value?: string | null): PropsOf<'a'> {
      const disabled = loading || !value;
      return {
        style: {
          pointerEvents: disabled ? 'none' : undefined,
        },
        className: disabled ? disabledColor : activeColor,
      };
    }
    return (
      <>
        <a href={'#'} {...getProps(id)}>
          <KeyIcon className="!fill-current" />
        </a>
        <a
          {...getProps(twitter)}
          href={twitter ? `https://twitter.com/${twitter}` : '#'}
        >
          <TwitterFill className="!fill-current" />
        </a>
        <a {...getProps(web)} href={web ?? '#'}>
          <LinkIcon className="!fill-current" />
        </a>
        <a {...getProps(email)} href={email ? `mailto://${email}` : '#'}>
          <Mail className="!fill-current" />
        </a>
        <a {...getProps(undefined)} href={'#'}>
          <QRCode className="!fill-current" />
        </a>
      </>
    );
  }, [accountDetails]);

  return (
    <div
      className={cx(
        'overflow-hidden rounded-lg bg-mono-0 dark:bg-mono-180',
        'flex flex-col space-y-6',
        {
          'px-4 py-6': isPage,
        }
      )}
    >
      <div
        className={cx('flex items-center justify-between', { hidden: isPage })}
        hidden={isPage}
      >
        <div className="flex items-center">
          <Link to={`/authorities/${id}`} className="inline-block">
            <Expand size="lg" />
          </Link>

          <TitleWithInfo
            title="Authority details"
            variant="h4"
            info={`Authority id ${id} details`}
          />
        </div>

        {!isPage && (
          <DrawerCloseButton>
            <Close size="lg" />
          </DrawerCloseButton>
        )}
      </div>

      {(isLoading || stats === null) && (
        <div className="flex items-center justify-center min-w-full min-h-[320px]">
          <Spinner size="xl" />
        </div>
      )}

      {!isLoading && stats !== null && (
        <>
          {/** Title */}
          <div className="flex">
            <div className="flex items-start grow">
              <Link
                to={'/authorities'}
                className={cx('mr-4 inline-block', { hidden: !isPage })}
                hidden={!isPage}
              >
                <div className="flex flex-row items-center">
                  <ArrowLeft size="lg" />
                  <Typography variant={'body2'} fw={'bold'}>
                    Back to authorities
                  </Typography>
                </div>
              </Link>
              <div className="flex items-center space-x-2">
                <Avatar value={id} size="lg" />
                <div className="flex flex-col space-y-1">
                  <Typography variant="h5" fw="bold">
                    {`${shortenString(id, 4)} `}{' '}
                    <span className={'inline-block'}>
                      {location && (
                        <CountryIcon
                          className={'inline-block'}
                          name={location}
                        />
                      )}
                    </span>
                  </Typography>
                  <KeyValueWithButton
                    hasShortenValue={false}
                    keyValue={account}
                    size="sm"
                    isHiddenLabel
                  />
                </div>
              </div>

              <div
                className={cx(
                  'flex items-center p-1 space-x-2 text-mono-120 dark:text-mono-80 grow justify-end'
                )}
              >
                {validatorMetaData}
              </div>
            </div>
          </div>

          {/** Content */}
          <div className="flex space-x-3">
            <div className="flex flex-col p-3 space-y-3 rounded-md grow shrink basis-0 bg-mono-20 dark:bg-mono-160">
              <Row>
                <Col />
                <Col className="text-center">Keygen Threshold</Col>
                <Col className="text-center">Keygen Authority</Col>
              </Row>
              <Row hasDivider>
                <Col className="justify-start">Current</Col>
                <Col className="text-center">{stats.keyGenThreshold.val}</Col>
                <Col className="text-center">
                  {stats.keyGenThreshold.inTheSet ? (
                    <CheckboxBlankCircleLine
                      size="lg"
                      className="!fill-green-60"
                    />
                  ) : (
                    '-'
                  )}
                </Col>
              </Row>
              <Row hasDivider>
                <Col className="justify-start">Next</Col>
                <Col className="text-center">
                  {stats.nextKeyGenThreshold.val}
                </Col>
                <Col className="text-center">
                  {stats.nextKeyGenThreshold.inTheSet ? (
                    <CheckboxBlankCircleLine
                      size="lg"
                      className="!fill-green-60"
                    />
                  ) : (
                    '-'
                  )}
                </Col>
              </Row>
            </div>

            <div className="flex flex-col space-y-3 grow shrink basis-0">
              <div className="bg-mono-20 dark:bg-mono-160 rounded-md p-3 flex flex-col space-y-1.5 justify-center items-center">
                <Typography variant="body1" fw="bold" className="opacity-60">
                  {stats.numberOfKeys}
                </Typography>
                <Typography
                  variant="body3"
                  fw="bold"
                  className="!text-mono-100"
                >
                  # of keygens
                </Typography>
              </div>

              <Progress
                value={stats.uptime}
                size="lg"
                prefixLabel="UPTIME "
                suffixLabel="%"
              />

              <Progress
                value={stats.reputation}
                size="lg"
                prefixLabel="REPUTATION "
                suffixLabel="%"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Row: FC<{ children: React.ReactNode; hasDivider?: boolean }> = ({
  children,
  hasDivider,
}) => (
  <div className="flex flex-col grow shrink basis-0">
    {hasDivider && <Divider />}
    <div className="flex justify-end px-3 space-x-2 grow">{children}</div>
  </div>
);

const Col: FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <Typography
    variant="body2"
    fw="bold"
    className={twMerge(
      'flex items-center justify-center grow shrink basis-0',
      className
    )}
  >
    {children}
  </Typography>
);
