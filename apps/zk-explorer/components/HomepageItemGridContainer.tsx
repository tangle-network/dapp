'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import {
  SearchSortByClause,
  searchCircuits,
  searchProjects,
} from '../utils/api';
import { useFilterConstraints } from '../hooks/useFilterConstraints';
import { UrlParamKey, useUrlParam } from '../hooks/useUrlParam';
import { tryOrElse } from '../utils';
import { ItemType, getMockCircuits, getMockProjects } from '../utils/utils';
import { ProjectItem } from './ProjectCard/types';
import { CircuitItem } from './CircuitCard/types';
import { CardTabs } from './CardTabs';
import { ItemGrid } from './ItemGrid';
import { Pagination } from '@webb-tools/webb-ui-components';

export const HomepageItemGridContainer: FC<Record<string, never>> = () => {
  const MAX_ITEMS_PER_PAGE = 12;
  const [searchQuery] = useUrlParam(UrlParamKey.SearchQuery);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [circuits, setCircuits] = useState<CircuitItem[]>([]);
  const [constraints] = useFilterConstraints();
  const [projectSearchResultCount, setProjectSearchResultCount] =
    useState<number>(0);
  const [circuitSearchResultCount, setCircuitSearchResultCount] =
    useState<number>(0);
  const [selectedItemType, setSelectedItemType] = useState(ItemType.Project);

  const [sortByClause, setSortByClause] = useState(
    SearchSortByClause.MostPopular
  );

  const DEFAULT_PAGE_NUMBER = 1;

  const [paginationPage, setPaginationPage] = useUrlParam(
    UrlParamKey.PaginationPageNumber
  );

  const getOrRepairPaginationPageNumber = useCallback((): number => {
    return tryOrElse(
      () => parseInt(paginationPage ?? DEFAULT_PAGE_NUMBER.toString(), 10),
      // Repair invalid page number if it could not be parsed as an integer.
      () => {
        setPaginationPage(DEFAULT_PAGE_NUMBER.toString());

        return DEFAULT_PAGE_NUMBER;
      }
    );
  }, [paginationPage, setPaginationPage]);

  // Initial 'most popular' project search.
  useEffect(() => {
    const paginationPageNumber = getOrRepairPaginationPageNumber();

    searchProjects(
      constraints,
      '',
      paginationPageNumber,
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
      const paginationPageNumber = getOrRepairPaginationPageNumber();

      if (selectedItemType === ItemType.Project) {
        searchProjects(constraints, query, paginationPageNumber, sortByClause)
          // Temporarily use mock data until we have a backend.
          .catch(() => getMockProjects())
          .then((response) => {
            setProjects(response.projects);
            setSelectedItemType(ItemType.Project);
            setProjectSearchResultCount(response.resultCount);
          });
      } else {
        searchCircuits(constraints, query, paginationPageNumber, sortByClause)
          // TODO: Temporarily use mock data until we have a backend.
          .catch(getMockCircuits)
          .then((response) => {
            setCircuits(response.circuits);
            setSelectedItemType(ItemType.Circuit);
            setCircuitSearchResultCount(response.resultCount);
          });
      }
    },
    [
      constraints,
      getOrRepairPaginationPageNumber,
      selectedItemType,
      sortByClause,
    ]
  );

  const checkSearchQuery = (
    searchQuery: string | null
  ): searchQuery is string => {
    const MIN_SEARCH_QUERY_LENGTH = 3;

    // A small query length can yield too many results. Let's
    // wait until the user has typed a more more specific query.
    return (
      searchQuery !== null &&
      searchQuery.length > 0 &&
      searchQuery.length >= MIN_SEARCH_QUERY_LENGTH
    );
  };

  // Fetch items when the search query changes.
  useEffect(() => {
    if (checkSearchQuery(searchQuery)) {
      fetchItems(searchQuery);
    }
  }, [searchQuery, fetchItems]);

  // Fetch items when constraints, page, or sort by clause changes.
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
        page={getOrRepairPaginationPageNumber()}
        setPageIndex={(newPageIndex) =>
          setPaginationPage(newPageIndex.toString())
        }
        title="Projects"
      />
    </div>
  );
};
