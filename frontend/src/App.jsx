import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, NavLink, Outlet, RouterProvider } from 'react-router-dom';
import { logout } from './api/auth';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Room from './pages/Room';
import Rooms from './pages/Rooms';
import Study from './pages/Study';

const queryClient = new QueryClient();

function Layout() {
  const onLogout = (e) => {
    e.preventDefault();
    logout();
    window.location.href = '/login';
  };
  return (
    <div className="container vstack">
      <header className="hstack" style={{ justifyContent: 'space-between' }}>
        <nav className="hstack nav" style={{ gap: 12 }}>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/study">Sessions</NavLink>
          <NavLink to="/rooms">Rooms</NavLink>
        </nav>
        <a href="/logout" onClick={onLogout}>Logout</a>
      </header>
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'study', element: <Study /> },
          { path: 'rooms', element: <Rooms /> },
          { path: 'rooms/:id', element: <Room /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
