/**
 * FormTambahBalita.jsx
 * 
 * Komponen form untuk menambah data profil balita ke koleksi `balita`
 * Menggunakan daisyUI untuk komponen UI
 */

import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { api } from '../../utils/api';
import { useToastContext } from '../../contexts/ToastContext';
import DateInput from '../common/DateInput';

function FormTambahBalita({ onSuccess, editingData = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nama_anak: '',
    nik: '',
    jenis_kelamin: 'L',
    tgl_lahir: '',
    orang_tua_uid: '',
    alamat: '',
    bb: '',
    tb: '',
    ll: '', // Lingkar Lengan
    lk: '', // Lingkar Kepala
    vitamin_a: false // Checkbox Vitamin A
  });
  const [orangTuaList, setOrangTuaList] = useState([]);
  const { success } = useToastContext();

  // Ambil daftar akun orang tua untuk relasi balita -> orang tua
  useEffect(() => {
    const loadOrangTua = async () => {
      try {
        const q = query(collection(db, 'orang_tua'), orderBy('nama_ayah', 'asc'));
        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrangTuaList(list);
      } catch (err) {
        console.error('Error fetch orang_tua:', err);
      }
    };
    loadOrangTua();
  }, []);

  // Load data jika mode edit
  useEffect(() => {
    if (editingData) {
      setFormData({
        nama_anak: editingData.nama_anak || '',
        nik: editingData.nik || '',
        jenis_kelamin: editingData.jenis_kelamin || 'L',
        tgl_lahir: editingData.tgl_lahir || '',
        orang_tua_uid: editingData.orang_tua_uid || editingData.orang_tua_id || '',
        alamat: editingData.alamat || '',
        bb: editingData.bb || '',
        tb: editingData.tb || '',
        ll: editingData.ll || '',
        lk: editingData.lk || '',
        vitamin_a: (editingData.pelayanan || '').toLowerCase().includes('vitamin a')
      });
    } else {
      // Reset form jika tidak edit
      setFormData({
        nama_anak: '',
        nik: '',
        jenis_kelamin: 'L',
        tgl_lahir: '',
        orang_tua_uid: '',
        alamat: ''
      });
    }
  }, [editingData]);

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
      // Validasi dengan pesan yang jelas
      if (!formData.nama_anak.trim()) {
        throw new Error('Nama anak wajib diisi. Silakan masukkan nama lengkap anak.');
      }
      
      if (formData.nama_anak.trim().length < 2) {
        throw new Error('Nama anak terlalu pendek. Minimal 2 karakter.');
      }

      if (!formData.nik.trim()) {
        throw new Error('NIK wajib diisi. Silakan masukkan Nomor Induk Kependudukan (NIK) anak.');
      }

      if (formData.nik.trim().length < 10) {
        throw new Error('NIK tidak valid. NIK harus minimal 10 digit.');
      }

      if (!formData.tgl_lahir) {
        throw new Error('Tanggal lahir wajib diisi. Silakan pilih tanggal lahir anak.');
      }

      // Validasi tanggal lahir tidak boleh di masa depan
      const tglLahir = new Date(formData.tgl_lahir);
      const hariIni = new Date();
      if (tglLahir > hariIni) {
        throw new Error('Tanggal lahir tidak boleh di masa depan. Silakan pilih tanggal yang benar.');
      }

      // Validasi umur maksimal (misalnya 5 tahun untuk balita)
      const umurTahun = (hariIni - tglLahir) / (1000 * 60 * 60 * 24 * 365);
      if (umurTahun > 5) {
        throw new Error('Umur anak melebihi batas balita (5 tahun). Sistem ini khusus untuk balita usia 0-5 tahun.');
      }

      if (!formData.orang_tua_uid) {
        throw new Error('Akun orang tua wajib dipilih. Silakan pilih akun orang tua dari dropdown di atas.');
      }

      // Ambil data orang tua untuk nama_ayah dan nama_ibu
      const selectedOrangTua = orangTuaList.find(ot => ot.id === formData.orang_tua_uid);
      if (!selectedOrangTua) {
        throw new Error('Akun orang tua yang dipilih tidak ditemukan. Silakan pilih akun orang tua yang valid atau buat akun baru terlebih dahulu.');
      }

      // Validasi data numerik jika diisi
      if (formData.bb && (isNaN(parseFloat(formData.bb)) || parseFloat(formData.bb) <= 0)) {
        throw new Error('Berat badan harus berupa angka positif. Contoh: 5.5 (dalam kg).');
      }

      if (formData.tb && (isNaN(parseFloat(formData.tb)) || parseFloat(formData.tb) <= 0)) {
        throw new Error('Tinggi badan harus berupa angka positif. Contoh: 75 (dalam cm).');
      }

      if (formData.ll && (isNaN(parseFloat(formData.ll)) || parseFloat(formData.ll) <= 0)) {
        throw new Error('Lingkar lengan harus berupa angka positif. Contoh: 14.5 (dalam cm).');
      }

      if (formData.lk && (isNaN(parseFloat(formData.lk)) || parseFloat(formData.lk) <= 0)) {
        throw new Error('Lingkar kepala harus berupa angka positif. Contoh: 45 (dalam cm).');
      }

      // Timeout untuk operasi Firestore (max 10 detik)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Waktu operasi habis. Coba lagi atau periksa koneksi internet.')), 10000);
      });

      let docRef;
      if (editingData && editingData.id) {
        // Mode Edit: Update menggunakan API
        const pelayananList = [];
        if (formData.vitamin_a) pelayananList.push('Vitamin A');
        const pelayananStr = pelayananList.length > 0 ? pelayananList.join(', ') : null;

        const updateData = {
          id: editingData.id,
          nama_anak: formData.nama_anak.trim(),
          nik: formData.nik.trim(),
          jenis_kelamin: formData.jenis_kelamin,
          tgl_lahir: formData.tgl_lahir,
          orang_tua_id: formData.orang_tua_uid,
          alamat: formData.alamat.trim() || '',
          bb: formData.bb ? parseFloat(formData.bb) : null,
          tb: formData.tb ? parseFloat(formData.tb) : null,
          ll: formData.ll ? parseFloat(formData.ll) : null,
          lk: formData.lk ? parseFloat(formData.lk) : null,
          pelayanan_vit_a: formData.vitamin_a
        };
        const response = await api.adminSaveBalita(updateData);
        if (!response.success) {
          throw new Error(response.message || 'Gagal mengupdate data');
        }
        docRef = { id: editingData.id };
      } else {
        // Mode Tambah: Simpan ke Firestore dengan data lengkap
        const pelayananList = [];
        if (formData.vitamin_a) pelayananList.push('Vitamin A');
        const pelayananStr = pelayananList.length > 0 ? pelayananList.join(', ') : null;

        const savePromise = addDoc(collection(db, 'balita'), {
          nama_anak: formData.nama_anak.trim(),
          nik: formData.nik.trim(),
          jenis_kelamin: formData.jenis_kelamin,
          tgl_lahir: formData.tgl_lahir,
          orang_tua_uid: formData.orang_tua_uid,
          nama_ayah: selectedOrangTua.nama_ayah || '',
          nama_ibu: selectedOrangTua.nama_ibu || '',
          nama_ortu: `${selectedOrangTua.nama_ayah || ''} / ${selectedOrangTua.nama_ibu || ''}`.trim(),
          alamat: formData.alamat.trim() || '',
          bb: formData.bb ? parseFloat(formData.bb) : null,
          tb: formData.tb ? parseFloat(formData.tb) : null,
          ll: formData.ll ? parseFloat(formData.ll) : null,
          lk: formData.lk ? parseFloat(formData.lk) : null,
          pelayanan: pelayananStr,
          created_at: new Date(),
          updated_at: new Date()
        });
        docRef = await Promise.race([savePromise, timeoutPromise]);
      }

      // Reset form
      setFormData({
        nama_anak: '',
        nik: '',
        jenis_kelamin: 'L',
        tgl_lahir: '',
        orang_tua_uid: '',
        alamat: '',
        bb: '',
        tb: '',
        ll: '',
        lk: '',
        vitamin_a: false
      });

      // Callback success
      if (onSuccess) {
        onSuccess(docRef.id);
      }

      // Show success toast
      success(`Data balita berhasil ${editingData ? 'diupdate' : 'ditambahkan'}!`);

    } catch (err) {
      console.error('Error adding balita:', err);
      
      // Error handling yang lebih spesifik dengan pesan yang jelas
      let errorMessage = 'Terjadi kesalahan saat menyimpan data balita.';
      
      if (err.code === 'permission-denied') {
        errorMessage = 'Akses ditolak. Anda tidak memiliki izin untuk menyimpan data. Hubungi administrator untuk memperbaiki masalah ini.';
      } else if (err.code === 'unavailable') {
        errorMessage = 'Layanan database tidak tersedia. Periksa koneksi internet Anda dan coba lagi. Jika masalah berlanjut, hubungi administrator.';
      } else if (err.code === 'deadline-exceeded') {
        errorMessage = 'Waktu permintaan habis. Koneksi internet mungkin lambat. Silakan coba lagi.';
      } else if (err.code === 'already-exists') {
        errorMessage = 'Data dengan NIK yang sama sudah ada. Pastikan NIK yang Anda masukkan unik.';
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Terjadi kesalahan tidak terduga. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-white shadow-md border border-gray-200">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">
          {editingData ? 'Edit Data Balita' : 'Tambah Data Balita'}
        </h2>
        
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
            <DateInput
              name="tgl_lahir"
              value={formData.tgl_lahir}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
              placeholder="DD-MM-YYYY (contoh: 15-06-2023)"
            />
          </div>

          {/* Relasi Akun Orang Tua */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Pilih Akun Orang Tua <span className="text-error">*</span></span>
            </label>
            <select
              name="orang_tua_uid"
              value={formData.orang_tua_uid}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">-- Pilih akun orang tua --</option>
              {orangTuaList.map((ot) => (
                <option key={ot.id} value={ot.id}>
                  {ot.nama_ayah && ot.nama_ibu
                    ? `${ot.nama_ayah} & ${ot.nama_ibu} (${ot.username || ot.id})`
                    : (ot.username || ot.id)}
                </option>
              ))}
            </select>
            <label className="label">
              <span className="label-text-alt text-gray-600">
                Nama ayah dan ibu akan diambil dari akun orang tua yang dipilih.
              </span>
            </label>
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

          {/* Data Antropometri */}
          <div className="divider">Data Antropometri (Opsional)</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Berat Badan */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Berat Badan (kg)</span>
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
              />
            </div>

            {/* Tinggi Badan */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Tinggi Badan (cm)</span>
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
              />
            </div>

            {/* Lingkar Lengan */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Lingkar Lengan (cm)</span>
              </label>
              <input
                type="number"
                name="ll"
                value={formData.ll}
                onChange={handleChange}
                placeholder="0.0"
                step="0.1"
                min="0"
                className="input input-bordered w-full"
              />
            </div>

            {/* Lingkar Kepala */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Lingkar Kepala (cm)</span>
              </label>
              <input
                type="number"
                name="lk"
                value={formData.lk}
                onChange={handleChange}
                placeholder="0.0"
                step="0.1"
                min="0"
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {/* Vitamin A */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                name="vitamin_a"
                checked={formData.vitamin_a}
                onChange={(e) => setFormData({...formData, vitamin_a: e.target.checked})}
                className="checkbox checkbox-primary"
              />
              <span className="label-text font-semibold">Vitamin A sudah diberikan</span>
            </label>
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

