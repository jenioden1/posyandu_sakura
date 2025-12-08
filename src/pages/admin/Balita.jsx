import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { formatTanggal, BULAN_OPTIONS } from '../../utils/helpers'

function AdminBalita() {
  const [balitaList, setBalitaList] = useState([])
  const [orangTuaList, setOrangTuaList] = useState([])
  const [filterNama, setFilterNama] = useState('')
  const [filterBulan, setFilterBulan] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nama_anak: '',
    tgl_lahir: '',
    bb: '',
    tb: '',
    ll: '',
    lk: '',
    orang_tua_uid: '',
    pelayanan_vit_a: false,
    pelayanan_oralit: false,
    keterangan: ''
  })
  const [penimbangan, setPenimbangan] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [balitaRes, orangTuaRes] = await Promise.all([
        api.adminGetBalita(),
        api.adminGetOrangTua()
      ])

      if (balitaRes.success) {
        setBalitaList(balitaRes.data || [])
      }
      if (orangTuaRes.success) {
        setOrangTuaList(orangTuaRes.data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (balita = null) => {
    if (balita) {
      setEditingId(balita.id)
      setFormData({
        nama_anak: balita.nama_anak || '',
        tgl_lahir: balita.tgl_lahir || '',
        bb: balita.bb || '',
        tb: balita.tb || '',
        ll: balita.ll || '',
        lk: balita.lk || '',
        orang_tua_uid: balita.orang_tua_uid || balita.orang_tua_id || '',
        pelayanan_vit_a: (balita.pelayanan || '').toLowerCase().includes('vitamin a'),
        pelayanan_oralit: (balita.pelayanan || '').toLowerCase().includes('oralit'),
        keterangan: balita.keterangan || ''
      })
      setPenimbangan(Array.isArray(balita.penimbangan) ? [...balita.penimbangan] : [])
    } else {
      setEditingId(null)
      setFormData({
        nama_anak: '',
        tgl_lahir: '',
        bb: '',
        tb: '',
        ll: '',
        lk: '',
        orang_tua_uid: '',
        pelayanan_vit_a: false,
        pelayanan_oralit: false,
        keterangan: ''
      })
      setPenimbangan([])
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.orang_tua_uid) {
      alert('Pilih akun orang tua terlebih dahulu');
      return;
    }

    const rawData = {
      ...(editingId && { id: editingId }),
      nama_anak: formData.nama_anak.trim(),
      tgl_lahir: formData.tgl_lahir,
      bb: formData.bb ? parseFloat(formData.bb) : null,
      tb: formData.tb ? parseFloat(formData.tb) : null,
      ll: formData.ll ? parseFloat(formData.ll) : null,
      lk: formData.lk ? parseFloat(formData.lk) : null,
      pelayanan_vit_a: formData.pelayanan_vit_a,
      pelayanan_oralit: formData.pelayanan_oralit,
      keterangan: formData.keterangan || null,
      penimbangan: penimbangan,
      orang_tua_id: formData.orang_tua_uid,
    }

    try {
      // TODO: Ganti dengan Cloud Functions saat sudah setup Firebase
      // const saveBalita = firebase.functions().httpsCallable('saveBalita');
      // const result = await saveBalita(rawData);
      
      // Sementara masih pakai PHP API (akan diganti dengan Cloud Functions)
      const response = await api.adminSaveBalita(rawData)
      if (response.success) {
        alert('Data berhasil disimpan')
        closeModal()
        loadData()
      } else {
        alert('Gagal menyimpan: ' + (response.message || 'Unknown error'))
      }
    } catch (error) {
      alert('Terjadi kesalahan. Silakan coba lagi.')
      console.error('Save error:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus data balita ini?')) return

    try {
      const response = await api.adminDeleteBalita(id)
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

  const addPenimbangan = () => {
    const bulanCode = document.getElementById('bulanInput')?.value
    const berat = document.getElementById('beratBulanInput')?.value

    if (!bulanCode || !berat) {
      alert('Isi bulan dan berat badan')
      return
    }

    const bulanObj = BULAN_OPTIONS.find(b => b.code === bulanCode)
    if (!bulanObj) return

    const existingIndex = penimbangan.findIndex(p => p.code === bulanCode)
    const entry = { code: bulanObj.code, label: bulanObj.label, berat: parseFloat(berat) }

    if (existingIndex >= 0) {
      const newPenimbangan = [...penimbangan]
      newPenimbangan[existingIndex] = entry
      setPenimbangan(newPenimbangan)
    } else {
      setPenimbangan([...penimbangan, entry])
    }

    document.getElementById('beratBulanInput').value = ''
  }

  const removePenimbangan = (index) => {
    setPenimbangan(penimbangan.filter((_, i) => i !== index))
  }

  const filteredBalita = balitaList.filter(b => {
    if (filterNama) {
      const query = filterNama.toLowerCase()
      if (!(b.nama_anak || '').toLowerCase().includes(query) &&
          !(b.nama_ayah || '').toLowerCase().includes(query) &&
          !(b.nama_ibu || '').toLowerCase().includes(query)) {
        return false
      }
    }
    if (filterBulan) {
      const hasMonth = (b.penimbangan || []).some(p => p.code === filterBulan)
      if (!hasMonth) return false
    }
    return true
  })

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
          <h1 className="text-2xl font-bold text-gray-800">Data Balita</h1>
          <p className="text-gray-600 mt-1">Kelola data balita dan penimbangan</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          + Tambah Data Balita
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Nama</label>
            <input
              type="text"
              value={filterNama}
              onChange={(e) => setFilterNama(e.target.value)}
              className="input"
              placeholder="Cari nama anak, ayah, atau ibu..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Bulan</label>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="select"
            >
              <option value="">Semua Bulan</option>
              {BULAN_OPTIONS.map(b => (
                <option key={b.code} value={b.code}>{b.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Anak</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orang Tua</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tgl Lahir</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">BB</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">TB</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Penimbangan</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pelayanan</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBalita.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Belum ada data balita
                  </td>
                </tr>
              ) : (
                filteredBalita.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-2 text-sm">{b.nama_anak}</td>
                    <td className="px-4 py-2 text-sm">{b.nama_ayah} / {b.nama_ibu}</td>
                    <td className="px-4 py-2 text-sm">{formatTanggal(b.tgl_lahir)}</td>
                    <td className="px-4 py-2 text-sm">{b.bb || '-'}</td>
                    <td className="px-4 py-2 text-sm">{b.tb || '-'}</td>
                    <td className="px-4 py-2 text-sm">
                      {(b.penimbangan || []).map(p => `${p.code}: ${p.berat}`).join(' | ') || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm">{b.pelayanan || '-'}</td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(b)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Hapus
                        </button>
                      </div>
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Edit Data Balita' : 'Tambah Data Balita'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Anak *</label>
                  <input
                    type="text"
                    value={formData.nama_anak}
                    onChange={(e) => setFormData({...formData, nama_anak: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    value={formData.tgl_lahir}
                    onChange={(e) => setFormData({...formData, tgl_lahir: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bb}
                    onChange={(e) => setFormData({...formData, bb: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.tb}
                    onChange={(e) => setFormData({...formData, tb: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lingkar Lengan (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.ll}
                    onChange={(e) => setFormData({...formData, ll: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lingkar Kepala (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.lk}
                    onChange={(e) => setFormData({...formData, lk: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Akun Orang Tua *</label>
                  <select
                    value={formData.orang_tua_uid}
                    onChange={(e) => setFormData({...formData, orang_tua_uid: e.target.value})}
                    className="select"
                    required
                  >
                    <option value="">-- Pilih Orang Tua --</option>
                    {orangTuaList.map(ot => (
                      <option key={ot.id} value={ot.id}>
                        {ot.nama_ayah} / {ot.nama_ibu} ({ot.username})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Nama ayah dan ibu akan diambil dari akun yang dipilih</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pelayanan</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.pelayanan_vit_a}
                      onChange={(e) => setFormData({...formData, pelayanan_vit_a: e.target.checked})}
                      className="mr-2"
                    />
                    Vitamin A
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.pelayanan_oralit}
                      onChange={(e) => setFormData({...formData, pelayanan_oralit: e.target.checked})}
                      className="mr-2"
                    />
                    Oralit
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                  className="input"
                  rows="3"
                />
              </div>

              {/* Penimbangan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Penimbangan per Bulan</label>
                <div className="flex gap-2 mb-2">
                  <select id="bulanInput" className="select flex-1">
                    <option value="">Pilih Bulan</option>
                    {BULAN_OPTIONS.map(b => (
                      <option key={b.code} value={b.code}>{b.label}</option>
                    ))}
                  </select>
                  <input
                    id="beratBulanInput"
                    type="number"
                    step="0.1"
                    placeholder="Berat (kg)"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={addPenimbangan}
                    className="btn btn-secondary"
                  >
                    Tambah
                  </button>
                </div>
                {penimbangan.length > 0 && (
                  <div className="border rounded-lg p-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left px-2 py-1">Bulan</th>
                          <th className="text-left px-2 py-1">Berat</th>
                          <th className="text-left px-2 py-1">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {penimbangan.map((p, idx) => (
                          <tr key={idx}>
                            <td className="px-2 py-1">{p.label || p.code}</td>
                            <td className="px-2 py-1">{p.berat} kg</td>
                            <td className="px-2 py-1">
                              <button
                                type="button"
                                onClick={() => removePenimbangan(idx)}
                                className="text-red-600 hover:underline text-xs"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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

export default AdminBalita

