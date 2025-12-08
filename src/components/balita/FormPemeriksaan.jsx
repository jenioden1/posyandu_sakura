/**
 * FormPemeriksaan.jsx
 * 
 * Komponen form untuk menambah data pemeriksaan bulanan ke koleksi `pemeriksaan`
 * Menggunakan dropdown untuk memilih balita dari koleksi `balita`
 * Menggunakan daisyUI untuk komponen UI
 */

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useToastContext } from '../../contexts/ToastContext';

function FormPemeriksaan({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [balitaList, setBalitaList] = useState([]);
  const { success, error: showError } = useToastContext();
  const [formData, setFormData] = useState({
    balita_id: '',
    tgl_ukur: new Date().toISOString().split('T')[0], // Default hari ini
    bb: '',           // Berat Badan (kg) - sesuai blueprint
    tb: '',           // Tinggi Badan (cm) - sesuai blueprint
    lingkar_kepala: '', // Lingkar Kepala (cm) - optional
    lila: ''          // LILA (cm) - optional
  });

  // Realtime listener untuk daftar balita
  useEffect(() => {
    const q = query(collection(db, 'balita'), orderBy('nama_anak', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBalitaList(data);
    }, (err) => {
      console.error('Error fetching balita:', err);
      setError('Gagal memuat daftar balita');
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error saat user mengetik
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ==========================================
      // VALIDASI DATA MENTAH
      // ==========================================
      if (!formData.balita_id) {
        throw new Error('Pilih nama anak terlebih dahulu');
      }
      if (!formData.tgl_ukur) {
        throw new Error('Tanggal pengukuran harus diisi');
      }
      if (!formData.bb || parseFloat(formData.bb) <= 0) {
        throw new Error('Berat badan harus lebih dari 0');
      }
      if (!formData.tb || parseFloat(formData.tb) <= 0) {
        throw new Error('Tinggi badan harus lebih dari 0');
      }

      // Ambil data balita lengkap untuk perhitungan WHO
      const selectedBalita = balitaList.find(b => b.id === formData.balita_id);
      if (!selectedBalita) {
        throw new Error('Data balita tidak ditemukan');
      }

      // Validasi data balita lengkap
      if (!selectedBalita.nama_anak) {
        throw new Error('Data balita tidak lengkap: nama anak tidak ditemukan');
      }
      if (!selectedBalita.tgl_lahir) {
        throw new Error('Data balita tidak lengkap: tanggal lahir tidak ditemukan');
      }
      if (!selectedBalita.jenis_kelamin) {
        throw new Error('Data balita tidak lengkap: jenis kelamin tidak ditemukan');
      }

      // ==========================================
      // KIRIM DATA LENGKAP KE API ANALYZE
      // ==========================================
      const payload = {
        nama: selectedBalita.nama_anak,
        tgl_lahir: selectedBalita.tgl_lahir,
        jenis_kelamin: selectedBalita.jenis_kelamin,
        berat: parseFloat(formData.bb),
        tinggi: parseFloat(formData.tb),
        lila: formData.lila ? parseFloat(formData.lila) : null,
        lingkar_kepala: formData.lingkar_kepala ? parseFloat(formData.lingkar_kepala) : null,
        balita_id: formData.balita_id, // Tambahkan balita_id untuk referensi
        tgl_ukur: formData.tgl_ukur // Tambahkan tanggal pengukuran
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Reset form
        setFormData({
          balita_id: '',
          tgl_ukur: new Date().toISOString().split('T')[0],
          bb: '',
          tb: '',
          lingkar_kepala: '',
          lila: ''
        });

        // Show success toast
        success(`Data pemeriksaan berhasil disimpan! Status gizi: ${result.data.status_gizi}`);

        // Callback success
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(result.message || 'Gagal menyimpan data pemeriksaan');
      }
    } catch (err) {
      console.error('Error adding pemeriksaan:', err);
      
      // Error handling yang lebih spesifik
      let errorMessage = 'Terjadi kesalahan saat menyimpan data';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get selected balita name for display
  const selectedBalita = balitaList.find(b => b.id === formData.balita_id);

  return (
    <div className="card bg-white shadow-md border border-gray-200">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Tambah Data Pemeriksaan</h2>
        
        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pilih Balita */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Pilih Nama Anak <span className="text-error">*</span></span>
            </label>
            <select
              name="balita_id"
              value={formData.balita_id}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">-- Pilih Nama Anak --</option>
              {balitaList.map((balita) => (
                <option key={balita.id} value={balita.id}>
                  {balita.nama_anak} {balita.nik ? `(NIK: ${balita.nik})` : ''}
                </option>
              ))}
            </select>
            {selectedBalita && (
              <label className="label">
                <span className="label-text-alt text-info">
                  {selectedBalita.jenis_kelamin === 'L' ? '👦' : '👧'} {selectedBalita.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • 
                  Umur: {calculateAge(selectedBalita.tgl_lahir)}
                </span>
              </label>
            )}
          </div>

          {/* Tanggal Pengukuran */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Tanggal Pengukuran <span className="text-error">*</span></span>
            </label>
            <input
              type="date"
              name="tgl_ukur"
              value={formData.tgl_ukur}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              max={new Date().toISOString().split('T')[0]} // Max hari ini
            />
          </div>

          {/* Grid untuk input pengukuran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Berat Badan */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Berat Badan (kg) <span className="text-error">*</span></span>
              </label>
              <input
                type="number"
                name="bb"
                value={formData.bb}
                onChange={handleChange}
                placeholder="0.0"
                step="0.1"
                min="0"
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Tinggi Badan */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Tinggi Badan (cm) <span className="text-error">*</span></span>
              </label>
              <input
                type="number"
                name="tb"
                value={formData.tb}
                onChange={handleChange}
                placeholder="0.0"
                step="0.1"
                min="0"
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Lingkar Kepala */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Lingkar Kepala (cm)</span>
              </label>
              <input
                type="number"
                name="lingkar_kepala"
                value={formData.lingkar_kepala}
                onChange={handleChange}
                placeholder="0.0"
                step="0.1"
                min="0"
                className="input input-bordered w-full"
              />
            </div>

            {/* LILA */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">LILA (cm)</span>
              </label>
              <input
                type="number"
                name="lila"
                value={formData.lila}
                onChange={handleChange}
                placeholder="0.0"
                step="0.1"
                min="0"
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {/* Info */}
          {selectedBalita && (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-sm">
                <strong>Info:</strong> Data akan dianalisis menggunakan standar WHO untuk menentukan status gizi anak.
                {!selectedBalita.nama_anak || !selectedBalita.tgl_lahir || !selectedBalita.jenis_kelamin ? (
                  <span className="text-warning block mt-1">
                    ⚠️ Data balita belum lengkap. Pastikan nama, tanggal lahir, dan jenis kelamin sudah terisi.
                  </span>
                ) : null}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-control mt-6">
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Data Pemeriksaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function untuk menghitung umur
function calculateAge(tglLahir) {
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
    return `${tahun} tahun ${bulan} bulan`;
  } else {
    return `${bulan} bulan`;
  }
}

export default FormPemeriksaan;

