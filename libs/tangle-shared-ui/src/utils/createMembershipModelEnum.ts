export type FixedMembershipModel = {
  type: 'Fixed';
  minOperators: number;
};

export type DynamicMembershipModel = {
  type: 'Dynamic';
  minOperators: number;
  maxOperators: number;
};

export type MembershipModel = FixedMembershipModel | DynamicMembershipModel;

const createMembershipModelEnum = (membershipModel: MembershipModel) => {
  return membershipModel.type === 'Fixed'
    ? {
        Fixed: {
          minOperators: membershipModel.minOperators,
        },
      }
    : {
        Dynamic: {
          minOperators: membershipModel.minOperators,
          maxOperators: membershipModel.maxOperators,
        },
      };
};

export default createMembershipModelEnum;
