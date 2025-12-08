import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { formatTanggal, calculateUmur, sortPenimbangan } from '../../utils/helpers'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

function UserDashboard() {
  const [balitaList, setBalitaList] = useState([])
  const [selectedBalita, setSelectedBalita] = useState(null)
  const [penimbangan, setPenimbangan] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await api.getBalitaByOrangTua()
      if (response.success) {
        const data = response.data || []
        setBalitaList(data)
        if (data.length > 0) {
          handleBalitaChange(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBalitaChange = async (balitaId) => {
    if (!balitaId) {
      setSelectedBalita(null)
      setPenimbangan([])
      return
    }

    const balita = balitaList.find(b => b.id == balitaId)
    if (!balita) return

    setSelectedBalita(balita)

    try {
      const response = await api.getPenimbangan(balitaId)
      if (response.success) {
        const sorted = sortPenimbangan(response.data || [])
        setPenimbangan(sorted)
      }
    } catch (error) {
      console.error('Error loading penimbangan:', error)
    }
  }

  const chartData = {
    labels: penimbangan.map(p => p.bulan_label || p.bulan_code),
    datasets: [
      {
        label: 'Berat (kg)',
        data: penimbangan.map(p => parseFloat(p.berat)),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Berat (kg)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Bulan'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Memuat data...</div>
      </div>
    )
  }

  if (balitaList.length === 0) {
    return (
      <div>
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
            👨‍👩‍👧 Dashboard Orang Tua • Data Lengkap Anak Saya
          </span>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Lengkap Anak Saya</h1>
          <p className="text-gray-600">
            Halaman ini menampilkan data lengkap dan perkembangan anak Anda. Anda hanya dapat melihat data anak Anda sendiri.
          </p>
        </div>
        <div className="card text-center py-8">
          <p className="text-gray-600 mb-2">Belum ada data balita yang terhubung dengan akun Anda.</p>
          <p className="text-sm text-gray-500">
            Silakan hubungi admin untuk menghubungkan data balita dengan akun Anda.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
          👨‍👩‍👧 Dashboard Orang Tua • Data Lengkap Anak Saya
        </span>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Lengkap Anak Saya</h1>
        <p className="text-gray-600">
          Halaman ini menampilkan data lengkap dan perkembangan anak Anda. Anda hanya dapat melihat data anak Anda sendiri.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Select & Biodata */}
        <div className="card">
          <div className="text-lg font-semibold text-gray-800 mb-1">Pilih Anak</div>
          <div className="text-sm text-gray-600 mb-4">
            Pilih anak untuk melihat data lengkap, grafik dan riwayat penimbangan.
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih anak
            </label>
            <select
              className="select"
              value={selectedBalita?.id || ''}
              onChange={(e) => handleBalitaChange(e.target.value)}
            >
              <option value="">-- Pilih Anak --</option>
              {balitaList.map(b => (
                <option key={b.id} value={b.id}>
                  {b.nama_anak}
                </option>
              ))}
            </select>
          </div>

          {/* Biodata */}
          {selectedBalita && (
            <div className="border-t pt-4 space-y-3">
              <div>
                <span className="text-sm text-gray-600">Nama Anak: </span>
                <span className="text-sm font-medium">{selectedBalita.nama_anak || '-'}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Tanggal Lahir: </span>
                <span className="text-sm font-medium">{formatTanggal(selectedBalita.tgl_lahir)}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Umur: </span>
                <span className="text-sm font-medium">{calculateUmur(selectedBalita.tgl_lahir)}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Orang Tua: </span>
                <span className="text-sm font-medium">
                  {selectedBalita.nama_ayah || '-'} / {selectedBalita.nama_ibu || '-'}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-sm font-semibold text-gray-700 mb-2">Data Antropometri Saat Ini</div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-600">Berat Badan (BB): </span>
                    <span className="font-medium">{selectedBalita.bb ? `${selectedBalita.bb} kg` : '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tinggi Badan (TB): </span>
                    <span className="font-medium">{selectedBalita.tb ? `${selectedBalita.tb} cm` : '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Lingkar Lengan (LL): </span>
                    <span className="font-medium">{selectedBalita.ll ? `${selectedBalita.ll} cm` : '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Lingkar Kepala (LK): </span>
                    <span className="font-medium">{selectedBalita.lk ? `${selectedBalita.lk} cm` : '-'}</span>
                  </div>
                </div>
              </div>
              {selectedBalita.pelayanan && (
                <div className="pt-2 border-t">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Pelayanan yang Diberikan</div>
                  <div className="text-sm text-green-600">{selectedBalita.pelayanan}</div>
                </div>
              )}
              {selectedBalita.keterangan && (
                <div className="pt-2 border-t">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Keterangan</div>
                  <div className="text-sm text-gray-600">{selectedBalita.keterangan}</div>
                </div>
              )}
              {penimbangan.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-gray-600">Jumlah catatan penimbangan</div>
                      <div className="font-medium">{penimbangan.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Berat terakhir (kg)</div>
                      <div className="font-medium">{penimbangan[penimbangan.length - 1]?.berat || '-'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Chart & Table */}
        <div className="space-y-6">
          {/* Chart */}
          <div className="card">
            <div className="text-lg font-semibold text-gray-800 mb-1">
              Grafik Batang Perkembangan Berat Badan
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Grafik menampilkan berat badan balita per bulan penimbangan (Januari sampai Desember)
              yang sudah dicatat oleh kader.
            </div>
            <div className="h-64">
              {penimbangan.length > 0 ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Belum ada data penimbangan untuk balita ini.
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <div className="text-sm font-semibold text-gray-700 mb-3">
              Riwayat Penimbangan per Bulan
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bulan</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Berat (kg)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kenaikan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {penimbangan.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        Pilih anak untuk melihat data
                      </td>
                    </tr>
                  ) : (
                    penimbangan.map((p, idx) => {
                      const kenaikan = idx > 0 ? parseFloat(p.berat) - parseFloat(penimbangan[idx - 1].berat) : null
                      return (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm">{idx + 1}</td>
                          <td className="px-4 py-2 text-sm">{p.bulan_label || p.bulan_code}</td>
                          <td className="px-4 py-2 text-sm">{p.berat} kg</td>
                          <td className="px-4 py-2 text-sm">
                            {kenaikan !== null ? (
                              <span className={kenaikan > 0 ? 'text-green-600' : kenaikan < 0 ? 'text-red-600' : 'text-gray-500'}>
                                {kenaikan > 0 ? '+' : ''}{kenaikan.toFixed(2)} kg
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard

