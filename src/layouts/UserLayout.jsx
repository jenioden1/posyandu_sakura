import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ConfirmDialog from '../components/common/ConfirmDialog'
import MobileMenu from '../components/common/MobileMenu'

function UserLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/user/dashboard', label: 'Dashboard Saya', icon: '📊' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu */}
      <MobileMenu
        menuItems={[
          ...menuItems,
          { path: '/', label: 'Halaman Umum', icon: '🏠' }
        ]}
        onLogout={() => setShowLogoutConfirm(true)}
        showLogout={true}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white shadow-sm min-h-screen flex-shrink-0">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <div>
              <span className="text-lg font-semibold text-gray-800 block">Orang Tua</span>
              {user?.email && (
                <span className="text-xs text-gray-500 truncate block" title={user.email}>
                  {user.email}
                </span>
              )}
            </div>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>🏠</span>
            <span>Halaman Umum</span>
          </Link>
        </div>
        <div className="p-4 border-t">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>

        <footer className="bg-white border-t mt-auto">
          <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
            &copy; 2025 Posyandu Sehat • Halaman khusus untuk orang tua.
          </div>
        </footer>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari akun ini?"
        confirmText="Ya, Logout"
        cancelText="Batal"
        type="warning"
      />
    </div>
  )
}

export default UserLayout

