export type DataHookReturnType<
  DataType = unknown,
  ErrorType extends Error | unknown = unknown
> =
  | {
      isLoading: true;
      error: null;
      data: null;
    }
  | {
      isLoading: false;
      error: null;
      data: DataType;
    }
  | {
      isLoading: false;
      error: ErrorType;
      data: null;
    };

const useFormatReturnType = <
  DataType = unknown,
  ErrorType extends Error | unknown = unknown
>({
  data = null,
  isLoading,
  error = null,
}: {
  isLoading: boolean;
  error: ErrorType | null;
  data: DataType | null;
}) => {
  if (isLoading) {
    return {
      isLoading,
      error: null,
      data: null,
    };
  }

  if (error) {
    return {
      isLoading,
      error,
      data: null,
    };
  }

  return {
    isLoading,
    error: null,
    data,
  };
};

export default useFormatReturnType;
