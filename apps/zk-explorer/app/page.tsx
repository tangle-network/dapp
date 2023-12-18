'use client';

import { Typography, Input, Pagination } from '@webb-tools/webb-ui-components';
import { HeaderActions } from '../components/HeaderActions';
import { Search } from '@webb-tools/icons';
import {
  FilterConstraints,
  SidebarFilters,
} from '../components/SidebarFilters';
import { ArrowUpIcon } from '@radix-ui/react-icons';
import {
  ItemType,
  PageUrl,
  getMockCircuits,
  getMockProjects,
} from '../utils/utils';
import { useEffect, useState } from 'react';
import {
  searchProjects,
  SearchSortByClause,
  searchCircuits,
} from '../utils/api';
import useDebounce from '../hooks/useDebounce';
import { ButtonSwitcherGroup } from '../components/ButtonSwitcherGroup';
import { CardTabs } from '../components/CardTabs';
import assert from 'assert';
import { ProjectItem } from '../components/ProjectCard/types';
import { CircuitItem } from '../components/CircuitCard/types';
import { LinkCard } from '../components/LinkCard';
import { ItemGrid } from '../components/ItemGrid';

export default function Index() {
  const SEARCH_QUERY_DEBOUNCE_DELAY = 1500;
  const ITEMS_PER_PAGE = 12;
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [circuits, setCircuits] = useState<CircuitItem[]>([]);
  const [paginationPage, setPaginationPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchingForItem, setSearchingForItem] = useState(ItemType.Project);
  const [constraints, setConstraints] = useState<FilterConstraints>(new Map());
  const [activeItemType, setActiveItemType] = useState(ItemType.Project);

  const [sortByClause, setSortByClause] = useState(
    SearchSortByClause.MostPopular
  );

  const [projectSearchResultCount, setProjectSearchResultCount] =
    useState<number>(0);

  const [circuitSearchResultCount, setCircuitSearchResultCount] =
    useState<number>(0);

  const debouncedSearchQuery = useDebounce(
    searchQuery,
    SEARCH_QUERY_DEBOUNCE_DELAY
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

  const fetchItems = () => {
    if (searchingForItem === ItemType.Project) {
      searchProjects(constraints, searchQuery, paginationPage, sortByClause)
        // Temporarily use mock data until we have a backend.
        .catch(() => getMockProjects())
        .then((response) => {
          setProjects(response.projects);
          setActiveItemType(ItemType.Project);
          setProjectSearchResultCount(response.resultCount);
        });
    } else {
      searchCircuits(constraints, searchQuery, paginationPage, sortByClause)
        // TODO: Temporarily use mock data until we have a backend.
        .catch(getMockCircuits)
        .then((response) => {
          setCircuits(response.circuits);
          setActiveItemType(ItemType.Circuit);
          setCircuitSearchResultCount(response.resultCount);
        });
    }
  };

  // Fetch items when the search query changes.
  useEffect(() => {
    const MIN_SEARCH_QUERY_LENGTH = 3;

    // A small query length can yield too many results. Let's
    // wait until the user has typed a more more specific query.
    if (
      debouncedSearchQuery.length === 0 ||
      debouncedSearchQuery.length < MIN_SEARCH_QUERY_LENGTH
    ) {
      return;
    }

    fetchItems();

    // This effect should only run when the (debounced) search
    // query changes, so other dependencies are intentionally excluded.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  // Fetch items when constraints, page, or sort by clause changes.
  // This doesn't depend on the search query, so it is intentionally
  // excluded from the dependencies.

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fetchItems, [
    constraints,
    paginationPage,
    searchingForItem,
    sortByClause,
  ]);

  return (
    <main className="flex flex-col gap-6">
      {/* Custom, landing-page-only header */}
      {/* TODO: Need to figure out a way to significantly reduce the size of the background image (it's 1mb right now). Should be <=100kb for optimal SEO. One way would be to trim it to what is actually used in terms of max proportions visible to the user, or reduce its resolution. */}
      <header
        className="relative pb-12 bg-cover bg-center rounded-b-xl"
        style={{ backgroundImage: 'url(/header-bg.png)' }}
      >
        {/* Background image mask */}
        <div className="absolute inset-0 opacity-20 bg-black"></div>

        <div className="relative flex items-end my-4 px-4 z-10">
          <HeaderActions />
        </div>

        <div className="relative space-y-4 px-5 z-10">
          <Typography variant="body4" className="uppercase dark:text-mono-0">
            Privacy for everyone, everything, everywhere
          </Typography>

          <Typography variant="h2" fw="bold">
            Zero-Knowledge Explorer
          </Typography>

          <Typography variant="h5" fw="normal">
            Dive into the future of privacy with advanced cryptography &
            zero-knowledge proofs.
          </Typography>
        </div>
      </header>

      <div className="shadow-xl py-4 px-6 dark:bg-mono-170 rounded-xl flex flex-col sm:flex-row gap-2">
        <ButtonSwitcherGroup
          buttonLabels={[ItemType.Project, ItemType.Circuit]}
          onSelectionChange={(selectedButtonIndex) => {
            assert(
              selectedButtonIndex >= 0 && selectedButtonIndex <= 1,
              'Selected button index should be within bounds, which is two buttons.'
            );

            // The first index corresponds to the projects tab,
            // while the second index corresponds to the circuits tab.
            setSearchingForItem(
              selectedButtonIndex === 0 ? ItemType.Project : ItemType.Circuit
            );
          }}
        />

        <Input
          id="keyword search"
          rightIcon={<Search size="lg" />}
          className="w-full"
          placeholder="Search projects for specific keywords..."
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
        />
      </div>

      {/* Content: Sidebar & grid items */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="pl-6 max-w-[317px] space-y-12">
          <SidebarFilters onConstraintsChange={setConstraints} />

          <LinkCard href={PageUrl.SubmitProject}>
            <div className="p-2 bg-mono-120 rounded-full mb-6">
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
          <CardTabs
            sortByClause={sortByClause}
            onTabChange={(cardType) => setActiveItemType(cardType)}
            onSortByClauseChange={(sortByClause) =>
              setSortByClause(sortByClause)
            }
            counts={{
              [ItemType.Project]: projectSearchResultCount,
              [ItemType.Circuit]: circuitSearchResultCount,
            }}
          />

          <ItemGrid
            projects={projects}
            circuits={circuits}
            activeItemType={activeItemType}
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
    </main>
  );
}
