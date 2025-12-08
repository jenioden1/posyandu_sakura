/**
 * ManajemenBalita.jsx
 * 
 * Halaman utama untuk manajemen data balita
 * Menggabungkan FormTambahBalita, FormPemeriksaan, dan TabelRiwayat
 */

import { useState } from 'react';
import FormTambahBalita from '../../components/balita/FormTambahBalita';
import FormPemeriksaan from '../../components/balita/FormPemeriksaan';
import TabelRiwayat from '../../components/balita/TabelRiwayat';

function ManajemenBalita() {
  const [activeTab, setActiveTab] = useState('tambah-balita');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = (id) => {
    // Refresh data jika perlu
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manajemen Data Balita</h1>
        <p className="text-gray-600">
          Kelola data profil balita dan riwayat pemeriksaan bulanan
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === 'tambah-balita' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('tambah-balita')}
        >
          📝 Tambah Balita
        </button>
        <button
          className={`tab ${activeTab === 'pemeriksaan' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('pemeriksaan')}
        >
          📊 Pemeriksaan
        </button>
        <button
          className={`tab ${activeTab === 'riwayat' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('riwayat')}
        >
          📋 Riwayat
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'tambah-balita' && (
          <FormTambahBalita onSuccess={handleSuccess} />
        )}

        {activeTab === 'pemeriksaan' && (
          <FormPemeriksaan onSuccess={handleSuccess} />
        )}

        {activeTab === 'riwayat' && (
          <TabelRiwayat key={refreshKey} />
        )}
      </div>
    </div>
  );
}

export default ManajemenBalita;

