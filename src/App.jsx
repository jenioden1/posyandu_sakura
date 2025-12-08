import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import UserLayout from './layouts/UserLayout'
import Home from './pages/Home'
import Statistik from './pages/Statistik'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminBalita from './pages/admin/Balita'
import ManajemenBalita from './pages/admin/ManajemenBalita'
import AdminOrangTua from './pages/admin/OrangTua'
import AdminLaporan from './pages/admin/Laporan'
import UserDashboard from './pages/user/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="statistik" element={<Statistik />} />
          </Route>
          
          {/* Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute type="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="balita" element={<AdminBalita />} />
            <Route path="manajemen-balita" element={<ManajemenBalita />} />
            <Route path="orang-tua" element={<AdminOrangTua />} />
            <Route path="laporan" element={<AdminLaporan />} />
          </Route>
          
          {/* Testing Route - Bypass Auth untuk Testing Firebase */}
          <Route path="/test/manajemen-balita" element={<ManajemenBalita />} />
          
          {/* User Routes */}
          <Route path="/user" element={
            <ProtectedRoute type="orang_tua">
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<UserDashboard />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

