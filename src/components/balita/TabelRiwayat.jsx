/**
 * TabelRiwayat.jsx
 * 
 * Komponen tabel untuk menampilkan riwayat pemeriksaan balita secara realtime
 * Menggunakan onSnapshot untuk realtime updates
 * Menggunakan daisyUI badge untuk status gizi
 */

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import StatusBadge from '../common/StatusBadge';

function TabelRiwayat() {
  const [pemeriksaanList, setPemeriksaanList] = useState([]);
  const [balitaMap, setBalitaMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterBalita, setFilterBalita] = useState(''); // Filter by balita_id

  // Realtime listener untuk data balita (untuk mapping nama)
  useEffect(() => {
    // Hapus orderBy untuk menghindari index requirement, sort manual di JavaScript
    const q = query(collection(db, 'balita'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const map = {};
      snapshot.docs.forEach(doc => {
        map[doc.id] = {
          id: doc.id,
          ...doc.data()
        };
      });
      setBalitaMap(map);
    }, (err) => {
      console.error('Error fetching balita:', err);
      setError('Gagal memuat data balita. Periksa koneksi internet Anda.');
    });

    return () => unsubscribe();
  }, []);

  // Realtime listener untuk data pemeriksaan
  useEffect(() => {
    let q;
    
    // Hapus orderBy untuk menghindari composite index requirement
    // Sort manual di JavaScript setelah data diterima
    if (filterBalita) {
      // Filter by balita_id
      q = query(
        collection(db, 'pemeriksaan'),
        where('balita_id', '==', filterBalita)
      );
    } else {
      // All pemeriksaan
      q = query(collection(db, 'pemeriksaan'));
    }

    setLoading(true);
    setError(''); // Clear error saat memuat ulang
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        // Normalize tgl_ukur untuk sorting
        const tgl_ukur_date = docData.tgl_ukur 
          ? (docData.tgl_ukur.toDate ? docData.tgl_ukur.toDate() : new Date(docData.tgl_ukur))
          : (docData.created_at?.toDate ? docData.created_at.toDate() : new Date(0));
        
        return {
          id: doc.id,
          ...docData,
          tgl_ukur_date
        };
      });
      
      // Sort manual by tgl_ukur (terbaru dulu)
      data.sort((a, b) => {
        return b.tgl_ukur_date - a.tgl_ukur_date;
      });
      
      // Tambahkan nomor urut setelah sorting
      data = data.map((item, index) => ({
        ...item,
        no: index + 1
      }));
      
      setPemeriksaanList(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching pemeriksaan:', err);
      let errorMessage = 'Gagal memuat data pemeriksaan.';
      
      if (err.code === 'permission-denied') {
        errorMessage = 'Akses ditolak. Periksa koneksi internet atau hubungi administrator.';
      } else if (err.code === 'unavailable') {
        errorMessage = 'Layanan database tidak tersedia. Periksa koneksi internet Anda.';
      } else if (err.message) {
        errorMessage = `Gagal memuat data: ${err.message}`;
      }
      
      setError(errorMessage);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filterBalita]);


  // Format tanggal
  const formatDate = (date) => {
    if (!date) return '-';
    if (date.toDate) {
      return date.toDate().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate age from tgl_lahir
  const calculateAge = (tglLahir) => {
    if (!tglLahir) return '-';
    
    const lahir = new Date(tglLahir);
    const sekarang = new Date();
    
    let tahun = sekarang.getFullYear() - lahir.getFullYear();
    let bulan = sekarang.getMonth() - lahir.getMonth();
    
    if (bulan < 0) {
      tahun--;
      bulan += 12;
    }
    
    if (tahun > 0) {
      return `${tahun} th ${bulan} bln`;
    } else {
      return `${bulan} bln`;
    }
  };

  if (loading && pemeriksaanList.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="card bg-white shadow-md border border-gray-200">
      <div className="card-body">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="card-title text-2xl">Riwayat Pemeriksaan Balita</h2>
          
          {/* Filter by Balita */}
          <div className="form-control w-full md:w-auto">
            <label className="label pb-1">
              <span className="label-text text-sm font-medium text-gray-700">Filter Balita</span>
            </label>
            <select
              value={filterBalita}
              onChange={(e) => setFilterBalita(e.target.value)}
              className="select select-bordered select-sm transition-all duration-200"
            >
              <option value="">Semua Balita</option>
              {Object.values(balitaMap)
                .sort((a, b) => (a.nama_anak || '').localeCompare(b.nama_anak || ''))
                .map((balita) => (
                  <option key={balita.id} value={balita.id}>
                    {balita.nama_anak}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-4 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full animate-fade-in">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Anak</th>
                <th>Gender</th>
                <th>Umur</th>
                <th>BB (kg)</th>
                <th>TB (cm)</th>
                <th>LL (cm)</th>
                <th>LK (cm)</th>
                <th>Status Gizi</th>
                <th>Tgl. Ukur</th>
              </tr>
            </thead>
            <tbody>
              {pemeriksaanList.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-500">Belum ada data pemeriksaan</span>
                    </div>
                  </td>
                </tr>
              ) : (
                pemeriksaanList.map((item) => {
                  const balita = balitaMap[item.balita_id];
                  return (
                    <tr key={item.id} className="animate-fade-in">
                      <td className="font-medium">{item.no}</td>
                      <td>
                        <div className="font-semibold">
                          {balita?.nama_anak || 'Tidak diketahui'}
                        </div>
                        {balita?.nik && (
                          <div className="text-xs text-gray-500">NIK: {balita.nik}</div>
                        )}
                      </td>
                      <td>
                        <span className="text-lg">
                          {balita?.jenis_kelamin === 'L' ? '👦' : balita?.jenis_kelamin === 'P' ? '👧' : '❓'}
                        </span>
                        <span className="ml-1">
                          {balita?.jenis_kelamin || '-'}
                        </span>
                      </td>
                      <td>{item.umur_bulan ? `${item.umur_bulan.toFixed(1)} bln` : (balita ? calculateAge(balita.tgl_lahir) : '-')}</td>
                      <td className="font-medium">
                        {item.berat ? `${item.berat.toFixed(1)} kg` : 
                         item.bb ? `${item.bb.toFixed(1)} kg` : 
                         item.berat_badan ? `${item.berat_badan.toFixed(1)} kg` : '-'}
                      </td>
                      <td className="font-medium">
                        {item.tinggi ? `${item.tinggi.toFixed(1)} cm` : 
                         item.tb ? `${item.tb.toFixed(1)} cm` : 
                         item.tinggi_badan ? `${item.tinggi_badan.toFixed(1)} cm` : '-'}
                      </td>
                      <td className="font-medium">
                        {item.lila ? `${item.lila.toFixed(1)} cm` : 
                         item.ll ? `${item.ll.toFixed(1)} cm` : '-'}
                      </td>
                      <td className="font-medium">
                        {item.lingkar_kepala ? `${item.lingkar_kepala.toFixed(1)} cm` : 
                         item.lk ? `${item.lk.toFixed(1)} cm` : '-'}
                      </td>
                      <td>
                        <StatusBadge 
                          status={item.status_gizi_hasil_compute || item.status_gizi} 
                          size="lg"
                        />
                      </td>
                      <td>{formatDate(item.tgl_ukur || item.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {pemeriksaanList.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total: <strong>{pemeriksaanList.length}</strong> data pemeriksaan
            {filterBalita && balitaMap[filterBalita] && (
              <span> untuk <strong>{balitaMap[filterBalita].nama_anak}</strong></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TabelRiwayat;

