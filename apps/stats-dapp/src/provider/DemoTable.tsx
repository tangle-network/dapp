import { Loadable, Page } from '../provider/hooks/types';
import { Spinner } from '@nepoche/ui-components/Spinner/Spinner';
import { useMemo } from 'react';

export function DemoTable<T>(data: { page: Loadable<Page<T>> }) {
  const list = data.page.val;
  const isLoading = useMemo(() => data.page.isLoading || !data.page.val, [data]);
  const errorMessage = useMemo(() => (data.page.isFailed ? data.page.error || 'Something went wrong' : null), [data]);
  const keys = useMemo(() => (list?.items ? Object.keys(list.items[0] as any) : []), [list]);

  if (isLoading || !list) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  if (errorMessage) {
    return <div>{errorMessage}</div>;
  }
  return (
    <table>
      <tr>
        {keys.map((key) => (
          <th
            style={{
              textTransform: 'capitalize',
            }}
            key={key}
          >
            {key}
          </th>
        ))}
      </tr>
      {list.items.map((item) => {
        return (
          <tr key={(item as any).id}>
            {keys.map((key) => (
              <td key={key}>{JSON.stringify((item as any)[key])}</td>
            ))}
          </tr>
        );
      })}
    </table>
  );
}
