import { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import DashboardLayout from '../layouts/dashboard';
import MyServices from '../pages/MyServices';

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { path: 'app', element: <Navigate to="/dashboard/app" replace /> },
        { path: 'dashboard', element: <Navigate to="/dashboard/app" replace /> },
        { path: 'dashboard/app', element: lazy(() => import('../pages/DashboardApp')) },
        { path: 'my-services', element: <MyServices /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
