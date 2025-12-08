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
    const response = await fetch(`${API_BASE}/admin_get_balita.php`)
    return response.json()
  },

  adminSaveBalita: async (data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === 'penimbangan' && Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]))
        } else {
          formData.append(key, data[key])
        }
      }
    })
    
    const response = await fetch(`${API_BASE}/admin_save_balita.php`, {
      method: 'POST',
      body: formData
    })
    return response.json()
  },

  adminDeleteBalita: async (id) => {
    const formData = new FormData()
    formData.append('id', id)
    
    const response = await fetch(`${API_BASE}/admin_delete_balita.php`, {
      method: 'POST',
      body: formData
    })
    return response.json()
  },

  adminGetOrangTua: async () => {
    const response = await fetch(`${API_BASE}/admin_get_orang_tua.php`)
    return response.json()
  },

  createOrangTua: async (data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })
    
    const response = await fetch(`${API_BASE}/create_orang_tua.php`, {
      method: 'POST',
      body: formData
    })
    return response.json()
  },

  deleteOrangTua: async (id) => {
    const formData = new FormData()
    formData.append('id', id)
    
    const response = await fetch(`${API_BASE}/delete_orang_tua.php`, {
      method: 'POST',
      body: formData
    })
    return response.json()
  },

  getBalitaByOrangTua: async () => {
    const response = await fetch(`${API_BASE}/get_balita_by_orang_tua.php`)
    return response.json()
  }
}

