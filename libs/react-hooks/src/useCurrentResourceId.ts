import { useWebContext } from '@webb-tools/api-provider-environment';
import { ResourceId } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

/**
 * Hook to get the current resource id
 * @returns The current resource id
 */
export const useCurrentResourceId = () => {
  const [resourceId, setResourceId] = useState<ResourceId | null>(null);

  const { activeApi } = useWebContext();

  // Fetch the current resource id
  useEffect(() => {
    if (!activeApi) {
      return;
    }

    const fetchResourceId = async () => {
      try {
        const resourceId = await activeApi.getResourceId();
        setResourceId(resourceId);
      } catch (error) {
        console.error('Failed to fetch resource id', error);
      }
    };

    fetchResourceId();
  }, [activeApi]);

  return resourceId;
};
