import { useState, useEffect } from 'react'
import { collection, query, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'

function Statistik() {
  const [stats, setStats] = useState({
    total_balita: 0,
    total_pemeriksaan: 0,
    normal: 0,
    stunting: 0,
    wasting: 0,
    overweight: 0
  })
  const [statsByMonth, setStatsByMonth] = useState([])
  const [topBalita, setTopBalita] = useState([])
  const [balitaList, setBalitaList] = useState([])
  const [pemeriksaanList, setPemeriksaanList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load balita data
    const qBalita = query(collection(db, 'balita'), limit(500))
    const unsubscribeBalita = onSnapshot(qBalita, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setBalitaList(data)
    }, (err) => {
      console.error('Error fetching balita:', err)
      setBalitaList([])
    })

    // Load pemeriksaan data
    const qPemeriksaan = query(collection(db, 'pemeriksaan'), limit(1000))
    const unsubscribePemeriksaan = onSnapshot(qPemeriksaan, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPemeriksaanList(data)
    }, (err) => {
      console.error('Error fetching pemeriksaan:', err)
      setPemeriksaanList([])
    })

    return () => {
      unsubscribeBalita()
      unsubscribePemeriksaan()
    }
  }, [])

  useEffect(() => {
    if (balitaList.length > 0 || pemeriksaanList.length > 0) {
      calculateStats()
    }
  }, [balitaList, pemeriksaanList])

  const calculateStats = () => {
    // Calculate basic stats
    const total_balita = balitaList.length
    const total_pemeriksaan = pemeriksaanList.length

    // Calculate status gizi distribution
    const normal = pemeriksaanList.filter(p => 
      p.status_gizi_hasil_compute?.includes('Normal') || 
      p.kategori_tb_u === 'NORMAL' || 
      p.kategori_bb_u === 'NORMAL'
    ).length

    const stunting = pemeriksaanList.filter(p => 
      p.status_gizi_hasil_compute?.includes('STUNTING') || 
      p.status_gizi_hasil_compute?.includes('Pendek') ||
      p.kategori_tb_u === 'STUNTING'
    ).length

    const wasting = pemeriksaanList.filter(p => 
      p.status_gizi_hasil_compute?.includes('WASTING') || 
      p.status_gizi_hasil_compute?.includes('Gizi Kurang') ||
      p.status_gizi_hasil_compute?.includes('Gizi Buruk') ||
      p.kategori_bb_u === 'WASTING' ||
      p.kategori_bb_u === 'SEVERE_WASTING'
    ).length

    const overweight = pemeriksaanList.filter(p => 
      p.status_gizi_hasil_compute?.includes('OVERWEIGHT') || 
      p.status_gizi_hasil_compute?.includes('Obesitas') ||
      p.status_gizi_hasil_compute?.includes('Gizi Lebih') ||
      p.kategori_bb_u === 'OVERWEIGHT' ||
      p.kategori_bb_u === 'OBESITAS'
    ).length

    setStats({
      total_balita,
      total_pemeriksaan,
      normal,
      stunting,
      wasting,
      overweight
    })

    // Calculate stats by month (based on pemeriksaan tgl_ukur)
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    const monthStats = monthNames.map((monthName, index) => {
      const count = pemeriksaanList.filter(p => {
        const date = p.tgl_ukur 
          ? (p.tgl_ukur.toDate ? p.tgl_ukur.toDate() : new Date(p.tgl_ukur))
          : (p.created_at?.toDate ? p.created_at.toDate() : null)
        
        if (!date) return false
        return date.getMonth() === index
      }).length

      return {
        label: monthName,
        code: index + 1,
        total: count
      }
    })
    setStatsByMonth(monthStats)

    // Calculate top 10 balita by pemeriksaan count
    const balitaPemeriksaanCount = {}
    pemeriksaanList.forEach(p => {
      if (p.balita_id) {
        balitaPemeriksaanCount[p.balita_id] = (balitaPemeriksaanCount[p.balita_id] || 0) + 1
      }
    })

    const top = balitaList
      .map(b => {
        const balita = balitaList.find(bl => bl.id === b.id)
        return {
          id: b.id,
          nama_anak: b.nama_anak || b.nama || '-',
          nama_ortu: b.nama_ortu || `${b.nama_ayah || ''} / ${b.nama_ibu || ''}`.trim() || '-',
          jumlah_pemeriksaan: balitaPemeriksaanCount[b.id] || 0
        }
      })
      .filter(b => b.jumlah_pemeriksaan > 0)
      .sort((a, b) => b.jumlah_pemeriksaan - a.jumlah_pemeriksaan)
      .slice(0, 10)

    setTopBalita(top)
    setLoading(false)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Balita</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total_balita}</div>
          <div className="text-xs text-gray-500 mt-1">Jumlah balita terdaftar</div>
        </div>
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Pemeriksaan</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total_pemeriksaan}</div>
          <div className="text-xs text-gray-500 mt-1">Total pemeriksaan yang dilakukan</div>
        </div>
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Status Normal</div>
          <div className="text-3xl font-bold text-green-600">{stats.normal}</div>
          <div className="text-xs text-gray-500 mt-1">Balita dengan status gizi normal</div>
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

      {/* Statistics by Month */}
      <div className="card bg-white shadow-md border border-gray-200 mb-6">
        <div className="card-body">
          <div className="text-lg font-semibold text-gray-800 mb-4">
            Statistik Pemeriksaan per Bulan
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bulan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Pemeriksaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {statsByMonth.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                      Belum ada data pemeriksaan
                    </td>
                  </tr>
                ) : (
                  statsByMonth.map((stat) => (
                    <tr key={stat.code}>
                      <td className="px-4 py-2 text-sm text-gray-800">{stat.label}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{stat.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top 10 Balita */}
      <div className="card bg-white shadow-md border border-gray-200">
        <div className="card-body">
          <div className="text-lg font-semibold text-gray-800 mb-4">
            Top 10 Balita dengan Pemeriksaan Terbanyak
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Anak</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orang Tua</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Pemeriksaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topBalita.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Belum ada data pemeriksaan
                    </td>
                  </tr>
                ) : (
                  topBalita.map((b, idx) => (
                    <tr key={b.id || idx}>
                      <td className="px-4 py-2 text-sm text-gray-800">{idx + 1}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{b.nama_anak}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{b.nama_ortu}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{b.jumlah_pemeriksaan}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistik

