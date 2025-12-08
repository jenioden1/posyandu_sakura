import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { formatTanggal } from '../../utils/helpers'
import { useToastContext } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/common/ConfirmDialog'

function AdminOrangTua() {
  const [orangTuaList, setOrangTuaList] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama_ayah: '',
    nama_ibu: '',
    alamat: '',
    no_telp: ''
  })
  const [loading, setLoading] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, onConfirm: null, message: '' })
  const { success, error } = useToastContext()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await api.adminGetOrangTua()
      if (response.success) {
        setOrangTuaList(response.data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = () => {
    setFormData({
      username: '',
      password: '',
      nama_ayah: '',
      nama_ibu: '',
      alamat: '',
      no_telp: ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasi client-side dengan pesan yang jelas
    if (!formData.username.trim()) {
      error('Username wajib diisi. Username akan digunakan sebagai email untuk login.')
      return
    }

    if (!formData.username.includes('@') || !formData.username.includes('.')) {
      error('Format email tidak valid. Username harus berupa email yang valid (contoh: nama@email.com).')
      return
    }

    if (!formData.password.trim()) {
      error('Password wajib diisi. Password minimal 6 karakter untuk keamanan.')
      return
    }

    if (formData.password.length < 6) {
      error('Password terlalu pendek. Password minimal 6 karakter untuk keamanan akun.')
      return
    }

    if (!formData.nama_ayah.trim()) {
      error('Nama ayah wajib diisi. Silakan masukkan nama lengkap ayah.')
      return
    }

    if (!formData.nama_ibu.trim()) {
      error('Nama ibu wajib diisi. Silakan masukkan nama lengkap ibu.')
      return
    }

    try {
      const response = await api.createOrangTua(formData)
      if (response.success) {
        success('Akun orang tua berhasil dibuat')
        closeModal()
        loadData()
      } else {
        // Pesan error yang lebih jelas dari API
        const errorMsg = response.message || 'Gagal membuat akun orang tua'
        if (errorMsg.includes('email-already-exists') || errorMsg.includes('already exists')) {
          error('Email sudah terdaftar. Gunakan email lain atau hubungi administrator untuk reset password.')
        } else if (errorMsg.includes('invalid-email')) {
          error('Format email tidak valid. Pastikan email mengandung @ dan domain yang benar.')
        } else if (errorMsg.includes('weak-password')) {
          error('Password terlalu lemah. Gunakan password minimal 6 karakter dengan kombinasi huruf dan angka.')
        } else {
          error('Gagal membuat akun: ' + errorMsg + '. Silakan coba lagi atau hubungi administrator.')
        }
      }
    } catch (err) {
      console.error('Create error:', err)
      if (err.message && err.message.includes('network')) {
        error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.')
      } else {
        error('Terjadi kesalahan pada sistem. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.')
      }
    }
  }

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      onConfirm: async () => {
        try {
          const response = await api.deleteOrangTua(id)
          if (response.success) {
            success('Akun orang tua berhasil dihapus')
            loadData()
          } else {
            error('Gagal menghapus: ' + (response.message || 'Unknown error'))
          }
        } catch (err) {
          error('Terjadi kesalahan. Silakan coba lagi.')
          console.error('Delete error:', err)
        }
      },
      message: 'Yakin ingin menghapus akun orang tua ini? Tindakan ini tidak dapat dibatalkan.'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Memuat data...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Kelola Akun Orang Tua</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Tambah dan kelola akun orang tua yang dapat mengakses sistem.</p>
        </div>
        <button onClick={openModal} className="btn btn-primary w-full sm:w-auto">
          + Tambah Akun Orang Tua
        </button>
      </div>

      {/* Table */}
      <div className="card bg-white shadow-md border border-gray-200">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Daftar Akun Orang Tua ({orangTuaList.length} akun)
          </h2>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Nama Ayah</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Nama Ibu</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Alamat</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">No. Telp</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Tanggal Dibuat</th>
                    <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orangTuaList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        Belum ada akun orang tua
                      </td>
                    </tr>
                  ) : (
                    orangTuaList.map((ot) => (
                      <tr key={ot.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 py-3 text-sm">
                          <div className="font-medium text-gray-800">{ot.username}</div>
                          <div className="text-xs text-gray-500 md:hidden mt-1">
                            {ot.nama_ayah} / {ot.nama_ibu}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-gray-800 hidden md:table-cell">{ot.nama_ayah}</td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-gray-800 hidden md:table-cell">{ot.nama_ibu}</td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-gray-800 hidden lg:table-cell">{ot.alamat || '-'}</td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-gray-800 hidden xl:table-cell">{ot.no_telp || '-'}</td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-gray-800 hidden lg:table-cell">{formatTanggal(ot.created_at)}</td>
                        <td className="px-3 sm:px-4 py-3 text-sm">
                          <button
                            onClick={() => handleDelete(ot.id)}
                            className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full my-auto">
            <div className="p-4 sm:p-6 border-b flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Tambah Akun Orang Tua</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ayah *</label>
                <input
                  type="text"
                  value={formData.nama_ayah}
                  onChange={(e) => setFormData({...formData, nama_ayah: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ibu *</label>
                <input
                  type="text"
                  value={formData.nama_ibu}
                  onChange={(e) => setFormData({...formData, nama_ibu: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                  className="input"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telp</label>
                <input
                  type="text"
                  value={formData.no_telp}
                  onChange={(e) => setFormData({...formData, no_telp: e.target.value})}
                  className="input"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  Simpan
                </button>
                <button type="button" onClick={closeModal} className="btn btn-outline">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, onConfirm: null, message: '' })}
        onConfirm={confirmDialog.onConfirm || (() => {})}
        title="Konfirmasi Hapus"
        message={confirmDialog.message}
        type="danger"
      />
    </div>
  )
}

export default AdminOrangTua

