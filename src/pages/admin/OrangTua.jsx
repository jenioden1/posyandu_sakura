import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { formatTanggal } from '../../utils/helpers'

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

    try {
      const response = await api.createOrangTua(formData)
      if (response.success) {
        alert('Akun orang tua berhasil dibuat')
        closeModal()
        loadData()
      } else {
        alert('Gagal membuat akun: ' + (response.message || 'Unknown error'))
      }
    } catch (error) {
      alert('Terjadi kesalahan. Silakan coba lagi.')
      console.error('Create error:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus akun orang tua ini?')) return

    try {
      const response = await api.deleteOrangTua(id)
      if (response.success) {
        loadData()
      } else {
        alert('Gagal menghapus: ' + (response.message || 'Unknown error'))
      }
    } catch (error) {
      alert('Terjadi kesalahan. Silakan coba lagi.')
      console.error('Delete error:', error)
    }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kelola Akun Orang Tua</h1>
          <p className="text-gray-600 mt-1">Tambah dan kelola akun orang tua yang dapat mengakses sistem.</p>
        </div>
        <button onClick={openModal} className="btn btn-primary">
          + Tambah Akun Orang Tua
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Daftar Akun Orang Tua ({orangTuaList.length} akun)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Ayah</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Ibu</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No. Telp</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Dibuat</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
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
                  <tr key={ot.id}>
                    <td className="px-4 py-2 text-sm">{ot.username}</td>
                    <td className="px-4 py-2 text-sm">{ot.nama_ayah}</td>
                    <td className="px-4 py-2 text-sm">{ot.nama_ibu}</td>
                    <td className="px-4 py-2 text-sm">{ot.alamat || '-'}</td>
                    <td className="px-4 py-2 text-sm">{ot.no_telp || '-'}</td>
                    <td className="px-4 py-2 text-sm">{formatTanggal(ot.created_at)}</td>
                    <td className="px-4 py-2 text-sm">
                      <button
                        onClick={() => handleDelete(ot.id)}
                        className="text-red-600 hover:underline text-sm"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tambah Akun Orang Tua</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
    </div>
  )
}

export default AdminOrangTua

