import { Navigate } from 'react-router';
import type { FC } from 'react';
import useParamWithSchema from '@tangle-network/tangle-shared-ui/hooks/useParamWithSchema';
import { z } from 'zod';
import BlueprintAppServicePage from '../../../../../blueprintApps/components/BlueprintAppServicePage';
import { renderCuratedBlueprintService } from '../../../../../blueprintApps/modules';
import { getBlueprintAppByCanonicalSlug } from '../../../../../blueprintApps/registry';
import { PagePath } from '../../../../../types';

const Page: FC = () => {
  const publisher = useParamWithSchema('publisher', z.string().min(1));
  const slug = useParamWithSchema('slug', z.string().min(1));
  const serviceId = useParamWithSchema('serviceId', z.string().min(1));

  if (!publisher || !slug || !serviceId) {
    return <Navigate to={PagePath.NOT_FOUND} replace />;
  }

  const entry = getBlueprintAppByCanonicalSlug(`${publisher}/${slug}`);
  if (!entry) {
    return <Navigate to={PagePath.NOT_FOUND} replace />;
  }

  const curated = renderCuratedBlueprintService(entry, serviceId);
  if (curated) {
    return curated;
  }

  return <BlueprintAppServicePage entry={entry} serviceId={serviceId} />;
};

export default Page;
