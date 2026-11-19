import { createBrowserRouter } from 'react-router-dom';
import { SystemStatusPage } from '../features/system-status/pages/SystemStatusPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SystemStatusPage />,
  },
]);
