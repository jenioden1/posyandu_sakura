import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function UserLayout() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

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
                  <Link to="/" className="text-gray-600 hover:text-blue-600">
                    Halaman Umum
                  </Link>
                </li>
                <li>
                  <Link to="/user/dashboard" className="text-blue-600 font-medium">
                    Dashboard Saya
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </li>
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
          &copy; 2025 Posyandu Sehat • Halaman khusus untuk orang tua.
        </div>
      </footer>
    </div>
  )
}

export default UserLayout

