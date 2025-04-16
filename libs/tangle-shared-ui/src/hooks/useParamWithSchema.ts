import { useParams } from 'react-router';
import { useMemo } from 'react';
import { z } from 'zod';

const useParamWithSchema = <T>(paramName: string, schema: z.ZodType<T>) => {
  const params = useParams();
  const paramValue = params[paramName];

  const value = useMemo(() => {
    if (paramValue === undefined) {
      return undefined;
    }

    const result = schema.safeParse(paramValue);

    return result.success ? result.data : undefined;
  }, [paramValue, schema]);

  return value;
};

export default useParamWithSchema;
