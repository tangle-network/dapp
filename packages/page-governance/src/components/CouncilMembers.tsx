import React, { FC, ReactNode, useMemo } from 'react';
import { upperFirst } from 'lodash';
import { AccountId } from '@polkadot/types/interfaces';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { Card, Table, ColumnsType, styled } from '@webb-dapp/ui-components';
import { useCouncilMembers } from '@webb-dapp/react-hooks';
import { FormatAddress, FormatRatio } from '@webb-dapp/react-components';
import { CouncilType } from '../config';

interface Props {
  council: CouncilType;
}

const CCard = styled(Card)`
  .ant-table-cell {
    padding: 16px !important;
  }
`;

export const CouncilMembers: FC<Props> = ({ council }) => {
  const members = useCouncilMembers(council);

  const data = useMemo(() => {
    if (!members?.length) return [];

    return members.map((item) => ({
      member: item,
      weight: new FixedPointNumber(1 / members.length),
    }));
  }, [members]);

  const columns: ColumnsType<{ member: AccountId; weight: FixedPointNumber }> = useMemo(
    () => [
      {
        align: 'left',
        /* eslint-disable-next-line react/display-name */
        render: ({ member }): ReactNode => {
          return <FormatAddress address={member.toString()} withCopy withFullAddress withIcon />;
        },
        title: `${upperFirst(council)} Council Seats`,
      },
      {
        align: 'left',
        /* eslint-disable-next-line react/display-name */
        render: ({ weight }): JSX.Element => <FormatRatio data={weight} />,
        title: 'Vote Weight',
      },
    ],
    [council]
  );

  return (
    <CCard padding={false}>
      <Table columns={columns} dataSource={data} loading={!members} pagination={false} rowKey={'member'} />
    </CCard>
  );
};
