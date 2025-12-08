/**
 * ManajemenBalita.jsx
 * 
 * Halaman utama untuk manajemen data balita
 * Menggabungkan FormTambahBalita, FormPemeriksaan, TabelRiwayat, dan Daftar Balita
 */

import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { formatTanggal } from '../../utils/helpers';
import { useToastContext } from '../../contexts/ToastContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormTambahBalita from '../../components/balita/FormTambahBalita';
import FormPemeriksaan from '../../components/balita/FormPemeriksaan';
import TabelRiwayat from '../../components/balita/TabelRiwayat';

function ManajemenBalita() {
  const [activeTab, setActiveTab] = useState('daftar-balita');
  const [refreshKey, setRefreshKey] = useState(0);
  const [balitaList, setBalitaList] = useState([]);
  const [filterNama, setFilterNama] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingData, setEditingData] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, onConfirm: null, message: '' });
  const { success, error } = useToastContext();

  useEffect(() => {
    if (activeTab === 'daftar-balita') {
      loadBalitaList();
    }
  }, [activeTab]);

  const loadBalitaList = async () => {
    try {
      setLoading(true);
      const response = await api.adminGetBalita();
      if (response.success) {
        setBalitaList(response.data || []);
      }
    } catch (error) {
      console.error('Error loading balita:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (id) => {
    // Refresh data jika perlu
    setRefreshKey(prev => prev + 1);
    if (activeTab === 'daftar-balita') {
      loadBalitaList();
    }
    // Reset editing data setelah berhasil
    setEditingData(null);
    // Kembali ke tab daftar setelah edit
    if (activeTab === 'tambah-balita' && editingData) {
      setActiveTab('daftar-balita');
    }
  };

  const handleEdit = (balita) => {
    setEditingData(balita);
    setActiveTab('tambah-balita');
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      onConfirm: async () => {
        try {
          const response = await api.adminDeleteBalita(id);
          if (response.success) {
            loadBalitaList();
            success('Data balita berhasil dihapus');
          } else {
            error('Gagal menghapus: ' + (response.message || 'Unknown error'));
          }
        } catch (err) {
          error('Terjadi kesalahan. Silakan coba lagi.');
          console.error('Delete error:', err);
        }
      },
      message: 'Yakin ingin menghapus data balita ini? Tindakan ini tidak dapat dibatalkan.'
    });
  };

  const filteredBalita = balitaList.filter(b => {
    if (filterNama) {
      const query = filterNama.toLowerCase();
      if (!(b.nama_anak || '').toLowerCase().includes(query) &&
          !(b.nama_ayah || '').toLowerCase().includes(query) &&
          !(b.nama_ibu || '').toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Manajemen Data Balita</h1>
        <p className="text-gray-600">
          Kelola data profil balita dan riwayat pemeriksaan bulanan
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-2 mb-6 shadow-sm flex flex-wrap gap-2">
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'daftar-balita' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => {
            setActiveTab('daftar-balita');
            setEditingData(null);
          }}
        >
          📋 Daftar Balita
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'tambah-balita' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => {
            setActiveTab('tambah-balita');
            setEditingData(null);
          }}
        >
          📝 {editingData ? 'Edit Balita' : 'Tambah Balita'}
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'pemeriksaan' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setActiveTab('pemeriksaan')}
        >
          📊 Pemeriksaan
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'riwayat' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setActiveTab('riwayat')}
        >
          📈 Riwayat
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'daftar-balita' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="card bg-white shadow-md border border-gray-200">
              <div className="card-body">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Filter Nama</span>
                  </label>
                  <input
                    type="text"
                    value={filterNama}
                    onChange={(e) => setFilterNama(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Cari nama anak, ayah, atau ibu..."
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="card bg-white shadow-md border border-gray-200">
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Memuat data...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Nama Anak</th>
                          <th>Orang Tua</th>
                          <th>Tgl Lahir</th>
                          <th>BB (kg)</th>
                          <th>TB (cm)</th>
                          <th>LL (cm)</th>
                          <th>LK (cm)</th>
                          <th>Pelayanan</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBalita.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-8 text-gray-500">
                              Belum ada data balita
                            </td>
                          </tr>
                        ) : (
                          filteredBalita.map((b) => {
                            // Gunakan data terbaru dari pemeriksaan jika ada, fallback ke data balita
                            const displayBB = b.bb_latest || b.bb;
                            const displayTB = b.tb_latest || b.tb;
                            const displayLL = b.ll_latest || b.ll;
                            const displayLK = b.lk_latest || b.lk;
                            
                            return (
                              <tr key={b.id}>
                                <td className="font-semibold">{b.nama_anak}</td>
                                <td>{b.nama_ayah || '-'} / {b.nama_ibu || '-'}</td>
                                <td>{formatTanggal(b.tgl_lahir)}</td>
                                <td>
                                  {displayBB ? `${displayBB}` : '-'}
                                  {b.bb_latest && <span className="text-xs text-green-600 ml-1" title="Data terbaru dari pemeriksaan">●</span>}
                                </td>
                                <td>
                                  {displayTB ? `${displayTB}` : '-'}
                                  {b.tb_latest && <span className="text-xs text-green-600 ml-1" title="Data terbaru dari pemeriksaan">●</span>}
                                </td>
                                <td>
                                  {displayLL ? `${displayLL}` : '-'}
                                  {b.ll_latest && <span className="text-xs text-green-600 ml-1" title="Data terbaru dari pemeriksaan">●</span>}
                                </td>
                                <td>
                                  {displayLK ? `${displayLK}` : '-'}
                                  {b.lk_latest && <span className="text-xs text-green-600 ml-1" title="Data terbaru dari pemeriksaan">●</span>}
                                </td>
                                <td>{b.pelayanan || '-'}</td>
                              <td>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEdit(b)}
                                    className="btn btn-sm btn-primary"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(b.id)}
                                    className="btn btn-sm btn-error"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tambah-balita' && (
          <div className="card border border-gray-200 shadow-sm">
            <FormTambahBalita 
              onSuccess={handleSuccess} 
              editingData={editingData}
            />
          </div>
        )}

        {activeTab === 'pemeriksaan' && (
          <div className="card border border-gray-200 shadow-sm">
            <FormPemeriksaan onSuccess={handleSuccess} />
          </div>
        )}

        {activeTab === 'riwayat' && (
          <div className="card border border-gray-200 shadow-sm">
            <TabelRiwayat key={refreshKey} />
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, onConfirm: null, message: '' })}
        onConfirm={confirmDialog.onConfirm || (() => {})}
        title="Konfirmasi Hapus"
        message={confirmDialog.message}
        type="danger"
      />
    </div>
  );
}

export default ManajemenBalita;

