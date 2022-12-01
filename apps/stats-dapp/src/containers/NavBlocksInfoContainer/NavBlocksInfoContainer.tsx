import { useMemo } from 'react';
import {
  GridFill,
  Key,
  ShieldKeyhole,
  TeamFill,
  UserStarFill,
  FoldersFill,
  FileCodeLine,
  Graph,
} from '@webb-tools/icons';
import { Breadcrumbs, BreadcrumbsItem } from '@webb-tools/webb-ui-components';
import { useLocation } from 'react-router-dom';

export const NavBoxInfoContainer = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const currentPage = useMemo(() => pathnames[0], [pathnames]);
  const subPage = useMemo(() => pathnames[1], [pathnames]);

  return (
    <div className="flex items-center justify-between py-2 mb-4 max-w-[1160px] mx-auto">
      {/* Breadcrumbs */}
      <div>
        {pathnames.length > 1 ? (
          <Breadcrumbs>
            <BreadcrumbsItem icon={<GridFill />} path="/">
              Tangle Explorer
            </BreadcrumbsItem>
            <BreadcrumbsItem
              icon={
                currentPage === 'keys' ? (
                  <Key />
                ) : currentPage === 'authorities' ? (
                  <TeamFill />
                ) : currentPage === 'proposals' ? (
                  <FoldersFill />
                ) : null
              }
              path={`/${currentPage}`}
            >
              {currentPage === 'keys'
                ? 'Keys Overview'
                : currentPage === 'authorities'
                ? 'Authorities Overview'
                : currentPage === 'proposals'
                ? 'Proposals Overview'
                : ''}
            </BreadcrumbsItem>
            <BreadcrumbsItem
              icon={
                currentPage === 'keys' ? (
                  <ShieldKeyhole />
                ) : currentPage === 'authorities' && subPage !== 'history' ? (
                  <UserStarFill />
                ) : currentPage === 'authorities' && subPage === 'history' ? (
                  <Graph />
                ) : currentPage === 'proposals' ? (
                  <FileCodeLine />
                ) : null
              }
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
          </Breadcrumbs>
        ) : (
          <Breadcrumbs>
            <BreadcrumbsItem icon={<GridFill />} path="/">
              Tangle Explorer
            </BreadcrumbsItem>
            <BreadcrumbsItem
              icon={
                currentPage === 'keys' ? (
                  <Key />
                ) : currentPage === 'authorities' ? (
                  <TeamFill />
                ) : currentPage === 'proposals' ? (
                  <FoldersFill />
                ) : null
              }
            >
              {currentPage === 'keys'
                ? 'Keys Overview'
                : currentPage === 'authorities'
                ? 'Authorities Overview'
                : currentPage === 'proposals'
                ? 'Proposals Overview'
                : ''}
            </BreadcrumbsItem>
          </Breadcrumbs>
        )}
      </div>

      {/* Blocks Info */}
      {/* <div>Finalized | Best | Session</div> */}
    </div>
  );
};
