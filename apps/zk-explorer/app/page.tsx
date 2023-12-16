'use client';

import {
  Typography,
  Button,
  Input,
  Card,
} from '@webb-tools/webb-ui-components';
import { HeaderActions } from '../components/HeaderActions';
import { Search } from '@webb-tools/icons';
import { FilteringSidebar } from '../components/FilteringSidebar';
import { ProjectCard } from '../components/ProjectCard';
import { Link } from '@webb-tools/webb-ui-components/components/Link';

export type ProjectItem = {
  avatarUrl: string;
  repositoryOwner: string;
  repositoryName: string;
  description: string;
  githubStars: number;
  circuitCount: number;
  contributorAvatarUrls: string[];
};

export default function Index() {
  const projects: ProjectItem[] = [
    {
      avatarUrl: 'https://avatars.githubusercontent.com/u/76852793?s=200&v=4',
      repositoryOwner: 'webb',
      repositoryName: 'masp',
      githubStars: 123,
      circuitCount: 24,
      description: 'Short blurb about what the purpose of this circuit.',
      contributorAvatarUrls: [
        'https://avatars.githubusercontent.com/u/76852793?s=200&v=4',
      ],
    },
  ];

  // TODO: This is only for testing purposes. Remove this once the actual data is available.
  for (let i = 0; i < 4; i++) {
    projects[0].contributorAvatarUrls.push(
      projects[0].contributorAvatarUrls[0]
    );
  }

  // TODO: This is only for testing purposes. Remove this once the actual data is available.
  for (let i = 0; i < 13; i++) {
    projects.push(projects[0]);
  }

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

        <div className="relative flex items-end my-4 z-10">
          <HeaderActions />
        </div>

        <div className="relative space-y-4 px-5 z-10">
          <Typography variant="body4" className="uppercase">
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

      <div className="shadow-m py-4 px-6 dark:bg-mono-170 rounded-xl flex gap-2">
        <Button variant="primary" className="px-3">
          Projects
        </Button>

        <Button
          variant="primary"
          className="px-3 dark:bg-transparent border-none dark:text-mono-0"
        >
          Circuits
        </Button>

        <Input
          id="keyword search"
          rightIcon={<Search size="lg" />}
          className="w-full"
          placeholder="Search for specific keywords..."
        />
      </div>

      <div className="flex">
        <FilteringSidebar />

        <div className="grid grid-cols-2 gap-6 w-full">
          {projects.map((project, index) => (
            <Link
              key={index}
              href={`/@${project.repositoryOwner}/${project.repositoryName}`}
            >
              <ProjectCard {...project} />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
