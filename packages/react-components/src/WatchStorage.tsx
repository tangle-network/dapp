import { useCall } from '@webb-dapp/react-hooks';
import { FC, ReactElement } from 'react';

interface Props {
  path: string;
  params: any[];
  render: (data: any) => ReactElement;
}

export const WatchStorage: FC<Props> = ({ params, path, render }) => {
  const data = useCall(path, params);

  return render(data);
};
