'use client';

import { Pagination } from '@webb-tools/webb-ui-components';
import { useSearchParams } from 'next/navigation';
import { FC, useCallback, useEffect, useState } from 'react';
import { useFilterConstraints } from '../hooks/useFilterConstraints';
import {
  SearchSortByClause,
  searchCircuits,
  searchProjects,
} from '../utils/api';
import {
  ItemType,
  SearchParamKey,
  getMockCircuits,
  getMockProjects,
  validateSearchQuery,
} from '../utils/utils';
import { CardTabs } from './CardTabs';
import { CircuitItem } from './CircuitCard/types';
import { ItemGrid } from './ItemGrid';
import { ProjectItem } from './ProjectCard/types';

export const HomepageItemGridContainer: FC<Record<string, never>> = () => {
  const MAX_ITEMS_PER_PAGE = 12;
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [circuits, setCircuits] = useState<CircuitItem[]>([]);
  const [constraints] = useFilterConstraints();
  const [projectSearchResultCount, setProjectSearchResultCount] =
    useState<number>(0);
  const [circuitSearchResultCount, setCircuitSearchResultCount] =
    useState<number>(0);
  const [selectedItemType, setSelectedItemType] = useState(ItemType.Project);

  const initialSearchQuery =
    useSearchParams().get(SearchParamKey.SearchQuery) ?? '';

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  const [sortByClause, setSortByClause] = useState(
    SearchSortByClause.MostPopular
  );

  const DEFAULT_PAGE_NUMBER = 1;

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
      if (selectedItemType === ItemType.Project) {
        searchProjects(constraints, query, paginationPage, sortByClause)
          // Temporarily use mock data until we have a backend.
          .catch(() => getMockProjects())
          .then((response) => {
            setProjects(response.projects);
            setProjectSearchResultCount(response.resultCount);
          });
      } else {
        searchCircuits(constraints, query, paginationPage, sortByClause)
          // TODO: Temporarily use mock data until we have a backend.
          .catch(getMockCircuits)
          .then((response) => {
            setCircuits(response.circuits);
            setCircuitSearchResultCount(response.resultCount);
          });
      }
    },
    [constraints, paginationPage, selectedItemType, sortByClause]
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
    <div className="w-full">
      <CardTabs
        sortByClause={sortByClause}
        selectedTab={selectedItemType}
        onTabChange={(cardType) => setSelectedItemType(cardType)}
        onSortByClauseChange={(sortByClause) => setSortByClause(sortByClause)}
        counts={{
          [ItemType.Project]: projectSearchResultCount,
          [ItemType.Circuit]: circuitSearchResultCount,
        }}
      />

      <ItemGrid
        projects={projects}
        circuits={circuits}
        selectedItemType={selectedItemType}
      />

      <Pagination
        itemsPerPage={MAX_ITEMS_PER_PAGE}
        totalItems={projectSearchResultCount}
        page={paginationPage}
        setPageIndex={setPaginationPage}
        title="Projects"
      />
    </div>
  );
};
