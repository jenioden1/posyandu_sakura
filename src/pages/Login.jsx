import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const [userType, setUserType] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password, userType)
      
      if (result.success) {
        // Redirect based on user type
        if (result.redirect) {
          navigate(result.redirect)
        } else if (userType === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/user/dashboard')
        }
      } else {
        setError(result.message || 'Login gagal')
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-gray-800 mb-2">Login Posyandu</div>
          <div className="text-gray-600">Masuk sebagai Admin atau Orang Tua</div>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setUserType('admin')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              userType === 'admin'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setUserType('orang_tua')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              userType === 'orang_tua'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Orang Tua
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="Masukkan email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Masukkan password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Halaman untuk admin dan orang tua Posyandu.<br />
          <a href="/" className="text-blue-600 hover:underline">
            Kembali ke Website User Posyandu
          </a>
        </div>
      </div>
    </div>
  )
}

export default Login

