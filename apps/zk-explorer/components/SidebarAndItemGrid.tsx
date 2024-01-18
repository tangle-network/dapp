'use client';

import { ArrowUpIcon } from '@radix-ui/react-icons';
import { Button, Pagination, Typography } from '@webb-tools/webb-ui-components';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FC, useCallback, useEffect, useState } from 'react';
import { ITEMS_PER_PAGE } from '../constants';
import Filters from '../containers/Filters';
import useFilterConstraints from '../hooks/useFilterConstraints';
import useTailwindBreakpoint, {
  TailwindBreakpoint,
} from '../hooks/useTailwindBreakpoint';
import { SearchSortByClause, searchCircuits } from '../server/circuits';
import { searchProjects } from '../server/projects';
import {
  ItemType,
  RelativePageUrl,
  SearchParamKey,
  getMockCircuits,
  getMockProjects,
  validateSearchQuery,
} from '../utils';
import { CircuitItem } from './CircuitCard';
import FilterAndSortBy from './FilterAndSortBy';
import ItemGrid from './ItemGrid';
import LinkCard from './LinkCard';
import { ProjectItem } from './ProjectCard';
import SearchInput from './SearchInput';
import Tabs from './Tabs';

const SidebarAndItemGrid: FC<Record<string, never>> = () => {
  const breakpoint = useTailwindBreakpoint();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [circuits, setCircuits] = useState<CircuitItem[]>([]);
  const [constraints, setConstraints] = useFilterConstraints();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const [projectSearchResultCount, setProjectSearchResultCount] =
    useState<number>(0);

  const [circuitSearchResultCount, setCircuitSearchResultCount] =
    useState<number>(0);

  const initialSearchQuery =
    useSearchParams().get(SearchParamKey.SearchQuery) ?? '';

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  const [sortByClause, setSortByClause] = useState(
    SearchSortByClause.MostPopular
  );

  const DEFAULT_PAGE_NUMBER = 1;
  const PROJECTS_TAB_INDEX = 0;

  const initialPaginationPage = useSearchParams().get(
    SearchParamKey.PaginationPageNumber
  );

  const [paginationPage, setPaginationPage] = useState(
    initialPaginationPage !== null
      ? parseInt(initialPaginationPage, 10)
      : DEFAULT_PAGE_NUMBER
  );

  // Initial 'most popular' project search.
  useEffect(() => {
    searchProjects(
      constraints,
      '',
      paginationPage,
      SearchSortByClause.MostPopular
    )
      // TODO: Temporarily use mock data until we have a backend.
      .catch(getMockProjects)
      .then((response) => {
        setProjects(response.projects);
        setProjectSearchResultCount(response.resultCount);
      });

    // This effect should only run once on page load,
    // so dependencies are intentionally left empty.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchItems = useCallback(
    (query: string) => {
      if (selectedTabIndex === PROJECTS_TAB_INDEX) {
        searchProjects(constraints, query, paginationPage, sortByClause)
          // Temporarily use mock data until we have a backend.
          .catch(() => getMockProjects())
          .then((response) => {
            setProjects(response.projects);
            setProjectSearchResultCount(response.resultCount);
          });
      }
      // If it's not the projects tab, it's the circuits tab.
      else {
        searchCircuits(constraints, query, paginationPage, sortByClause)
          // TODO: Temporarily use mock data until we have a backend.
          .catch(getMockCircuits)
          .then((response) => {
            setCircuits(response.circuits);
            setCircuitSearchResultCount(response.resultCount);
          });
      }
    },
    [constraints, paginationPage, selectedTabIndex, sortByClause]
  );

  // Fetch items when the search query changes.
  useEffect(() => {
    if (validateSearchQuery(searchQuery)) {
      fetchItems(searchQuery);
    }
  }, [searchQuery, fetchItems]);

  // Fetch items when constraints, page number, or sort
  // by clause changes.
  useEffect(() => {
    fetchItems(searchQuery ?? '');

    // This doesn't depend on the search query, so it is intentionally
    // excluded from the dependencies.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constraints, paginationPage, sortByClause]);

  return (
    <>
      <div className="shadow-xl py-4 px-6 dark:bg-mono-170 rounded-xl flex flex-col sm:flex-row gap-2">
        <SearchInput
          onValueChange={setSearchQuery}
          isHomepageVariant
          id="homepage search"
        />

        <Link
          href={RelativePageUrl.SubmitProject}
          className="flex-grow sm:flex-grow-0"
        >
          <Button isFullWidth={breakpoint <= TailwindBreakpoint.SM}>
            Upload Project
          </Button>
        </Link>
      </div>

      {/* Content: Filters & grid items */}
      <div className="flex flex-col sm:flex-row gap-0 sm:gap-6">
        <div className="pl-6 max-w-[317px] space-y-12">
          <Filters
            onConstraintsChange={(newConstraints) =>
              setConstraints(newConstraints)
            }
            className="hidden sm:flex"
          />

          <LinkCard
            className="hidden sm:block"
            href={RelativePageUrl.SubmitProject}
          >
            <div className="p-2 bg-mono-60 dark:bg-mono-120 rounded-full mb-6">
              <ArrowUpIcon className="w-6 h-6 fill-mono-0" />
            </div>

            <Typography
              variant="body1"
              fw="bold"
              className="mb-1 dark:text-mono-0"
            >
              Submit Project!
            </Typography>

            <Typography
              variant="body1"
              fw="normal"
              className="dark:text-mono-100"
            >
              Have a zero-knowledge project you&apos;d like to share with the
              community?
            </Typography>
          </LinkCard>
        </div>

        <div className="w-full">
          <Tabs
            initiallySelectedTabIndex={PROJECTS_TAB_INDEX}
            onTabChange={(_tab, index) => setSelectedTabIndex(index)}
            rightContent={
              <FilterAndSortBy
                sortByClause={sortByClause}
                onConstraintsChange={setConstraints}
                onSortByClauseChange={setSortByClause}
              />
            }
            tabs={[
              {
                name: 'Projects',
                count: projectSearchResultCount,
              },
              {
                name: 'Circuits',
                count: circuitSearchResultCount,
              },
            ]}
          />

          <ItemGrid
            projects={projects}
            circuits={circuits}
            selectedItemType={
              selectedTabIndex === PROJECTS_TAB_INDEX
                ? ItemType.Project
                : ItemType.Circuit
            }
          />

          <Pagination
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={projectSearchResultCount}
            page={paginationPage}
            setPageIndex={setPaginationPage}
            title="Projects"
          />
        </div>
      </div>
    </>
  );
};

export default SidebarAndItemGrid;
