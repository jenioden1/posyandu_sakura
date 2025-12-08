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
      // VALIDASI DATA MENTAH dengan pesan yang jelas
      // ==========================================
      if (!formData.balita_id) {
        throw new Error('Pilih nama anak terlebih dahulu dari dropdown di atas. Data pemeriksaan harus dikaitkan dengan balita yang terdaftar.');
      }
      
      if (!formData.tgl_ukur) {
        throw new Error('Tanggal pengukuran wajib diisi. Pilih tanggal kapan pemeriksaan dilakukan.');
      }

      // Validasi tanggal tidak boleh di masa depan
      const tglUkur = new Date(formData.tgl_ukur);
      const hariIni = new Date();
      hariIni.setHours(23, 59, 59, 999); // Set ke akhir hari untuk memungkinkan input hari ini
      if (tglUkur > hariIni) {
        throw new Error('Tanggal pengukuran tidak boleh di masa depan. Pilih tanggal yang benar.');
      }

      if (!formData.bb || formData.bb.trim() === '') {
        throw new Error('Berat badan wajib diisi. Masukkan berat badan anak dalam kilogram (kg), contoh: 5.5');
      }

      const bbValue = parseFloat(formData.bb);
      if (isNaN(bbValue) || bbValue <= 0) {
        throw new Error('Berat badan harus berupa angka positif. Contoh: 5.5 (dalam kg). Pastikan tidak ada karakter selain angka dan titik.');
      }

      if (bbValue > 50) {
        throw new Error('Berat badan terlalu besar. Pastikan satuan dalam kilogram (kg), bukan gram. Contoh: 5.5 kg, bukan 5500 gram.');
      }

      if (!formData.tb || formData.tb.trim() === '') {
        throw new Error('Tinggi badan wajib diisi. Masukkan tinggi badan anak dalam centimeter (cm), contoh: 75');
      }

      const tbValue = parseFloat(formData.tb);
      if (isNaN(tbValue) || tbValue <= 0) {
        throw new Error('Tinggi badan harus berupa angka positif. Contoh: 75 (dalam cm). Pastikan tidak ada karakter selain angka.');
      }

      if (tbValue > 200) {
        throw new Error('Tinggi badan terlalu besar. Pastikan satuan dalam centimeter (cm), bukan meter. Contoh: 75 cm, bukan 0.75 meter.');
      }

      // Ambil data balita lengkap untuk perhitungan WHO
      const selectedBalita = balitaList.find(b => b.id === formData.balita_id);
      if (!selectedBalita) {
        throw new Error('Data balita yang dipilih tidak ditemukan di database. Silakan pilih balita lain atau hubungi administrator.');
      }

      // Validasi data balita lengkap dengan pesan yang jelas
      if (!selectedBalita.nama_anak) {
        throw new Error('Data balita tidak lengkap: nama anak tidak ditemukan. Silakan lengkapi data balita terlebih dahulu di menu "Tambah Balita".');
      }
      if (!selectedBalita.tgl_lahir) {
        throw new Error('Data balita tidak lengkap: tanggal lahir tidak ditemukan. Silakan lengkapi data balita terlebih dahulu di menu "Tambah Balita".');
      }
      if (!selectedBalita.jenis_kelamin) {
        throw new Error('Data balita tidak lengkap: jenis kelamin tidak ditemukan. Silakan lengkapi data balita terlebih dahulu di menu "Tambah Balita".');
      }

      // Validasi data numerik opsional
      if (formData.lila && formData.lila.trim() !== '') {
        const lilaValue = parseFloat(formData.lila);
        if (isNaN(lilaValue) || lilaValue <= 0) {
          throw new Error('Lingkar lengan (LILA) harus berupa angka positif. Contoh: 14.5 (dalam cm).');
        }
        if (lilaValue > 50) {
          throw new Error('Lingkar lengan terlalu besar. Pastikan satuan dalam centimeter (cm).');
        }
      }

      if (formData.lingkar_kepala && formData.lingkar_kepala.trim() !== '') {
        const lkValue = parseFloat(formData.lingkar_kepala);
        if (isNaN(lkValue) || lkValue <= 0) {
          throw new Error('Lingkar kepala harus berupa angka positif. Contoh: 45 (dalam cm).');
        }
        if (lkValue > 100) {
          throw new Error('Lingkar kepala terlalu besar. Pastikan satuan dalam centimeter (cm).');
        }
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
        // Pesan error dari API yang lebih jelas
        const apiErrorMsg = result.message || 'Gagal menyimpan data pemeriksaan';
        if (apiErrorMsg.includes('Field wajib')) {
          throw new Error('Data wajib belum lengkap. Pastikan semua field yang wajib sudah diisi dengan benar.');
        } else if (apiErrorMsg.includes('berat') || apiErrorMsg.includes('tinggi')) {
          throw new Error('Berat badan dan tinggi badan harus lebih dari 0. Pastikan Anda memasukkan nilai yang benar dalam satuan kg dan cm.');
        } else {
          throw new Error(apiErrorMsg + '. Silakan periksa kembali data yang Anda masukkan.');
        }
      }
    } catch (err) {
      console.error('Error adding pemeriksaan:', err);
      
      // Error handling yang lebih spesifik dengan pesan yang jelas
      let errorMessage = 'Terjadi kesalahan saat menyimpan data pemeriksaan.';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi. Jika masalah berlanjut, hubungi administrator.';
      } else if (err.name === 'NetworkError') {
        errorMessage = 'Koneksi internet terputus. Pastikan koneksi internet Anda stabil dan coba lagi.';
      } else {
        errorMessage = 'Terjadi kesalahan tidak terduga. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.';
      }
      
      setError(errorMessage);
      showError(errorMessage);
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
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Kesalahan Input</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
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

