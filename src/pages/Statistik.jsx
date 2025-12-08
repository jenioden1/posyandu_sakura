import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { BULAN_OPTIONS } from '../utils/helpers'

function Statistik() {
  const [stats, setStats] = useState({
    total_balita: 0,
    total_penimbangan: 0
  })
  const [statsByMonth, setStatsByMonth] = useState([])
  const [topBalita, setTopBalita] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Get all balita to calculate stats
      const response = await api.getBalita()
      if (response.success) {
        const data = response.data || []
        setStats({
          total_balita: data.length,
          total_penimbangan: data.reduce((sum, b) => sum + (b.penimbangan?.length || 0), 0)
        })

        // Calculate stats by month
        const monthStats = BULAN_OPTIONS.map(bulan => {
          const count = data.reduce((sum, b) => {
            const penimbangan = b.penimbangan || []
            return sum + penimbangan.filter(p => p.bulan_code === bulan.code).length
          }, 0)
          return {
            label: bulan.label,
            code: bulan.code,
            total: count
          }
        })
        setStatsByMonth(monthStats)

        // Calculate top 10 balita
        const top = data
          .map(b => ({
            nama_anak: b.nama_anak,
            nama_ayah: b.nama_ayah,
            nama_ibu: b.nama_ibu,
            jumlah_penimbangan: (b.penimbangan || []).length
          }))
          .sort((a, b) => b.jumlah_penimbangan - a.jumlah_penimbangan)
          .slice(0, 10)
        setTopBalita(top)
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
      <div className="mb-4">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
          📊 Statistik Posyandu
        </span>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Statistik & Laporan Posyandu</h1>
        <p className="text-gray-600">
          Data statistik dan laporan perkembangan balita di Posyandu Sehat.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Total Balita</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total_balita}</div>
          <div className="text-xs text-gray-500 mt-1">Jumlah balita terdaftar</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Total Penimbangan</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total_penimbangan}</div>
          <div className="text-xs text-gray-500 mt-1">Total catatan penimbangan</div>
        </div>
      </div>

      {/* Statistics by Month */}
      <div className="card mb-6">
        <div className="text-lg font-semibold text-gray-800 mb-4">
          Statistik Penimbangan per Bulan
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bulan</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Penimbangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {statsByMonth.map((stat) => (
                <tr key={stat.code}>
                  <td className="px-4 py-2 text-sm">{stat.label}</td>
                  <td className="px-4 py-2 text-sm">{stat.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 10 Balita */}
      <div className="card">
        <div className="text-lg font-semibold text-gray-800 mb-4">
          Top 10 Balita dengan Penimbangan Terbanyak
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Anak</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orang Tua</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Penimbangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topBalita.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Belum ada data
                  </td>
                </tr>
              ) : (
                topBalita.map((b, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm">{b.nama_anak}</td>
                    <td className="px-4 py-2 text-sm">{b.nama_ayah} / {b.nama_ibu}</td>
                    <td className="px-4 py-2 text-sm">{b.jumlah_penimbangan}</td>
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

export default Statistik

