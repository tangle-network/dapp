import { useMemo } from 'react';
import {
  GridFillIcon,
  KeyIcon,
  ShieldKeyholeLineIcon,
  TeamFillIcon,
  UserStarFillIcon,
  FoldersFillIcon,
  FileCodeLineIcon,
  GraphIcon,
  BlockIcon,
  Spinner,
  RefreshLineIcon,
} from '@webb-tools/icons';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Chip,
} from '@webb-tools/webb-ui-components';
import { useBlocks } from '../../provider/hooks';
import { NavLink, useLocation } from 'react-router-dom';
import { useStatsContext } from '../../provider/stats-provider';

export const NavBoxInfoContainer = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const currentPage = useMemo(() => pathnames[0], [pathnames]);
  const subPage = useMemo(() => pathnames[1], [pathnames]);
  const {
    dkgDataFromPolkadotAPI: { currentSessionNumber },
  } = useStatsContext();

  const { val: blocksData } = useBlocks();

  const { bestBlock, finalizedBlock } = useMemo<{
    bestBlock: number | null | undefined;
    finalizedBlock: number | null | undefined;
  }>(() => {
    return {
      bestBlock: blocksData ? blocksData.best : null,
      finalizedBlock: blocksData ? blocksData.finalized : null,
    };
  }, [blocksData]);

  return (
    <div className="flex items-center justify-between py-2 my-4 max-w-[1160px] mx-auto">
      <Breadcrumbs>
        <NavLink to="/">
          <BreadcrumbsItem icon={<GridFillIcon />}>
            Tangle Explorer
          </BreadcrumbsItem>
        </NavLink>
        <NavLink to={pathnames.length > 1 ? `/${currentPage}` : ''}>
          <BreadcrumbsItem
            icon={
              currentPage === 'keys' ? (
                <KeyIcon />
              ) : currentPage === 'authorities' ? (
                <TeamFillIcon />
              ) : currentPage === 'proposals' ? (
                <FoldersFillIcon />
              ) : null
            }
            isLast={pathnames.length === 1 ? true : false}
          >
            {currentPage === 'keys'
              ? 'Keys Overview'
              : currentPage === 'authorities'
                ? 'Authorities Overview'
                : currentPage === 'proposals'
                  ? 'Proposals Overview'
                  : ''}
          </BreadcrumbsItem>
        </NavLink>
        {pathnames.length > 1 && (
          <BreadcrumbsItem
            icon={
              currentPage === 'keys' ? (
                <ShieldKeyholeLineIcon />
              ) : currentPage === 'authorities' && subPage !== 'history' ? (
                <UserStarFillIcon />
              ) : currentPage === 'authorities' && subPage === 'history' ? (
                <GraphIcon />
              ) : currentPage === 'proposals' ? (
                <FileCodeLineIcon />
              ) : null
            }
            isLast
          >
            {currentPage === 'keys'
              ? 'Keygen details'
              : currentPage === 'authorities' && subPage !== 'history'
                ? 'Authority details'
                : currentPage === 'authorities' && subPage === 'history'
                  ? 'History'
                  : currentPage === 'proposals'
                    ? 'Proposal details'
                    : ''}
          </BreadcrumbsItem>
        )}
      </Breadcrumbs>

      <div className="flex items-center gap-4">
        <Chip color="blue">
          <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />{' '}
          {finalizedBlock ? (
            `Finalized: ${Number(finalizedBlock).toLocaleString()}`
          ) : (
            <Spinner size="md" />
          )}
        </Chip>
        <Chip color="blue">
          <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />{' '}
          {bestBlock ? (
            `Best: ${Number(bestBlock).toLocaleString()}`
          ) : (
            <Spinner size="md" />
          )}
        </Chip>
        <Chip color="blue">
          <RefreshLineIcon
            size="lg"
            className="fill-blue-90 dark:fill-blue-30"
          />{' '}
          {currentSessionNumber ? (
            `Session: ${currentSessionNumber}`
          ) : (
            <Spinner size="md" />
          )}
        </Chip>
      </div>
    </div>
  );
};
