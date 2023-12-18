'use client';

import {
  Typography,
  Input,
  Card,
  Pagination,
} from '@webb-tools/webb-ui-components';
import { HeaderActions } from '../components/HeaderActions';
import { Search } from '@webb-tools/icons';
import {
  FilterConstraints,
  SidebarFilters,
} from '../components/SidebarFilters';
import { ProjectCard } from '../components/ProjectCard/ProjectCard';
import { Link } from '@webb-tools/webb-ui-components/components/Link';
import { ArrowUpIcon } from '@radix-ui/react-icons';
import { ItemType, PageUrl, getMockProjectsAndCircuits } from '../utils/utils';
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
import { CircuitCard } from '../components/CircuitCard/CircuitCard';
import { ProjectItem } from '../components/ProjectCard/types';
import { CircuitItem } from '../components/CircuitCard/types';

export default function Index() {
  const SEARCH_QUERY_DEBOUNCE_DELAY = 2000;
  const ITEMS_PER_PAGE = 12;
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [circuits, setCircuits] = useState<CircuitItem[]>([]);
  const [paginationPage, setPaginationPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchingForItem, setSearchingForItem] = useState(ItemType.Project);
  const [constraints, setConstraints] = useState<FilterConstraints>(new Map());

  const [projectSearchResultCount, setCircuitSearchResultCount] =
    useState<number>(0);

  const [circuitSearchResultCount, setProjectSearchResultCount] =
    useState<number>(0);

  const [activeItemType, setActiveItemType] = useState<ItemType>(
    ItemType.Project
  );

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
      // Temporarily use mock data until we have a backend.
      .catch(() => {
        const mockProjectsAndCircuits = getMockProjectsAndCircuits();

        setProjects(mockProjectsAndCircuits.mockProjects);
        setCircuits(mockProjectsAndCircuits.mockCircuits);
      })
      .then((response) => {
        setProjects(response.projects);
        setCircuitSearchResultCount(response.resultCount);
      });

    // This effect should only run once on page load,
    // so dependencies are intentionally left empty.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    console.log('Re-fetching projects...');

    (async () => {
      // TODO: Need to also update the button switcher group to reflect the new card type.

      if (searchingForItem === ItemType.Project) {
        const response = await searchProjects(
          constraints,
          debouncedSearchQuery,
          paginationPage
        );

        setProjects(response.projects);
        setActiveItemType(ItemType.Project);
        setCircuitSearchResultCount(response.resultCount);
      } else {
        const response = await searchCircuits(
          constraints,
          debouncedSearchQuery,
          paginationPage
        );

        setCircuits(response.circuits);
        setActiveItemType(ItemType.Circuit);
        setProjectSearchResultCount(response.resultCount);
      }
    })();
  }, [constraints, debouncedSearchQuery, paginationPage, searchingForItem]);

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

      {/* Content: Sidebar & cards */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="pl-6 max-w-[317px] space-y-12">
          <SidebarFilters onConstraintsChange={setConstraints} />

          {/* Project submission card */}
          <Link
            href={PageUrl.SubmitProject}
            className="block hover:translate-y-[-6px] transition duration-100"
          >
            <Card className="p-6 shadow-xl items-start space-y-0">
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
            </Card>
          </Link>
        </div>

        <div>
          <CardTabs
            onTabChange={(cardType) => setActiveItemType(cardType)}
            counts={{
              [ItemType.Project]: projectSearchResultCount,
              [ItemType.Circuit]: circuitSearchResultCount,
            }}
          />

          {/* Cards */}
          <div className="grid lg:grid-cols-2 gap-4 md:gap-6 w-full h-min my-6">
            {activeItemType === ItemType.Project
              ? projects.map((project, index) => (
                  <Link
                    key={index}
                    href={`/@${project.repositoryOwner}/${project.repositoryName}`}
                  >
                    <ProjectCard {...project} />
                  </Link>
                ))
              : circuits.map((circuit, index) => (
                  <Link key={index} href={`/@${circuit.filename}`}>
                    <CircuitCard {...circuit} />
                  </Link>
                ))}
          </div>

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
