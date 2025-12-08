import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { formatTanggal } from '../../utils/helpers'
import { useToastContext } from '../../contexts/ToastContext'
import * as XLSX from 'xlsx'

function AdminLaporan() {
  const [loading, setLoading] = useState(true)
  const [balitaList, setBalitaList] = useState([])
  const [pemeriksaanList, setPemeriksaanList] = useState([])
  const [orangTuaList, setOrangTuaList] = useState([])
  const [filterDate, setFilterDate] = useState({
    start: '',
    end: ''
  })
  const [reportType, setReportType] = useState('semua') // semua, balita, pemeriksaan, statistik
  const { success, error } = useToastContext()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [balitaRes, orangTuaRes] = await Promise.all([
        api.adminGetBalita(),
        api.adminGetOrangTua()
      ])

      if (balitaRes.success) {
        setBalitaList(balitaRes.data || [])
        
        // Load pemeriksaan untuk semua balita
        const allPemeriksaan = []
        for (const balita of balitaRes.data || []) {
          try {
            const pemeriksaanRes = await api.getPemeriksaanByBalita(balita.id)
            if (pemeriksaanRes.success && pemeriksaanRes.data) {
              allPemeriksaan.push(...pemeriksaanRes.data.map(p => ({
                ...p,
                balita_nama: balita.nama_anak || balita.nama,
                balita_nik: balita.nik,
                orang_tua: balita.nama_ortu || `${balita.nama_ayah || ''} / ${balita.nama_ibu || ''}`.trim()
              })))
            }
          } catch (e) {
            console.warn('Error loading pemeriksaan for balita:', balita.id, e)
          }
        }
        setPemeriksaanList(allPemeriksaan)
      }

      if (orangTuaRes.success) {
        setOrangTuaList(orangTuaRes.data || [])
      }
    } catch (err) {
      console.error('Error loading data:', err)
      error('Gagal memuat data laporan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // Helper untuk parse tanggal dari Firestore
  const parseDate = (dateValue) => {
    if (!dateValue) return null
    
    try {
      // Jika Firestore Timestamp
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate()
      }
      
      // Jika string ISO atau format lain (YYYY-MM-DD atau ISO string)
      if (typeof dateValue === 'string') {
        // Handle format YYYY-MM-DD (dari input date)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          const parsed = new Date(dateValue + 'T00:00:00')
          if (!isNaN(parsed.getTime())) {
            return parsed
          }
        }
        // Handle ISO string atau format lain
        const parsed = new Date(dateValue)
        if (!isNaN(parsed.getTime())) {
          return parsed
        }
      }
      
      // Jika sudah Date object
      if (dateValue instanceof Date) {
        if (!isNaN(dateValue.getTime())) {
          return dateValue
        }
      }
    } catch (e) {
      console.warn('Error parsing date:', dateValue, e)
    }
    
    return null
  }

  // Helper untuk mendapatkan tanggal pemeriksaan (prioritas: tgl_ukur > created_at)
  const getPemeriksaanDate = (p) => {
    return parseDate(p.tgl_ukur) || parseDate(p.created_at)
  }

  // Filter data berdasarkan tanggal
  const getFilteredData = () => {
    let filteredPemeriksaan = [...pemeriksaanList]
    let filteredBalita = [...balitaList]

    // Jika ada filter tanggal, terapkan filter
    if (filterDate.start || filterDate.end) {
      // Filter pemeriksaan berdasarkan tanggal
      filteredPemeriksaan = filteredPemeriksaan.filter(p => {
        const tgl = getPemeriksaanDate(p)
        
        // Jika tidak ada tanggal yang bisa di-parse, exclude data ini
        if (!tgl) {
          return false
        }
        
        // Normalize tanggal ke waktu 00:00:00 untuk perbandingan yang akurat
        const tglNormalized = new Date(tgl.getFullYear(), tgl.getMonth(), tgl.getDate())
        
        // Filter start date (jika diisi)
        if (filterDate.start) {
          const startDate = new Date(filterDate.start)
          startDate.setHours(0, 0, 0, 0)
          const startNormalized = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
          
          // Jika tanggal pemeriksaan lebih kecil dari start date, exclude
          if (tglNormalized < startNormalized) {
            return false
          }
        }
        
        // Filter end date (jika diisi)
        if (filterDate.end) {
          const endDate = new Date(filterDate.end)
          endDate.setHours(23, 59, 59, 999)
          const endNormalized = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
          
          // Jika tanggal pemeriksaan lebih besar dari end date, exclude
          if (tglNormalized > endNormalized) {
            return false
          }
        }
        
        // Jika semua kondisi terpenuhi, include data ini
        return true
      })

      // Filter balita: hanya tampilkan balita yang memiliki pemeriksaan dalam rentang tanggal
      const balitaIdsWithPemeriksaan = new Set(filteredPemeriksaan.map(p => p.balita_id).filter(id => id))
      filteredBalita = filteredBalita.filter(b => balitaIdsWithPemeriksaan.has(b.id))
    }

    return { filteredPemeriksaan, filteredBalita }
  }

  // Hitung statistik
  const calculateStats = () => {
    const { filteredPemeriksaan, filteredBalita } = getFilteredData()
    
    const stats = {
      total_balita: filteredBalita.length,
      total_pemeriksaan: filteredPemeriksaan.length,
      total_orang_tua: orangTuaList.length,
      normal: filteredPemeriksaan.filter(p => {
        const status = (p.status_gizi || '').toLowerCase()
        const statusCompute = (p.status_gizi_hasil_compute || '').toLowerCase()
        const statusTBU = (p.status_gizi_tb_u || '').toLowerCase()
        const statusBBU = (p.status_gizi_bb_u || '').toLowerCase()
        
        return status === 'normal' ||
          statusCompute.includes('normal') ||
          statusTBU === 'normal' ||
          statusBBU === 'normal' ||
          p.kategori_tb_u === 'NORMAL' || 
          p.kategori_bb_u === 'NORMAL'
      }).length,
      stunting: filteredPemeriksaan.filter(p => {
        const status = (p.status_gizi || '').toLowerCase()
        const statusCompute = (p.status_gizi_hasil_compute || '').toLowerCase()
        const statusTBU = (p.status_gizi_tb_u || '').toLowerCase()
        
        return status.includes('stunting') ||
          statusCompute.includes('stunting') || 
          statusCompute.includes('pendek') ||
          statusTBU.includes('stunting') ||
          statusTBU.includes('pendek') ||
          p.kategori_tb_u === 'STUNTING' ||
          p.kategori_tb_u === 'SEVERE_STUNTING'
      }).length,
      wasting: filteredPemeriksaan.filter(p => {
        const status = (p.status_gizi || '').toLowerCase()
        const statusCompute = (p.status_gizi_hasil_compute || '').toLowerCase()
        const statusBBU = (p.status_gizi_bb_u || '').toLowerCase()
        
        return status.includes('gizi kurang') ||
          status.includes('gizi buruk') ||
          statusCompute.includes('wasting') || 
          statusCompute.includes('gizi kurang') ||
          statusCompute.includes('gizi buruk') ||
          statusBBU.includes('gizi kurang') ||
          statusBBU.includes('gizi buruk') ||
          p.kategori_bb_u === 'WASTING' ||
          p.kategori_bb_u === 'SEVERE_WASTING' ||
          p.kategori_bb_u === 'UNDERWEIGHT' ||
          p.kategori_bb_u === 'SEVERE_UNDERWEIGHT'
      }).length,
      overweight: filteredPemeriksaan.filter(p => {
        const status = (p.status_gizi || '').toLowerCase()
        const statusCompute = (p.status_gizi_hasil_compute || '').toLowerCase()
        const statusBBU = (p.status_gizi_bb_u || '').toLowerCase()
        
        return status.includes('obesitas') ||
          status.includes('gizi lebih') ||
          statusCompute.includes('overweight') || 
          statusCompute.includes('obesitas') ||
          statusCompute.includes('gizi lebih') ||
          statusBBU.includes('obesitas') ||
          statusBBU.includes('gizi lebih') ||
          p.kategori_bb_u === 'OVERWEIGHT' ||
          p.kategori_bb_u === 'OBESITAS' ||
          p.kategori_bb_u === 'OVERWEIGHT' ||
          p.kategori_bb_u === 'OBESE'
      }).length
    }

    return stats
  }

  // Export ke Excel
  const exportToExcel = () => {
    try {
      const { filteredPemeriksaan, filteredBalita } = getFilteredData()
      const stats = calculateStats()
      
      const workbook = XLSX.utils.book_new()
      
      // Sheet 1: Statistik
      const statsData = [
        ['LAPORAN POSYANDU SAKURA'],
        ['Tanggal Export:', new Date().toLocaleDateString('id-ID')],
        [''],
        ['STATISTIK UMUM'],
        ['Total Balita', stats.total_balita],
        ['Total Pemeriksaan', stats.total_pemeriksaan],
        ['Total Orang Tua', stats.total_orang_tua],
        [''],
        ['STATISTIK STATUS GIZI'],
        ['Normal', stats.normal],
        ['Stunting', stats.stunting],
        ['Wasting', stats.wasting],
        ['Overweight', stats.overweight]
      ]
      
      const statsSheet = XLSX.utils.aoa_to_sheet(statsData)
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistik')

      // Sheet 2: Data Balita
      const balitaData = filteredBalita.map((b, idx) => ({
        'No': idx + 1,
        'Nama Anak': b.nama_anak || b.nama || '-',
        'NIK': b.nik || '-',
        'Jenis Kelamin': b.jenis_kelamin === 'L' ? 'Laki-laki' : b.jenis_kelamin === 'P' ? 'Perempuan' : '-',
        'Tanggal Lahir': b.tgl_lahir || b.tanggal_lahir ? formatTanggal(b.tgl_lahir || b.tanggal_lahir) : '-',
        'Orang Tua': b.nama_ortu || `${b.nama_ayah || ''} / ${b.nama_ibu || ''}`.trim() || '-',
        'Alamat': b.alamat || '-',
        'BB Terakhir (kg)': b.bb_latest || b.bb || '-',
        'TB Terakhir (cm)': b.tb_latest || b.tb || '-',
        'LL Terakhir (cm)': b.ll_latest || b.ll || '-',
        'LK Terakhir (cm)': b.lk_latest || b.lk || '-'
      }))
      
      const balitaSheet = XLSX.utils.json_to_sheet(balitaData)
      XLSX.utils.book_append_sheet(workbook, balitaSheet, 'Data Balita')

      // Sheet 3: Data Pemeriksaan
      const pemeriksaanData = filteredPemeriksaan.map((p, idx) => ({
        'No': idx + 1,
        'Tanggal Pemeriksaan': p.tgl_ukur ? formatTanggal(p.tgl_ukur) : formatTanggal(p.created_at) || '-',
        'Nama Anak': p.balita_nama || '-',
        'NIK': p.balita_nik || '-',
        'Orang Tua': p.orang_tua || '-',
        'Berat Badan (kg)': p.berat || p.bb || '-',
        'Tinggi Badan (cm)': p.tinggi || p.tb || '-',
        'LILA (cm)': p.lila || p.ll || '-',
        'Lingkar Kepala (cm)': p.lingkar_kepala || p.lk || '-',
        'Umur Bulan': p.umur_bulan || '-',
        'Z-Score TB/U': p.z_score_tb_u || '-',
        'Status Gizi TB/U': p.status_gizi_tb_u || '-',
        'Kategori TB/U': p.kategori_tb_u || '-',
        'Z-Score BB/U': p.z_score_bb_u || '-',
        'Status Gizi BB/U': p.status_gizi_bb_u || '-',
        'Kategori BB/U': p.kategori_bb_u || '-',
        'Status Gizi Hasil': p.status_gizi_hasil_compute || p.status_gizi || '-'
      }))
      
      const pemeriksaanSheet = XLSX.utils.json_to_sheet(pemeriksaanData)
      XLSX.utils.book_append_sheet(workbook, pemeriksaanSheet, 'Data Pemeriksaan')

      // Sheet 4: Data Orang Tua
      const orangTuaData = orangTuaList.map((ot, idx) => ({
        'No': idx + 1,
        'Username/Email': ot.username || '-',
        'Nama Ayah': ot.nama_ayah || '-',
        'Nama Ibu': ot.nama_ibu || '-',
        'Alamat': ot.alamat || '-',
        'No. Telp': ot.no_telp || '-',
        'Tanggal Dibuat': ot.created_at ? formatTanggal(ot.created_at) : '-'
      }))
      
      const orangTuaSheet = XLSX.utils.json_to_sheet(orangTuaData)
      XLSX.utils.book_append_sheet(workbook, orangTuaSheet, 'Data Orang Tua')

      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `Laporan_Posyandu_Sakura_${dateStr}.xlsx`

      // Download
      XLSX.writeFile(workbook, filename)
      success('Laporan berhasil diekspor ke Excel!')
    } catch (err) {
      console.error('Error exporting to Excel:', err)
      error('Gagal mengekspor laporan. Silakan coba lagi.')
    }
  }

  const stats = calculateStats()
  const { filteredPemeriksaan, filteredBalita } = getFilteredData()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Memuat data laporan...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan Posyandu</h1>
          <p className="text-gray-600 mt-1">Laporan lengkap data balita, pemeriksaan, dan statistik</p>
        </div>
        <button
          onClick={exportToExcel}
          className="btn btn-primary w-full sm:w-auto"
        >
          📊 Export ke Excel
        </button>
      </div>

      {/* Filter */}
      <div className="card bg-white shadow-md border border-gray-200 mb-6">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Filter Laporan</h2>
            {(filterDate.start || filterDate.end) && (
              <span className="badge badge-info badge-sm">
                Filter Aktif
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={filterDate.start}
                onChange={(e) => setFilterDate({ ...filterDate, start: e.target.value })}
                className="input input-bordered w-full"
                max={filterDate.end || undefined}
              />
              {filterDate.start && (
                <p className="text-xs text-gray-500 mt-1">
                  Dari: {formatTanggal(filterDate.start)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={filterDate.end}
                onChange={(e) => setFilterDate({ ...filterDate, end: e.target.value })}
                className="input input-bordered w-full"
                min={filterDate.start || undefined}
              />
              {filterDate.end && (
                <p className="text-xs text-gray-500 mt-1">
                  Sampai: {formatTanggal(filterDate.end)}
                </p>
              )}
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilterDate({ start: '', end: '' })}
                className="btn btn-outline w-full"
                disabled={!filterDate.start && !filterDate.end}
              >
                🔄 Reset
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  const { filteredPemeriksaan, filteredBalita } = getFilteredData()
                  if (filteredPemeriksaan.length > 0) {
                    success(`✅ Filter diterapkan: ${filteredPemeriksaan.length} pemeriksaan, ${filteredBalita.length} balita ditampilkan`)
                  } else {
                    error('⚠️ Tidak ada data dalam rentang tanggal ini. Coba ubah rentang tanggal.')
                  }
                }}
                className="btn btn-primary w-full"
                disabled={!filterDate.start && !filterDate.end}
                title="Klik untuk menerapkan filter (filter juga bekerja realtime saat mengubah tanggal)"
              >
                ✅ Terapkan Filter
              </button>
            </div>
          </div>
          {(filterDate.start || filterDate.end) && (() => {
            const { filteredPemeriksaan: currentFilteredPemeriksaan, filteredBalita: currentFilteredBalita } = getFilteredData()
            return (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700 font-semibold mb-2">
                  📊 Info Filter Aktif (Realtime)
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Pemeriksaan:</strong> {currentFilteredPemeriksaan.length} dari {pemeriksaanList.length} total</li>
                  <li>• <strong>Balita:</strong> {currentFilteredBalita.length} dari {balitaList.length} total 
                    <span className="text-xs text-gray-500"> (hanya yang memiliki pemeriksaan dalam rentang tanggal)</span>
                  </li>
                  {filterDate.start && filterDate.end && (
                    <li>• <strong>Rentang:</strong> {formatTanggal(filterDate.start)} <strong>sampai</strong> {formatTanggal(filterDate.end)}</li>
                  )}
                  {filterDate.start && !filterDate.end && (
                    <li>• <strong>Mulai dari:</strong> {formatTanggal(filterDate.start)}</li>
                  )}
                  {!filterDate.start && filterDate.end && (
                    <li>• <strong>Sampai dengan:</strong> {formatTanggal(filterDate.end)}</li>
                  )}
                </ul>
                {currentFilteredPemeriksaan.length === 0 && (
                  <p className="text-sm text-orange-600 mt-2 font-medium">
                    ⚠️ Tidak ada data pemeriksaan dalam rentang tanggal ini. Coba ubah rentang tanggal atau reset filter.
                  </p>
                )}
              </div>
            )
          })()}
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Balita</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total_balita}</div>
          <div className="text-xs text-gray-500 mt-1">Balita terdaftar</div>
        </div>
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Pemeriksaan</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total_pemeriksaan}</div>
          <div className="text-xs text-gray-500 mt-1">Pemeriksaan dilakukan</div>
        </div>
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Orang Tua</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total_orang_tua}</div>
          <div className="text-xs text-gray-500 mt-1">Akun terdaftar</div>
        </div>
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Status Normal</div>
          <div className="text-3xl font-bold text-green-600">{stats.normal}</div>
          <div className="text-xs text-gray-500 mt-1">Balita dengan gizi normal</div>
        </div>
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Stunting</div>
          <div className="text-3xl font-bold text-orange-600">{stats.stunting}</div>
          <div className="text-xs text-gray-500 mt-1">Balita dengan risiko stunting</div>
        </div>
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Wasting</div>
          <div className="text-3xl font-bold text-red-600">{stats.wasting}</div>
          <div className="text-xs text-gray-500 mt-1">Balita dengan gizi kurang/buruk</div>
        </div>
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Overweight</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.overweight}</div>
          <div className="text-xs text-gray-500 mt-1">Balita dengan gizi lebih/obesitas</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-2 mb-6 shadow-sm flex flex-wrap gap-2 overflow-x-auto">
        <button
          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors whitespace-nowrap ${
            reportType === 'semua' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setReportType('semua')}
        >
          📋 Ringkasan
        </button>
        <button
          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors whitespace-nowrap ${
            reportType === 'balita' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setReportType('balita')}
        >
          👶 Data Balita
        </button>
        <button
          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors whitespace-nowrap ${
            reportType === 'pemeriksaan' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setReportType('pemeriksaan')}
        >
          📊 Data Pemeriksaan
        </button>
      </div>

      {/* Content */}
      {reportType === 'semua' && (
        <div className="space-y-6">
          <div className="card bg-white shadow-md border border-gray-200">
            <div className="card-body">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Laporan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Informasi Umum</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>Total Balita: <strong>{stats.total_balita}</strong></li>
                    <li>Total Pemeriksaan: <strong>{stats.total_pemeriksaan}</strong></li>
                    <li>Total Orang Tua: <strong>{stats.total_orang_tua}</strong></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Distribusi Status Gizi</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>Normal: <strong className="text-green-600">{stats.normal}</strong></li>
                    <li>Stunting: <strong className="text-orange-600">{stats.stunting}</strong></li>
                    <li>Wasting: <strong className="text-red-600">{stats.wasting}</strong></li>
                    <li>Overweight: <strong className="text-yellow-600">{stats.overweight}</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'balita' && (
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Data Balita ({filteredBalita.length} balita)
            </h2>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Anak</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">NIK</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Orang Tua</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Tgl Lahir</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">BB (kg)</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">TB (cm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredBalita.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            Tidak ada data balita
                          </td>
                        </tr>
                      ) : (
                        filteredBalita.map((b, idx) => (
                          <tr key={b.id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-800">{idx + 1}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-800 font-medium">{b.nama_anak || b.nama || '-'}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-800 hidden md:table-cell">{b.nik || '-'}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-800 hidden lg:table-cell">{b.nama_ortu || '-'}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-800 hidden xl:table-cell">{b.tgl_lahir ? formatTanggal(b.tgl_lahir) : '-'}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-800">{b.bb_latest || b.bb || '-'}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-800">{b.tb_latest || b.tb || '-'}</td>
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
      )}

      {reportType === 'pemeriksaan' && (
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Data Pemeriksaan ({filteredPemeriksaan.length} pemeriksaan)
            </h2>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Anak</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">BB (kg)</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">TB (cm)</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Status Gizi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPemeriksaan.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            Tidak ada data pemeriksaan
                          </td>
                        </tr>
                      ) : (
                        filteredPemeriksaan.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-800">{idx + 1}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-800">
                              {p.tgl_ukur ? formatTanggal(p.tgl_ukur) : formatTanggal(p.created_at) || '-'}
                            </td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-800 font-medium">{p.balita_nama || '-'}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-800 hidden md:table-cell">{p.berat || p.bb || '-'}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-800 hidden md:table-cell">{p.tinggi || p.tb || '-'}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-800 hidden lg:table-cell">
                              <span className={`badge ${
                                p.status_gizi_hasil_compute?.includes('Normal') ? 'badge-success' :
                                p.status_gizi_hasil_compute?.includes('STUNTING') || p.status_gizi_hasil_compute?.includes('Pendek') ? 'badge-warning' :
                                p.status_gizi_hasil_compute?.includes('WASTING') || p.status_gizi_hasil_compute?.includes('Gizi Kurang') ? 'badge-error' :
                                'badge-info'
                              }`}>
                                {p.status_gizi_hasil_compute || p.status_gizi || '-'}
                              </span>
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
      )}
    </div>
  )
}

export default AdminLaporan
