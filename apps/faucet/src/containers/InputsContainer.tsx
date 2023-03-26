import ChainDropdown from '../components/ChainDropdown';
import TokenDropdown from '../components/TokenDropdown';

const InputsContainer = () => {
  return (
    <div>
      <div className="flex gap-2">
        <ChainDropdown />

        <TokenDropdown />
      </div>
    </div>
  );
};

export default InputsContainer;
