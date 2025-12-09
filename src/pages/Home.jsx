import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, limit, doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Link } from 'react-router-dom'
import StatusBadge from '../components/common/StatusBadge'

function Home() {
  const [balitaList, setBalitaList] = useState([])
  const [pemeriksaanList, setPemeriksaanList] = useState([])
  const [loading, setLoading] = useState(true)

  // Realtime listener untuk data balita dengan data orang tua
  useEffect(() => {
    // Set timeout untuk loading (max 5 detik)
    const loadingTimeout = setTimeout(() => {
      setLoading(false)
    }, 5000)

    // Query tanpa orderBy dulu (untuk menghindari error jika field tidak ada)
    const q = query(collection(db, 'balita'), limit(50))
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      clearTimeout(loadingTimeout) // Cancel timeout jika data sudah datang
      
      const data = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const balita = {
            id: docSnapshot.id,
            ...docSnapshot.data()
          }
          
          // Ambil data orang tua jika ada orang_tua_uid
          if (balita.orang_tua_uid) {
            try {
              const orangTuaDoc = await getDoc(doc(db, 'orang_tua', balita.orang_tua_uid))
              if (orangTuaDoc.exists()) {
                const orangTuaData = orangTuaDoc.data()
                // Update nama_ayah dan nama_ibu dari collection orang_tua (prioritas)
                balita.nama_ayah = orangTuaData.nama_ayah || balita.nama_ayah || null
                balita.nama_ibu = orangTuaData.nama_ibu || balita.nama_ibu || null
                // Update nama_ortu
                if (balita.nama_ayah && balita.nama_ibu) {
                  balita.nama_ortu = `${balita.nama_ayah} / ${balita.nama_ibu}`
                } else {
                  balita.nama_ortu = balita.nama_ortu || balita.nama_ayah || balita.nama_ibu || null
                }
              }
            } catch (err) {
              console.warn('Error fetching orang_tua for balita:', balita.id, err)
            }
          }
          
          return balita
        })
      )
      
      // Sort manual di frontend
      data.sort((a, b) => {
        const namaA = (a.nama_anak || a.nama || '').toLowerCase()
        const namaB = (b.nama_anak || b.nama || '').toLowerCase()
        return namaA.localeCompare(namaB)
      })
      setBalitaList(data)
      setLoading(false)
    }, (err) => {
      clearTimeout(loadingTimeout) // Cancel timeout jika error
      console.error('Error fetching balita:', err)
      setLoading(false)
      // Set empty array jika error
      setBalitaList([])
    })

    return () => {
      clearTimeout(loadingTimeout)
      unsubscribe()
    }
  }, [])

  // Realtime listener untuk data pemeriksaan (untuk statistik)
  useEffect(() => {
    // Query tanpa orderBy dulu (untuk menghindari error jika field tidak ada)
    const q = query(collection(db, 'pemeriksaan'), limit(100))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Sort manual di frontend berdasarkan created_at atau tgl_ukur
      data.sort((a, b) => {
        const dateA = a.created_at?.toDate ? a.created_at.toDate() : (a.tgl_ukur ? new Date(a.tgl_ukur) : new Date(0))
        const dateB = b.created_at?.toDate ? b.created_at.toDate() : (b.tgl_ukur ? new Date(b.tgl_ukur) : new Date(0))
        return dateB - dateA // Descending
      })
      setPemeriksaanList(data)
    }, (err) => {
      console.error('Error fetching pemeriksaan:', err)
      // Set empty array jika error
      setPemeriksaanList([])
    })

    return () => unsubscribe()
  }, [])

  const stats = {
    total_balita: balitaList.length,
    total_pemeriksaan: pemeriksaanList.length,
    normal: pemeriksaanList.filter(p => 
      p.status_gizi === 'Normal' || 
      p.status_gizi_hasil_compute?.includes('Normal') ||
      p.kategori_tb_u === 'NORMAL' || 
      p.kategori_bb_u === 'NORMAL'
    ).length,
    stunting: pemeriksaanList.filter(p => 
      p.status_gizi?.includes('Stunting') ||
      p.status_gizi_hasil_compute?.includes('Stunting') ||
      p.status_gizi_hasil_compute?.includes('Pendek') ||
      p.kategori_tb_u === 'STUNTING' ||
      p.kategori_tb_u === 'SEVERE_STUNTING'
    ).length,
    wasting: pemeriksaanList.filter(p => 
      p.status_gizi?.includes('Gizi Kurang') ||
      p.status_gizi?.includes('Gizi Buruk') ||
      p.status_gizi_hasil_compute?.includes('Wasting') || 
      p.status_gizi_hasil_compute?.includes('Gizi Kurang') ||
      p.status_gizi_hasil_compute?.includes('Gizi Buruk') ||
      p.kategori_bb_u === 'WASTING' ||
      p.kategori_bb_u === 'SEVERE_WASTING' ||
      p.kategori_bb_u === 'UNDERWEIGHT' ||
      p.kategori_bb_u === 'SEVERE_UNDERWEIGHT'
    ).length
  }

  // Format tanggal
  const formatDate = (date) => {
    if (!date) return '-'
    if (date.toDate) {
      return date.toDate().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }


  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton untuk Header */}
        <div className="mb-8">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-96 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>

        {/* Skeleton untuk Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Skeleton untuk Tabel */}
        <div className="card">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
          🏥 Halaman Umum • Informasi Posyandu
        </span>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistem Automasi Analisis Status Gizi Posyandu</h1>
        <p className="text-gray-600">
          Halaman ini menampilkan informasi umum Posyandu. Semua orang dapat melihat data perkembangan balita.
          Untuk melihat data anak Anda secara khusus, silakan{' '}
          <Link to="/login" className="text-blue-600 hover:underline">login sebagai orang tua</Link>.
        </p>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg drop-shadow-md">
          <div className="text-sm opacity-95">Total Balita</div>
          <div className="text-3xl font-bold leading-tight">{stats.total_balita}</div>
        </div>
        
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg drop-shadow-md">
          <div className="text-sm opacity-95">Total Pemeriksaan</div>
          <div className="text-3xl font-bold leading-tight">{stats.total_pemeriksaan}</div>
        </div>
        
        <div className="card bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900 shadow-lg">
          <div className="text-sm font-semibold opacity-95">Status Normal</div>
          <div className="text-3xl font-bold leading-tight">{stats.normal}</div>
        </div>
        
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg drop-shadow-md">
          <div className="text-sm opacity-95">Perlu Perhatian</div>
          <div className="text-3xl font-bold leading-tight">{stats.stunting + stats.wasting}</div>
        </div>
      </div>

      {/* Daftar Balita */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Daftar Balita</h2>
        
        {balitaList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Belum ada data balita.</p>
            <p className="text-sm mt-2">
              <Link to="/test/manajemen-balita" className="text-blue-600 hover:underline">
                Tambah data balita
              </Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Anak</th>
                  <th>NIK</th>
                  <th>Gender</th>
                  <th>Tanggal Lahir</th>
                  <th>Nama Orang Tua</th>
                </tr>
              </thead>
              <tbody>
                {balitaList.map((balita, index) => (
                  <tr key={balita.id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold">{balita.nama_anak || balita.nama}</td>
                    <td>{balita.nik || '-'}</td>
                    <td>
                      <span className="text-lg">
                        {balita.jenis_kelamin === 'L' ? '👦' : balita.jenis_kelamin === 'P' ? '👧' : '❓'}
                      </span>
                      <span className="ml-1">
                        {balita.jenis_kelamin || '-'}
                      </span>
                    </td>
                    <td>{formatDate(balita.tgl_lahir)}</td>
                    <td>
                      {balita.nama_ortu || 
                       (balita.nama_ayah && balita.nama_ibu ? `${balita.nama_ayah} / ${balita.nama_ibu}` : 
                        balita.nama_ayah || balita.nama_ibu || '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Riwayat Pemeriksaan Terbaru */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Riwayat Pemeriksaan Terbaru</h2>
        
        {pemeriksaanList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Belum ada data pemeriksaan.</p>
            <p className="text-sm mt-2">
              <Link to="/test/manajemen-balita" className="text-blue-600 hover:underline">
                Tambah data pemeriksaan
              </Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Anak</th>
                  <th>BB (kg)</th>
                  <th>TB (cm)</th>
                  <th>Status Gizi</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {pemeriksaanList.slice(0, 10).map((pemeriksaan, index) => {
                  const balita = balitaList.find(b => b.id === pemeriksaan.balita_id)
                  return (
                    <tr key={pemeriksaan.id}>
                      <td>{index + 1}</td>
                      <td className="font-semibold">
                        {balita?.nama_anak || balita?.nama || 'Tidak diketahui'}
                      </td>
                      <td>
                        {pemeriksaan.berat ? `${pemeriksaan.berat.toFixed(1)} kg` : 
                         pemeriksaan.bb ? `${pemeriksaan.bb.toFixed(1)} kg` : 
                         pemeriksaan.berat_badan ? `${pemeriksaan.berat_badan.toFixed(1)} kg` : '-'}
                      </td>
                      <td>
                        {pemeriksaan.tinggi ? `${pemeriksaan.tinggi.toFixed(1)} cm` : 
                         pemeriksaan.tb ? `${pemeriksaan.tb.toFixed(1)} cm` : 
                         pemeriksaan.tinggi_badan ? `${pemeriksaan.tinggi_badan.toFixed(1)} cm` : '-'}
                      </td>
                      <td>
                        <StatusBadge 
                          status={pemeriksaan.status_gizi_hasil_compute || pemeriksaan.status_gizi} 
                          size="md"
                        />
                      </td>
                      <td>{formatDate(pemeriksaan.tgl_ukur)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Info:</strong> Data ditampilkan secara realtime dari Google Cloud Firestore. 
          Analisis status gizi dilakukan otomatis oleh Vercel Serverless Functions menggunakan standar WHO (Z-Score).
        </p>
      </div>
    </div>
  )
}

export default Home
