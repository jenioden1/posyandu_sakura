import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../utils/api'
import { formatTanggal } from '../../utils/helpers'

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_balita: 0,
    total_vit_a: 0,
    total_oralit: 0,
    total_orang_tua: 0
  })
  const [recentBalita, setRecentBalita] = useState([])
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
        const data = balitaRes.data || []
        setStats({
          total_balita: data.length,
          total_vit_a: data.filter(b => (b.pelayanan || '').toLowerCase().includes('vitamin a')).length,
          total_oralit: data.filter(b => (b.pelayanan || '').toLowerCase().includes('oralit')).length,
          total_orang_tua: orangTuaRes.success ? (orangTuaRes.data || []).length : 0
        })

        // Get recent 5 balita
        const recent = [...data]
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
          .slice(0, 5)
        setRecentBalita(recent)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
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
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview data dan statistik Posyandu</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => loadData()} className="btn btn-outline">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Total Balita</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total_balita}</div>
          <div className="text-xs text-gray-500 mt-1">Jumlah balita yang terdaftar</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Balita dengan Vitamin A</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total_vit_a}</div>
          <div className="text-xs text-gray-500 mt-1">Setidaknya sekali menerima Vitamin A</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Balita dengan Oralit</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total_oralit}</div>
          <div className="text-xs text-gray-500 mt-1">Setidaknya sekali menerima Oralit</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Total Akun Orang Tua</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total_orang_tua}</div>
          <div className="text-xs text-gray-500 mt-1">Akun orang tua yang terdaftar</div>
        </div>
      </div>

      {/* Recent Balita */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Data Balita Terbaru</h2>
          <Link to="/admin/balita" className="btn btn-primary">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Anak</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orang Tua</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tgl Lahir</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">BB (kg)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">TB (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentBalita.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Belum ada data balita
                  </td>
                </tr>
              ) : (
                recentBalita.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-2 text-sm">{b.nama_anak}</td>
                    <td className="px-4 py-2 text-sm">{b.nama_ayah} / {b.nama_ibu}</td>
                    <td className="px-4 py-2 text-sm">{formatTanggal(b.tgl_lahir)}</td>
                    <td className="px-4 py-2 text-sm">{b.bb || '-'}</td>
                    <td className="px-4 py-2 text-sm">{b.tb || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

