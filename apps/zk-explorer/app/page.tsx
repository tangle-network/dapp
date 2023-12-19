'use client';

import { Typography, Input, Pagination } from '@webb-tools/webb-ui-components';
import { HeaderActions } from '../components/HeaderActions';
import { Search } from '@webb-tools/icons';
import { SidebarFilters } from '../components/SidebarFilters/SidebarFilters';
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
import { CardTabs } from '../components/CardTabs';
import { ProjectItem } from '../components/ProjectCard/types';
import { CircuitItem } from '../components/CircuitCard/types';
import { LinkCard } from '../components/LinkCard';
import { ItemGrid } from '../components/ItemGrid';
import {
  FilterConstraints,
  FilterCategory,
} from '../components/SidebarFilters/types';

export default function Index() {
  const SEARCH_QUERY_DEBOUNCE_DELAY = 1500;
  const ITEMS_PER_PAGE = 12;
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [circuits, setCircuits] = useState<CircuitItem[]>([]);
  const [paginationPage, setPaginationPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemType, setSelectedItemType] = useState(ItemType.Project);

  const [constraints, setConstraints] = useState<FilterConstraints>({
    [FilterCategory.ProofSystem]: [],
    [FilterCategory.Categories]: [],
    [FilterCategory.License]: [],
    [FilterCategory.LanguageOrFramework]: [],
  });

  const [sortByClause, setSortByClause] = useState(
    SearchSortByClause.MostPopular
  );

  const [projectSearchResultCount, setProjectSearchResultCount] =
    useState<number>(0);

  const [circuitSearchResultCount, setCircuitSearchResultCount] =
    useState<number>(0);

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
    if (selectedItemType === ItemType.Project) {
      searchProjects(constraints, searchQuery, paginationPage, sortByClause)
        // Temporarily use mock data until we have a backend.
        .catch(() => getMockProjects())
        .then((response) => {
          setProjects(response.projects);
          setSelectedItemType(ItemType.Project);
          setProjectSearchResultCount(response.resultCount);
        });
    } else {
      searchCircuits(constraints, searchQuery, paginationPage, sortByClause)
        // TODO: Temporarily use mock data until we have a backend.
        .catch(getMockCircuits)
        .then((response) => {
          setCircuits(response.circuits);
          setSelectedItemType(ItemType.Circuit);
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
      searchQuery.length === 0 ||
      searchQuery.length < MIN_SEARCH_QUERY_LENGTH
    ) {
      return;
    }

    fetchItems();

    // This effect should only run when the  search query
    // changes, so other dependencies are intentionally excluded.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fetch items when constraints, page, or sort by clause changes.
  // This doesn't depend on the search query, so it is intentionally
  // excluded from the dependencies.

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fetchItems, [constraints, paginationPage, sortByClause]);

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
          <HeaderActions doHideSearchBar />
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
        <Input
          id="keyword search"
          rightIcon={<Search size="lg" className="mr-4" />}
          className="w-full"
          inputClassName="rounded-[50px]"
          placeholder="Search projects and circuits for specific keywords..."
          value={searchQuery}
          debounceTime={SEARCH_QUERY_DEBOUNCE_DELAY}
          onChange={(value) => setSearchQuery(value)}
        />
      </div>

      {/* Content: Sidebar & grid items */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="pl-6 max-w-[317px] space-y-12">
          <SidebarFilters
            onConstraintsChange={(newConstraints) => {
              console.log(newConstraints);
              setConstraints(newConstraints);
            }}
          />

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
            selectedTab={selectedItemType}
            onTabChange={(cardType) => setSelectedItemType(cardType)}
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
            selectedItemType={selectedItemType}
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
