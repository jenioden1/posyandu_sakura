import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../utils/api'
import { formatTanggal, calculateUmur, sortPenimbangan } from '../../utils/helpers'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

function UserDashboard() {
  const { user } = useAuth()
  const [balitaList, setBalitaList] = useState([])
  const [selectedBalita, setSelectedBalita] = useState(null)
  const [penimbangan, setPenimbangan] = useState([])
  const [pemeriksaan, setPemeriksaan] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  // Helper function untuk mendapatkan status badge yang konsisten dengan standar WHO
  const getStatusBadge = (status) => {
    if (!status || status === '-' || status === 'PENDING') {
      return <span className="badge badge-warning badge-sm">PENDING</span>
    }
    
    const statusLower = (status || '').toLowerCase()
    const statusText = status || '-'
    
    // Standar WHO: Stunting, Gizi Buruk, Gizi Kurang, Normal, Overweight, Obesitas, Tinggi
    // Stunting atau Gizi Buruk (merah)
    if (statusLower.includes('stunting') || statusLower.includes('buruk')) {
      return <span className="badge badge-error badge-sm">{statusText}</span>
    }
    // Gizi Kurang atau Wasting (kuning)
    else if (statusLower.includes('kurang') || statusLower.includes('wasting') || statusLower.includes('underweight')) {
      return <span className="badge badge-warning badge-sm">{statusText}</span>
    }
    // Normal (hijau) - hanya "normal", tidak ada "baik" atau "sehat"
    else if (statusLower.includes('normal')) {
      return <span className="badge badge-success badge-sm">{statusText}</span>
    }
    // Overweight atau Obesitas (kuning)
    else if (statusLower.includes('overweight') || statusLower.includes('obesitas') || statusLower.includes('obese')) {
      return <span className="badge badge-warning badge-sm">{statusText}</span>
    }
    // Tinggi (biru)
    else if (statusLower.includes('tinggi') || statusLower.includes('tall')) {
      return <span className="badge badge-info badge-sm">{statusText}</span>
    }
    // Default (abu-abu)
    else {
      return <span className="badge badge-ghost badge-sm">{statusText}</span>
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await api.getBalitaByOrangTua()
      console.log('getBalitaByOrangTua response:', response)
      
      if (response.success) {
        const data = response.data || []
        console.log('Balita data loaded:', data)
        setBalitaList(data)
        if (data.length > 0) {
          handleBalitaChange(data[0].id)
        }
      } else {
        console.error('Failed to load balita data:', response.message)
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
      setPemeriksaan([])
      return
    }

    // Find balita from current list or wait for it
    const balita = balitaList.find(b => b.id == balitaId)
    if (!balita) {
      console.warn('Balita not found in list:', balitaId)
      return
    }

    setSelectedBalita(balita)
    // Reset pemeriksaan dan penimbangan saat ganti balita
    setPemeriksaan([])
    setPenimbangan([])

    try {
      // Load pemeriksaan (data lengkap untuk chart dan tabel) - PRIORITAS UTAMA
      const pemeriksaanRes = await api.getPemeriksaanByBalita(balitaId)
      console.log('Pemeriksaan response:', pemeriksaanRes)
      
      if (pemeriksaanRes.success) {
        const pemeriksaanData = pemeriksaanRes.data || []
        console.log(`Loaded ${pemeriksaanData.length} pemeriksaan records for balita ${balitaId}`)
        
        // Normalize dan sort by tanggal pengukuran (terbaru dulu)
        const sorted = pemeriksaanData
          .map(p => ({
            ...p,
            // Normalize field names
            berat: p.berat || p.bb || null,
            tinggi: p.tinggi || p.tb || null,
            lila: p.lila || p.ll || null,
            lingkar_kepala: p.lingkar_kepala || p.lk || null,
            // Normalize dates
            tgl_ukur: p.tgl_ukur || p.created_at || null,
          }))
          .sort((a, b) => {
            const dateA = new Date(a.tgl_ukur || a.created_at || 0)
            const dateB = new Date(b.tgl_ukur || b.created_at || 0)
            return dateB - dateA
          })
        
        console.log('Sorted pemeriksaan:', sorted)
        setPemeriksaan(sorted)
      } else {
        console.error('Failed to load pemeriksaan:', pemeriksaanRes.message)
        setPemeriksaan([])
      }

      // Load penimbangan (legacy) - sebagai fallback
      try {
        const penimbanganRes = await api.getPenimbangan(balitaId)
        if (penimbanganRes.success) {
          const sorted = sortPenimbangan(penimbanganRes.data || [])
          setPenimbangan(sorted)
        }
      } catch (penimbanganError) {
        console.warn('Error loading penimbangan (legacy):', penimbanganError)
        // Tidak critical, bisa diabaikan
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setPemeriksaan([])
      setPenimbangan([])
    }
  }

  // Chart data dari pemeriksaan (lebih lengkap)
  // Pastikan semua data pemeriksaan ditampilkan, tidak ada filter atau limit
  // Urutkan dari terlama ke terbaru untuk chart (chronological order)
  const sortedPemeriksaanForChart = [...pemeriksaan].sort((a, b) => {
    const dateA = new Date(a.tgl_ukur || a.created_at || 0)
    const dateB = new Date(b.tgl_ukur || b.created_at || 0)
    return dateA - dateB // Terlama ke terbaru untuk chart
  })

  const chartDataBB = {
    labels: pemeriksaan.length > 0 
      ? sortedPemeriksaanForChart.map(p => formatTanggal(p.tgl_ukur || p.created_at))
      : penimbangan.map(p => p.bulan_label || p.bulan_code),
    datasets: [
      {
        label: 'Berat Badan (kg)',
        data: pemeriksaan.length > 0
          ? sortedPemeriksaanForChart.map(p => {
              const berat = parseFloat(p.berat || p.bb || 0);
              return berat > 0 ? berat : null;
            })
          : penimbangan.map(p => parseFloat(p.berat || 0)),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const chartDataTB = {
    labels: pemeriksaan.length > 0 
      ? sortedPemeriksaanForChart.map(p => formatTanggal(p.tgl_ukur || p.created_at))
      : [],
    datasets: [
      {
        label: 'Tinggi Badan (cm)',
        data: pemeriksaan.length > 0
          ? sortedPemeriksaanForChart.map(p => {
              const tinggi = parseFloat(p.tinggi || p.tb || 0);
              return tinggi > 0 ? tinggi : null;
            })
          : [],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
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
          text: 'Nilai'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tanggal Pemeriksaan'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
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

  if (!loading && balitaList.length === 0) {
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
          <p className="text-sm text-gray-500 mb-4">
            Silakan hubungi admin untuk menghubungkan data balita dengan akun Anda.
          </p>
          <div className="text-xs text-gray-400 mt-4">
            <p>Tips: Pastikan admin telah memilih akun orang tua Anda saat menambahkan data balita.</p>
            <p>Relasi dibuat melalui field "orang_tua_uid" di data balita.</p>
          </div>
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
              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <div className="text-sm font-semibold text-gray-800 mb-2">📋 Data Lengkap Anak</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama Anak:</span>
                    <span className="font-medium text-gray-800">{selectedBalita.nama_anak || '-'}</span>
                  </div>
                  {selectedBalita.nik && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">NIK:</span>
                      <span className="font-medium text-gray-800">{selectedBalita.nik}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jenis Kelamin:</span>
                    <span className="font-medium text-gray-800">
                      {selectedBalita.jenis_kelamin === 'L' ? '👦 Laki-laki' : '👧 Perempuan'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal Lahir:</span>
                    <span className="font-medium text-gray-800">{formatTanggal(selectedBalita.tgl_lahir)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Umur:</span>
                    <span className="font-medium text-gray-800">{calculateUmur(selectedBalita.tgl_lahir)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Orang Tua:</span>
                    <span className="font-medium text-gray-800">
                      {selectedBalita.nama_ayah || '-'} / {selectedBalita.nama_ibu || '-'}
                    </span>
                  </div>
                  {selectedBalita.alamat && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alamat:</span>
                      <span className="font-medium text-gray-800 text-right max-w-[60%]">
                        {selectedBalita.alamat}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-sm font-semibold text-gray-700 mb-2">Data Antropometri Terbaru</div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-600">Berat Badan (BB): </span>
                    <span className="font-medium">
                      {pemeriksaan.length > 0 && (pemeriksaan[0].berat || pemeriksaan[0].bb)
                        ? `${pemeriksaan[0].berat || pemeriksaan[0].bb} kg` 
                        : (selectedBalita.bb || selectedBalita.bb_latest) ? `${selectedBalita.bb || selectedBalita.bb_latest} kg` : '-'}
                    </span>
                    {pemeriksaan.length > 0 && (pemeriksaan[0].berat || pemeriksaan[0].bb) && (
                      <span className="text-xs text-green-600 ml-2" title="Data dari pemeriksaan terbaru">●</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-600">Tinggi Badan (TB): </span>
                    <span className="font-medium">
                      {pemeriksaan.length > 0 && (pemeriksaan[0].tinggi || pemeriksaan[0].tb)
                        ? `${pemeriksaan[0].tinggi || pemeriksaan[0].tb} cm` 
                        : (selectedBalita.tb || selectedBalita.tb_latest) ? `${selectedBalita.tb || selectedBalita.tb_latest} cm` : '-'}
                    </span>
                    {pemeriksaan.length > 0 && (pemeriksaan[0].tinggi || pemeriksaan[0].tb) && (
                      <span className="text-xs text-green-600 ml-2" title="Data dari pemeriksaan terbaru">●</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-600">Lingkar Lengan (LL): </span>
                    <span className="font-medium">
                      {pemeriksaan.length > 0 && (pemeriksaan[0].lila || pemeriksaan[0].ll)
                        ? `${pemeriksaan[0].lila || pemeriksaan[0].ll} cm` 
                        : (selectedBalita.ll || selectedBalita.ll_latest) ? `${selectedBalita.ll || selectedBalita.ll_latest} cm` : '-'}
                    </span>
                    {pemeriksaan.length > 0 && (pemeriksaan[0].lila || pemeriksaan[0].ll) && (
                      <span className="text-xs text-green-600 ml-2" title="Data dari pemeriksaan terbaru">●</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-600">Lingkar Kepala (LK): </span>
                    <span className="font-medium">
                      {pemeriksaan.length > 0 && (pemeriksaan[0].lingkar_kepala || pemeriksaan[0].lk)
                        ? `${pemeriksaan[0].lingkar_kepala || pemeriksaan[0].lk} cm` 
                        : (selectedBalita.lk || selectedBalita.lk_latest) ? `${selectedBalita.lk || selectedBalita.lk_latest} cm` : '-'}
                    </span>
                    {pemeriksaan.length > 0 && (pemeriksaan[0].lingkar_kepala || pemeriksaan[0].lk) && (
                      <span className="text-xs text-green-600 ml-2" title="Data dari pemeriksaan terbaru">●</span>
                    )}
                  </div>
                </div>
                {pemeriksaan.length > 0 && (pemeriksaan[0].status_gizi_hasil_compute || pemeriksaan[0].status_gizi) && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-gray-600 text-sm">Status Gizi: </span>
                    {getStatusBadge(pemeriksaan[0].status_gizi_hasil_compute || pemeriksaan[0].status_gizi)}
                  </div>
                )}
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
              <div className="pt-2 border-t">
                <div className="text-sm font-semibold text-gray-700 mb-2">📊 Statistik Pemeriksaan</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-gray-600">Total Pemeriksaan</div>
                    <div className="font-medium text-lg text-blue-600">{pemeriksaan.length}</div>
                  </div>
                  {pemeriksaan.length > 0 ? (
                    <>
                      <div>
                        <div className="text-gray-600">Pemeriksaan Terakhir</div>
                        <div className="font-medium text-xs text-gray-800">
                          {formatTanggal(pemeriksaan[0].tgl_ukur || pemeriksaan[0].created_at)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Status Gizi Terakhir</div>
                        <div className="inline-block">
                          {getStatusBadge(pemeriksaan[0].status_gizi_hasil_compute || pemeriksaan[0].status_gizi || '-')}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-gray-600">Pemeriksaan Terakhir</div>
                        <div className="font-medium text-xs text-gray-400">-</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Status Gizi Terakhir</div>
                        <div className="font-medium text-xs text-gray-400">-</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Chart & Table */}
        <div className="space-y-6">
          {/* Chart Berat Badan */}
          <div className="card">
            <div className="text-lg font-semibold text-gray-800 mb-1">
              📈 Grafik Perkembangan Berat Badan
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Grafik perkembangan berat badan anak berdasarkan data pemeriksaan bulanan.
            </div>
            <div className="h-64">
              {pemeriksaan.length > 0 || penimbangan.length > 0 ? (
                <Line data={chartDataBB} options={chartOptions} />
              ) : selectedBalita ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="text-lg mb-2">📊</div>
                  <div>Belum ada data pemeriksaan untuk balita ini.</div>
                  <div className="text-xs mt-2 text-gray-400">
                    Data akan muncul setelah admin melakukan pemeriksaan.
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Pilih anak untuk melihat grafik perkembangan.
                </div>
              )}
            </div>
          </div>

          {/* Chart Tinggi Badan */}
          {pemeriksaan.length > 0 && (
            <div className="card">
              <div className="text-lg font-semibold text-gray-800 mb-1">
                📏 Grafik Perkembangan Tinggi Badan
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Grafik perkembangan tinggi badan anak berdasarkan data pemeriksaan bulanan.
              </div>
              <div className="h-64">
                {pemeriksaan.length > 0 ? (
                  <Line data={chartDataTB} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Belum ada data tinggi badan.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Table Riwayat Pemeriksaan */}
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-semibold text-gray-700">
                📋 Riwayat Pemeriksaan Lengkap
              </div>
              <div className="text-xs text-gray-500">
                Total: {pemeriksaan.length} pemeriksaan
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">BB (kg)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">TB (cm)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">LL (cm)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">LK (cm)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status Gizi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pemeriksaan.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        {selectedBalita ? 'Belum ada data pemeriksaan' : 'Pilih anak untuk melihat data'}
                      </td>
                    </tr>
                  ) : (
                    pemeriksaan.map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td className="px-4 py-2 text-sm">{idx + 1}</td>
                        <td className="px-4 py-2 text-sm">{formatTanggal(p.tgl_ukur || p.created_at)}</td>
                        <td className="px-4 py-2 text-sm">
                          {p.berat ? `${p.berat} kg` : 
                           p.bb ? `${p.bb} kg` : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {p.tinggi ? `${p.tinggi} cm` : 
                           p.tb ? `${p.tb} cm` : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {p.lila ? `${p.lila} cm` : 
                           p.ll ? `${p.ll} cm` : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {p.lingkar_kepala ? `${p.lingkar_kepala} cm` : 
                           p.lk ? `${p.lk} cm` : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {getStatusBadge(p.status_gizi_hasil_compute || p.status_gizi || '-')}
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
    </div>
  )
}

export default UserDashboard


