import { Header } from '../../components/Header';
import { DashboardTabs } from './components/DashboardTabs';

export default function Dashboard() {
  return (
    <main className="flex flex-col gap-6">
      <Header />

      <DashboardTabs />
    </main>
  );
}
