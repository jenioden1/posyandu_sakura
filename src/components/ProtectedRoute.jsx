import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children, type }) {
  const { userType, loading } = useAuth()

  // TEMPORARY: Bypass auth untuk testing Firebase
  // TODO: Implementasi Firebase Auth untuk production
  const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true' || false;

  if (BYPASS_AUTH) {
    // Skip auth check untuk testing
    return children;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Memuat...</div>
      </div>
    )
  }

  if (!userType || userType !== type) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

