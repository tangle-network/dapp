import { DashboardTabs } from '../../components/DashboardTabs';
import { Header } from '../../components/Header';

export default function Dashboard() {
  return (
    <main className="flex flex-col gap-6">
      <Header />

      <DashboardTabs />
    </main>
  );
}
