import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, NavLink } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'


import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Study from './pages/Study'
import Rooms from './pages/Rooms'
import Room from './pages/Room'
import { logout } from './api/auth'



const queryClient = new QueryClient()


function Layout({ children }) {
  const onLogout = (e) => {
    e.preventDefault()
    logout()
    window.location.href = '/login'
  }
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

function AuthedStudy() {
  return (
    <Layout>
      <Study />
    </Layout>
  )
}

function AuthedRooms() {
  return (
    <Layout>
      <Rooms />
    </Layout>
  )
}

function AuthedRoom() {
  return (
    <Layout>
      <Room />
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
      { path: 'study', element: <AuthedStudy /> },
      { path: 'rooms', element: <AuthedRooms /> },
      { path: 'rooms/:id', element: <AuthedRoom /> },
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
