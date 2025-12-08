import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ConfirmDialog from '../components/common/ConfirmDialog'

function PublicLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { userType, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <span className="text-lg lg:text-xl font-semibold text-gray-800">Posyandu Sehat</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:block">
              <ul className="flex items-center gap-6">
                <li>
                  <Link 
                    to="/" 
                    className={`${location.pathname === '/' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
                  >
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/statistik" 
                    className={`${location.pathname === '/statistik' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
                  >
                    Statistik
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/tentang" 
                    className={`${location.pathname === '/tentang' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
                  >
                    Tentang
                  </Link>
                </li>
                {userType === 'orang_tua' && (
                  <li>
                    <Link to="/user/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Dashboard Saya
                    </Link>
                  </li>
                )}
                {userType === 'admin' && (
                  <li>
                    <Link to="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Admin
                    </Link>
                  </li>
                )}
                {userType ? (
                  <li>
                    <button 
                      onClick={() => setShowLogoutConfirm(true)}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                ) : (
                  <li>
                    <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-800"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t pt-4">
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 ${location.pathname === '/' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
                  >
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/statistik"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 ${location.pathname === '/statistik' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
                  >
                    Statistik
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/tentang"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 ${location.pathname === '/tentang' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
                  >
                    Tentang
                  </Link>
                </li>
                {userType === 'orang_tua' && (
                  <li>
                    <Link 
                      to="/user/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-gray-600"
                    >
                      Dashboard Saya
                    </Link>
                  </li>
                )}
                {userType === 'admin' && (
                  <li>
                    <Link 
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-gray-600"
                    >
                      Admin
                    </Link>
                  </li>
                )}
                {userType ? (
                  <li>
                    <button 
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setShowLogoutConfirm(true)
                      }}
                      className="block py-2 text-gray-600 w-full text-left"
                    >
                      Logout
                    </button>
                  </li>
                ) : (
                  <li>
                    <Link 
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-gray-600"
                    >
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 lg:py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          &copy; 2025 Posyandu Sehat • Data perkembangan berasal dari halaman admin (kader).
        </div>
      </footer>

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

export default PublicLayout

