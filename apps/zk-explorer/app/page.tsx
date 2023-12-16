'use client';

import {
  Typography,
  Button,
  Input,
  Card,
  Pagination,
} from '@webb-tools/webb-ui-components';
import { HeaderActions } from '../components/HeaderActions';
import { Search } from '@webb-tools/icons';
import {
  FilteringConstraints,
  FilteringSidebar,
} from '../components/FilteringSidebar';
import { ProjectCard } from '../components/ProjectCard';
import { Link } from '@webb-tools/webb-ui-components/components/Link';
import { ArrowUpIcon } from '@radix-ui/react-icons';
import { PageUrl } from '../utils/utils';
import { useEffect, useState } from 'react';
import { fetchProjects } from '../utils/api';
import useDebounce from '../hooks/useDebounce';

export type ProjectItem = {
  avatarUrl: string;
  repositoryOwner: string;
  repositoryName: string;
  description: string;
  stargazerCount: number;
  circuitCount: number;
  contributorAvatarUrls: string[];
};

export default function Index() {
  const SEARCH_QUERY_DEBOUNCE_DELAY = 2000;
  const PROJECT_CARDS_PER_PAGE = 12;
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [totalProjectCount, setTotalProjectCount] = useState<number>(0);
  const [paginationPage, setPaginationPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const debouncedSearchQuery = useDebounce(
    searchQuery,
    SEARCH_QUERY_DEBOUNCE_DELAY
  );

  const [constraints, setConstraints] = useState<FilteringConstraints>(
    new Map()
  );

  // TODO: This is only for testing purposes. Remove this once the actual data is available.
  useEffect(() => {
    const debugProject: ProjectItem = {
      avatarUrl: 'https://avatars.githubusercontent.com/u/76852793?s=200&v=4',
      repositoryOwner: 'webb',
      repositoryName: 'masp',
      stargazerCount: 123,
      circuitCount: 24,
      description:
        'Short blurb about what the purpose of this circuit. This is a longer line to test multiline.',
      contributorAvatarUrls: [
        'https://avatars.githubusercontent.com/u/76852793?s=200&v=4',
      ],
    };

    for (let i = 0; i < 4; i++) {
      debugProject.contributorAvatarUrls.push(
        debugProject.contributorAvatarUrls[0]
      );
    }

    const debugProjects = [];

    // TODO: This is only for testing purposes. Remove this once the actual data is available.
    for (let i = 0; i < 13; i++) {
      debugProjects.push(debugProject);
    }

    setProjects(debugProjects);
  }, []);

  useEffect(() => {
    const MIN_SEARCH_QUERY_LENGTH = 3;

    // A small query length can yield too many results. Let's
    // wait until the user has typed a more more specific query.
    if (
      debouncedSearchQuery.length > 0 &&
      debouncedSearchQuery.length < MIN_SEARCH_QUERY_LENGTH
    ) {
      return;
    }

    console.log('Re-fetching projects...');

    (async () => {
      const response = await fetchProjects(
        constraints,
        debouncedSearchQuery,
        paginationPage
      );

      setProjects(response.projects);
      setTotalProjectCount(response.totalCount);
    })();
  }, [constraints, debouncedSearchQuery, paginationPage]);

  return (
    <main className="flex flex-col gap-6">
      {/* Custom, landing-page-only header */}
      {/* TODO: Need to figure out a way to significantly reduce the size of the background image (it's 1mb right now). Should be <=100kb for optimal SEO. One way would be to trim it to what is actually used in terms of max proportions visible to the user, or reduce its resolution. */}
      <header
        className="relative pb-12 bg-cover bg-center rounded-b-xl mb-6"
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
        <div className="flex gap-2">
          <Button variant="primary" className="px-3">
            Projects
          </Button>

          <Button
            variant="primary"
            className="px-3 dark:bg-transparent border-none dark:text-mono-0"
          >
            Circuits
          </Button>
        </div>

        <Input
          id="keyword search"
          rightIcon={<Search size="lg" />}
          className="w-full"
          placeholder="Search projects for specific keywords..."
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
        />
      </div>

      {/* Sidebar */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="pl-6 max-w-[317px] space-y-12">
          <FilteringSidebar onConstraintsChange={setConstraints} />

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
          <div className="grid lg:grid-cols-2 gap-4 md:gap-6 w-full h-min mb-6">
            {projects.map((project, index) => (
              <Link
                key={index}
                href={`/@${project.repositoryOwner}/${project.repositoryName}`}
              >
                <ProjectCard {...project} />
              </Link>
            ))}
          </div>

          <Pagination
            itemsPerPage={PROJECT_CARDS_PER_PAGE}
            totalItems={totalProjectCount}
            page={paginationPage}
            setPageIndex={setPaginationPage}
            title="Projects"
          />
        </div>
      </div>
    </main>
  );
}
