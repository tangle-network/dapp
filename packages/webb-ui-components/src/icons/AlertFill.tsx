import { IconSize } from '@webb-dapp/webb-ui-components/icons/types';
import { getIconSizeInPixel } from '@webb-dapp/webb-ui-components/icons/utils';

export const AlertFill: React.FC<{ size?: IconSize; width?: number; height?: number }> = ({
  size = 'md',
  ...props
}) => {
  const imageSize = getIconSizeInPixel(size);
  return (
    <img
      style={{
        maxWidth: imageSize,
      }}
      src={
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAZCAYAAAArK+5dAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAKwSURBVHgB1VRLSFRhFP7+ue/J0uhBSQtfkeIilMwskh70WERtgsJFtmwRPWwRlIugTUIFQRtxV8vaRkhRiDYOGgVFGZiJpUQPkKLuTDN37un8d2Ycp8mZO9Mmz+XwH/7/fOf7z+P+wP8kFG5dRs/PVBSDEX4daaipEonZJxBqEKKiTWx/+s4PLgC/QvZlLLeqUKGthql2+4X5yoBGdrdAmQ7DUpMXsuPAD7Vd7Hg9WAjrLwP3Ux8MJeNrqaz6NaJLBfEFHWh4y3EYzsbvERe9d2Y9tX8RoEdbELrbgX8RenNwKQ3XTtKrRvoSbiCuJ8ntz8P1JPdotHGGZnqDKDmD2enzCOpVslNlloCiCKis0va6p7uVmOzpLomAHq+pgvLzJFJ9NXQBXQM0TcDUUzCNV9PsohcdNUUTwFx5BVagPD1nQpEEAY9I2nNi8Bd52VMUAY3s2gotegReIEoquV5w05DlcTP7Ci9q9DCF9+30RUDEvaSPNyEDkZNR1+HgwBJTeHbWmS73Jq76IsBgdSdUuwlCguMZdeOwOLglG5yIZ58JViPWTKGG03kJaGhbJRR+ElQJjGWrG4PBGUiVds65lmAi+yI9rF8xP6aaRedOnEBZYh1fke2c3HDskA7H4bq7UfxVdKyCgwtsnUtvzY0D9ZdXc/BxBF3F/xv7h8i+R7heZut60fxoKjsDS1yHbivp4cgRJh14BsS4ens25yHR+PsW6mVrfwrG8Qbq9iLwth/WwrjRMaCtM2mHbwObNuQhicqpqjsg2sfvBXgsFTgf+PZI1n0BNfkvVnjm5Zvq/ch5fKFxCZypHgqdtQTdt06hLHKDEysoM1/5clyi2rWFfcF+SNR0CXqgjyEYqy+5sfnENt6r0Ixb3NSjEAGN13k0hOIl/XAxmPht0aw+LHr5DfR8D+Q6ayZDAAAAAElFTkSuQmCC'
      }
    />
  );
};
