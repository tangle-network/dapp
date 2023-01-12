import { useMemo } from 'react';
import {
  GridFillIcon,
  KeyIcon,
  ShieldKeyholeIcon,
  TeamFillIcon,
  UserStarFillIcon,
  FoldersFillIcon,
  FileCodeLineIcon,
  GraphIcon,
  BlockIcon,
  RefreshIcon,
  Spinner,
} from '@webb-tools/icons';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Chip,
} from '@webb-tools/webb-ui-components';
import { PublicKey, useActiveKeys, useBlocks } from '../../provider/hooks';
import { NavLink, useLocation } from 'react-router-dom';

export const NavBoxInfoContainer = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const currentPage = useMemo(() => pathnames[0], [pathnames]);
  const subPage = useMemo(() => pathnames[1], [pathnames]);

  const { val: keyData } = useActiveKeys();
  const { val: blocksData } = useBlocks();

  const { currentKey } = useMemo<{
    currentKey: PublicKey | null | undefined;
  }>(() => {
    return {
      currentKey: keyData ? keyData[0] : null, // current key
    };
  }, [keyData]);

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
    <div className="flex items-center justify-between py-2 mb-4 max-w-[1160px] mx-auto">
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
                <ShieldKeyholeIcon />
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
          <RefreshIcon size="lg" className="fill-blue-90 dark:fill-blue-30" />{' '}
          {currentKey ? (
            `Session: ${Number(currentKey?.session).toLocaleString()}`
          ) : (
            <Spinner size="md" />
          )}
        </Chip>
      </div>
    </div>
  );
};
