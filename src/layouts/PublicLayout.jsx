import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function PublicLayout() {
  const location = useLocation()
  const { userType, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <span className="text-xl font-semibold text-gray-800">Posyandu Sehat</span>
            </div>
            <nav>
              <ul className="flex items-center gap-6">
                <li>
                  <Link 
                    to="/" 
                    className={`${location.pathname === '/' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
                  >
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/statistik" 
                    className={`${location.pathname === '/statistik' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
                  >
                    Statistik
                  </Link>
                </li>
                {userType === 'orang_tua' && (
                  <li>
                    <Link to="/user/dashboard" className="text-gray-600 hover:text-blue-600">
                      Dashboard Saya
                    </Link>
                  </li>
                )}
                {userType === 'admin' && (
                  <li>
                    <Link to="/admin" className="text-gray-600 hover:text-blue-600">
                      Admin
                    </Link>
                  </li>
                )}
                {userType ? (
                  <li>
                    <button 
                      onClick={logout}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      Logout
                    </button>
                  </li>
                ) : (
                  <li>
                    <Link to="/login" className="text-gray-600 hover:text-blue-600">
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          &copy; 2025 Posyandu Sehat • Data perkembangan berasal dari halaman admin (kader).
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout

