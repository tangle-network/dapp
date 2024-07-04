export type HexagonAvatarProps = {
  address: string;
};

const HexagonAvatar = ({ address }: { address: string }) => {
  return (
    <div className="flex items-center justify-center w-10 h-10 bg-mono-2 rounded-full">
      <Hexagon className="w-8 h-8 fill-primary-0" />
    </div>
  );
};
