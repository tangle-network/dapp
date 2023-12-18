import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { FC } from 'react';
import { ItemType, PageUrl } from '../utils/utils';
import { ProjectItem } from './ProjectCard/types';
import { ProjectCard } from './ProjectCard/ProjectCard';
import { CircuitItem } from './CircuitCard/types';
import { CircuitCard } from './CircuitCard/CircuitCard';
import { Search } from '@webb-tools/icons';
import { Button, Typography } from '@webb-tools/webb-ui-components';

export type CardGridProps = PropsOf<'div'> & {
  activeItemType: ItemType;
  projects: ProjectItem[];
  circuits: CircuitItem[];
};

export const ItemGrid: FC<CardGridProps> = (props) => {
  const items =
    props.activeItemType === ItemType.Project ? props.projects : props.circuits;

  const wereResultsFound = items.length > 0;

  return wereResultsFound ? (
    <div className="grid lg:grid-cols-2 gap-4 md:gap-6 w-full h-min my-6">
      {props.activeItemType === ItemType.Project
        ? props.projects.map((project, index) => (
            <a
              key={index}
              href={`/@${project.repositoryOwner}/${project.repositoryName}`}
            >
              <ProjectCard {...project} />
            </a>
          ))
        : props.circuits.map((circuit, index) => (
            // TODO: Need proper URL for circuits.
            <a key={index} href={`/@${circuit.filename}`}>
              <CircuitCard {...circuit} />
            </a>
          ))}
    </div>
  ) : (
    <div className="flex flex-col items-center h-full pt-16" {...props}>
      <Search size="lg" className="mb-2" />

      <Typography variant="h5" fw="bold">
        No {props.activeItemType.toLowerCase()}s found matching the search
        criteria
      </Typography>

      <Typography variant="body1" fw="normal">
        Try adjusting your search constraints or
        <Button className="inline" variant="link" href={PageUrl.SubmitProject}>
          Submit your own project!
        </Button>
      </Typography>
    </div>
  );
};
