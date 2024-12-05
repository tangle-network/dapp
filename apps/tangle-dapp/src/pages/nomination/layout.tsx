import { Outlet } from 'react-router';
import { BalancesProvider } from '../../context/BalancesContext';

export default function Layout() {
  return (
    <BalancesProvider>
      <Outlet />
    </BalancesProvider>
  );
}
