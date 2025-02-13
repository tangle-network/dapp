import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-mono-0 dark:bg-mono-180">
      <Sidebar />
      <main className="pl-[280px] p-6">
        <Outlet />
      </main>
    </div>
  );
}
