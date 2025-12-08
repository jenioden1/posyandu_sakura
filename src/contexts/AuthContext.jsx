import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdTokenResult
} from 'firebase/auth'
import { auth } from '../config/firebase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Skip jika auth tidak tersedia (Firebase Auth belum diaktifkan)
    if (!auth) {
      setLoading(false);
      return;
    }

    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user token to check custom claims (role)
        try {
          const tokenResult = await getIdTokenResult(firebaseUser)
          const role = tokenResult.claims.role || 'orang_tua' // Default role
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName
          })
          setUserType(role)
        } catch (error) {
          console.error('Error getting token:', error)
          // Fallback: set as orang_tua if can't get role
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName
          })
          setUserType('orang_tua')
        }
      } else {
        setUser(null)
        setUserType(null)
      }
      setLoading(false)
    })

    return () => {
      if (unsubscribe) unsubscribe();
    }
  }, [])

  const login = async (email, password, type) => {
    try {
      // Check if bypass auth is enabled (ONLY for development)
      const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true';
      const IS_PRODUCTION = import.meta.env.MODE === 'production';
      
      // WARNING: Bypass auth hanya untuk development, tidak aman untuk production!
      if (BYPASS_AUTH && !IS_PRODUCTION) {
        console.warn('⚠️ BYPASS AUTH ENABLED - Hanya untuk development/testing!')
        // Bypass auth untuk testing Firebase (development only)
        setUser({ email, type })
        setUserType(type)
        return { 
          success: true, 
          redirect: type === 'admin' ? '/admin/dashboard' : '/user/dashboard' 
        }
      }

      // PRODUCTION: Use Firebase Authentication
      if (!auth) {
        throw new Error('Firebase Authentication belum diaktifkan. Enable di Firebase Console atau gunakan bypass auth untuk development.');
      }
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const firebaseUser = userCredential.user
        
        // Get user role from custom claims
        const tokenResult = await getIdTokenResult(firebaseUser)
        const userRole = tokenResult.claims.role || 'orang_tua'
        
        // Verify user type matches
        if (type === 'admin' && userRole !== 'admin') {
          await signOut(auth)
          return { 
            success: false, 
            message: 'Akun ini bukan admin. Silakan login sebagai Orang Tua.' 
          }
        }
        
        if (type === 'orang_tua' && userRole === 'admin') {
          // Admin can login as orang_tua too (optional)
          // Or you can restrict: return { success: false, message: 'Admin harus login sebagai Admin' }
        }
        
        // User is already set by onAuthStateChanged listener
        return { 
          success: true, 
          redirect: type === 'admin' ? '/admin/dashboard' : '/user/dashboard' 
        }
      } catch (firebaseError) {
        // Handle Firebase Auth errors
        let errorMessage = 'Login gagal. Silakan coba lagi.'
        
        switch (firebaseError.code) {
          case 'auth/user-not-found':
            errorMessage = 'Email tidak terdaftar.'
            break
          case 'auth/wrong-password':
            errorMessage = 'Password salah.'
            break
          case 'auth/invalid-email':
            errorMessage = 'Format email tidak valid.'
            break
          case 'auth/user-disabled':
            errorMessage = 'Akun ini telah dinonaktifkan.'
            break
          case 'auth/too-many-requests':
            errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti.'
            break
          default:
            errorMessage = firebaseError.message || 'Login gagal. Silakan coba lagi.'
        }
        
        return { success: false, message: errorMessage }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Terjadi kesalahan. Silakan coba lagi.' 
      }
    }
  }

  const logout = async () => {
    if (!auth) {
      // Jika auth tidak tersedia, clear state saja
      setUser(null);
      setUserType(null);
      return;
    }
    try {
      // Use Firebase Auth logout
      await signOut(auth)
      // User state will be cleared by onAuthStateChanged listener
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if Firebase error
      setUser(null)
      setUserType(null)
    }
  }

  const value = {
    user,
    userType,
    loading,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

