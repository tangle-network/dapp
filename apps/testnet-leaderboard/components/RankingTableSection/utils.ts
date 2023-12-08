import { BadgeEnum } from '../../types';
import { LeaderboardSuccessResponseType } from './types';

const WEBB_ADDRESSES: Array<string> = [
  '0x9a457869037b3e7643db0b71e7340d5f319ec5b53be0bffbc8280fe9a6d6bd68',
  '0xf4e206607ffffcd389c4c60523de5dda5a411d1435f8540b6b6bc181553bd65a',
  '0x4eddfb7cdb385617475a383929a3f129acad452d5789f27ca94373a1fa877b15',
  '0x8e92157e55a72fe0ee78c251a7553af341635bec0aafee1e4189cf8ce52cdd71',
  '0x16be9647f91aa5441e300acb8f0d6ccc63e72850202a7947df6a646c1bb4071a',
  '0x020d672a9e42b74d47f6280f8a5ea04f11f8ef53d9bcfba8a7c652ad0131a4d2',
  '0x0297579c2b3896c65bf556e710ba361d76bff80827e30d70bc8f1d39049005c5',
  '0x02427a6cf7f1d7538d9e3e4df834e27db337fd6ef0f530aab4e9799ff865e843',
  '0x036aec5853fba2662f31ba89e859ac100daa6c58dc8fdaf0555565663f2b99f8',
  '0x028a4c0781f8369fdd873f8531491f24e2e806fd11a13d828cb4099e6c104510',
];

export function isBadgeEnum(badge: string): badge is BadgeEnum {
  return Object.values(BadgeEnum).includes(badge as BadgeEnum);
}

export function filterData(
  data: LeaderboardSuccessResponseType
): LeaderboardSuccessResponseType['data'] {
  const { participants } = data.data;

  const filteredParticipants = participants.filter(
    (participant) =>
      participant.addresses.length > 0 &&
      participant.addresses.every(
        (addressObj) => !WEBB_ADDRESSES.includes(addressObj.address)
      )
  );

  if (filteredParticipants.length === participants.length) {
    return data.data;
  }

  return {
    ...data.data,
    participants: filteredParticipants,
    total: filteredParticipants.length,
  };
}
