import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'


import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Study from './pages/Study'



const queryClient = new QueryClient()


function Layout({ children }) {
  return (
    <div className="container vstack">
      <header className="hstack" style={{ justifyContent: 'space-between' }}>
        <nav className="hstack" style={{ gap: 12 }}>
          <Link to="/">Home</Link>
        </nav>
        <a href="/login">Logout/Login</a>
      </header>
      {children}
    </div>
  )
}


function Authed() {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  )
}


const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Authed /> },
    ]
  }
])


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
