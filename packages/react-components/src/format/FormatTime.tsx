import Dayjs from 'dayjs';
import React, { FC } from 'react';

interface Props {
  time: Date | string;
  formatter?: string;
  unix?: boolean;
}

export const FormatTime: FC<Props> = ({ formatter = 'YYYY/MM/DD HH:mm', time, unix = true }) => {
  if (unix) {
    return <span>{Dayjs.unix(Number(time)).format(formatter)}</span>;
  }

  return <span>{Dayjs(Number(time)).format(formatter)}</span>;
};
