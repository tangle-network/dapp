import BlueprintGallery from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery';
import useBlueprintListing from '@tangle-network/tangle-shared-ui/data/blueprints/useBlueprintListing';
import { RowSelectionState } from '@tanstack/table-core';
import {
  ComponentProps,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useMemo,
} from 'react';
import { Link } from 'react-router';
import { PagePath } from '../../types';

const BlueprintItemWrapper = ({
  children,
  id,
}: PropsWithChildren<{ id: string }>) => {
  return <Link to={`${PagePath.BLUEPRINTS}/${id}`}>{children}</Link>;
};

type Props = {
  rowSelection: RowSelectionState;
  onRowSelectionChange: Dispatch<SetStateAction<RowSelectionState>>;
} & ReturnType<typeof useBlueprintListing>;

const BlueprintListing: FC<Props> = ({
  rowSelection,
  onRowSelectionChange,
  blueprints,
  isLoading,
  error,
}) => {
  const blueprintsDisplay = useMemo<
    ComponentProps<typeof BlueprintGallery>['blueprints']
  >(() => {
    return Object.values(blueprints).map((blueprint) => ({
      ...blueprint,
      renderImage(imageUrl) {
        return (
          <img
            src={imageUrl}
            width={72}
            height={72}
            alt={blueprint.name}
            className="flex-shrink-0 bg-center rounded-full"
          />
        );
      },
    }));
  }, [blueprints]);

  return (
    <BlueprintGallery
      blueprints={blueprintsDisplay}
      isLoading={isLoading}
      error={error}
      BlueprintItemWrapper={BlueprintItemWrapper}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
    />
  );
};

BlueprintListing.displayName = 'BlueprintListing';

export default BlueprintListing;
