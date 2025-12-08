const API_BASE = '/api'

export const api = {
  // Auth
  login: async (username, password, userType) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    formData.append('user_type', userType)
    
    const response = await fetch(`${API_BASE}/login.php`, {
      method: 'POST',
      body: formData
    })
    return response.json()
  },

  logout: async () => {
    const response = await fetch(`${API_BASE}/logout.php`)
    return response.json()
  },

  // Public
  getBalita: async () => {
    const response = await fetch(`${API_BASE}/get_balita.php`)
    return response.json()
  },

  getBalitaDetail: async (id) => {
    const response = await fetch(`${API_BASE}/get_balita_detail.php?id=${id}`)
    return response.json()
  },

  getPenimbangan: async (balitaId) => {
    const response = await fetch(`${API_BASE}/get_penimbangan.php?balita_id=${balitaId}`)
    return response.json()
  },

  // Admin
  adminGetBalita: async () => {
    const response = await fetch(`${API_BASE}/admin_get_balita`)
    return response.json()
  },

  adminSaveBalita: async (data) => {
    const response = await fetch(`${API_BASE}/admin_save_balita`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  adminDeleteBalita: async (id) => {
    const response = await fetch(`${API_BASE}/admin_delete_balita`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    return response.json()
  },

  adminGetOrangTua: async () => {
    const response = await fetch(`${API_BASE}/admin_get_orang_tua`)
    return response.json()
  },

  createOrangTua: async (data) => {
    const response = await fetch(`${API_BASE}/create_orang_tua`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  deleteOrangTua: async (id) => {
    const response = await fetch(`${API_BASE}/delete_orang_tua`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    return response.json()
  },

  getBalitaByOrangTua: async () => {
    // Get Firebase Auth token from current user
    const { auth } = await import('../config/firebase');
    if (!auth || !auth.currentUser) {
      return { success: false, message: 'User not authenticated' };
    }
    
    try {
      const token = await auth.currentUser.getIdToken();
      
      const response = await fetch(`${API_BASE}/get_balita_by_orang_tua`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.json();
    } catch (error) {
      console.error('Error getting token:', error);
      return { success: false, message: 'Failed to get authentication token' };
    }
  },

  getPemeriksaanByBalita: async (balitaId) => {
    const response = await fetch(`${API_BASE}/get_pemeriksaan_by_balita?balita_id=${balitaId}`)
    return response.json()
  }
}

