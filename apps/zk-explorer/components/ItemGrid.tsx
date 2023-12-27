import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { FC } from 'react';
import { ItemType, PageUrl } from '../utils/utils';
import { ProjectItem } from './ProjectCard/types';
import { ProjectCard } from './ProjectCard/ProjectCard';
import { CircuitItem } from './CircuitCard/types';
import { CircuitCard } from './CircuitCard/CircuitCard';
import { Search } from '@webb-tools/icons';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import Link from 'next/link';

export type CardGridProps = PropsOf<'div'> & {
  selectedItemType: ItemType;
  projects: ProjectItem[];
  circuits: CircuitItem[];
};

export const ItemGrid: FC<CardGridProps> = ({
  selectedItemType,
  projects,
  circuits,
  ...rest
}) => {
  const items = selectedItemType === ItemType.Project ? projects : circuits;

  const wereResultsFound = items.length > 0;

  return wereResultsFound ? (
    <div className="grid lg:grid-cols-2 gap-4 md:gap-6 w-full h-min my-6">
      {selectedItemType === ItemType.Project
        ? projects.map((project, index) => (
            <Link
              key={index}
              href={`/@${project.repositoryOwner}/${project.repositoryName}`}
            >
              <ProjectCard {...project} />
            </Link>
          ))
        : circuits.map((circuit, index) => (
            // TODO: Need proper URL for circuits.
            <Link key={index} href={`/@${circuit.filename}`}>
              <CircuitCard {...circuit} />
            </Link>
          ))}
    </div>
  ) : (
    <div className="flex flex-col items-center h-full py-16" {...rest}>
      <Search size="lg" className="mb-2" />

      <Typography variant="h5" fw="bold" className="text-center">
        No {selectedItemType.toLowerCase()}s found matching the search criteria
      </Typography>

      <Typography variant="body1" fw="normal" className="text-center">
        Try adjusting your search constraints or
        <br />
        <Link className="inline-block" href={PageUrl.SubmitProject}>
          <Button variant="link">Submit a new project!</Button>
        </Link>
      </Typography>
    </div>
  );
};
