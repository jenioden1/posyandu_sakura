/**
 * FormTambahBalita.jsx
 * 
 * Komponen form untuk menambah data profil balita ke koleksi `balita`
 * Menggunakan daisyUI untuk komponen UI
 */

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

function FormTambahBalita({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nama_anak: '',
    nik: '',
    jenis_kelamin: 'L',
    tgl_lahir: '',
    nama_ortu: '',
    alamat: ''
  });

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
      // Validasi
      if (!formData.nama_anak.trim()) {
        throw new Error('Nama anak harus diisi');
      }
      if (!formData.nik.trim()) {
        throw new Error('NIK harus diisi');
      }
      if (!formData.tgl_lahir) {
        throw new Error('Tanggal lahir harus diisi');
      }
      if (!formData.nama_ortu.trim()) {
        throw new Error('Nama orang tua harus diisi');
      }

      // Timeout untuk operasi Firestore (max 10 detik)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Waktu operasi habis. Coba lagi atau periksa koneksi internet.')), 10000);
      });

      // Simpan ke Firestore koleksi `balita` dengan timeout
      const savePromise = addDoc(collection(db, 'balita'), {
        nama_anak: formData.nama_anak.trim(),
        nik: formData.nik.trim(),
        jenis_kelamin: formData.jenis_kelamin,
        tgl_lahir: formData.tgl_lahir,
        nama_ortu: formData.nama_ortu.trim(),
        alamat: formData.alamat.trim() || '',
        created_at: new Date(),
        updated_at: new Date()
      });

      const docRef = await Promise.race([savePromise, timeoutPromise]);

      // Reset form
      setFormData({
        nama_anak: '',
        nik: '',
        jenis_kelamin: 'L',
        tgl_lahir: '',
        nama_ortu: '',
        alamat: ''
      });

      // Callback success
      if (onSuccess) {
        onSuccess(docRef.id);
      }

      // Show success message (non-blocking)
      // Ganti alert dengan toast notification yang lebih baik
      const successMsg = document.createElement('div');
      successMsg.className = 'alert alert-success fixed top-4 right-4 z-50 shadow-lg';
      successMsg.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Data balita berhasil ditambahkan!</span>
      `;
      document.body.appendChild(successMsg);
      
      // Auto remove setelah 3 detik
      setTimeout(() => {
        successMsg.remove();
      }, 3000);

    } catch (err) {
      console.error('Error adding balita:', err);
      
      // Error handling yang lebih spesifik
      let errorMessage = 'Terjadi kesalahan saat menyimpan data';
      
      if (err.code === 'permission-denied') {
        errorMessage = 'Tidak memiliki izin. Periksa Firestore Rules.';
      } else if (err.code === 'unavailable') {
        errorMessage = 'Firestore tidak tersedia. Periksa koneksi internet.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Tambah Data Balita</h2>
        
        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Anak */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Nama Anak <span className="text-error">*</span></span>
            </label>
            <input
              type="text"
              name="nama_anak"
              value={formData.nama_anak}
              onChange={handleChange}
              placeholder="Masukkan nama anak"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* NIK */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">NIK <span className="text-error">*</span></span>
            </label>
            <input
              type="text"
              name="nik"
              value={formData.nik}
              onChange={handleChange}
              placeholder="Masukkan NIK"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Jenis Kelamin */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Jenis Kelamin <span className="text-error">*</span></span>
            </label>
            <select
              name="jenis_kelamin"
              value={formData.jenis_kelamin}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          {/* Tanggal Lahir */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Tanggal Lahir <span className="text-error">*</span></span>
            </label>
            <input
              type="date"
              name="tgl_lahir"
              value={formData.tgl_lahir}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              max={new Date().toISOString().split('T')[0]} // Max hari ini
            />
          </div>

          {/* Nama Orang Tua */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Nama Orang Tua <span className="text-error">*</span></span>
            </label>
            <input
              type="text"
              name="nama_ortu"
              value={formData.nama_ortu}
              onChange={handleChange}
              placeholder="Masukkan nama orang tua"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Alamat */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Alamat</span>
            </label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              placeholder="Masukkan alamat"
              className="textarea textarea-bordered w-full"
              rows="3"
            />
          </div>

          {/* Submit Button */}
          <div className="form-control mt-6">
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Data Balita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormTambahBalita;

