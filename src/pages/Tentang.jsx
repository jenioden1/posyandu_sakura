import { Link } from 'react-router-dom';

function Tentang() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Tentang Posyandu Sakura</h1>
        <p className="text-base sm:text-lg text-gray-600 px-4">
          Informasi lengkap tentang Posyandu Sakura dan pelayanan kesehatan balita
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Visi Misi */}
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎯</span> Visi & Misi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Visi</h3>
                <p className="text-gray-600">
                  Menjadi posyandu terdepan dalam pelayanan kesehatan balita yang berkualitas, 
                  terintegrasi dengan teknologi modern untuk mendukung tumbuh kembang anak yang optimal.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Misi</h3>
                <ul className="text-gray-600 space-y-2 list-disc list-inside">
                  <li>Menyediakan pelayanan kesehatan balita yang mudah diakses</li>
                  <li>Meningkatkan kualitas pemantauan tumbuh kembang anak</li>
                  <li>Menggunakan teknologi untuk analisis status gizi yang akurat</li>
                  <li>Memberdayakan orang tua dalam pemantauan kesehatan anak</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Kontak */}
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📍</span> Informasi Kontak
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Alamat</h3>
                <p className="text-gray-600">
                  Jl. Sindang Hurip No.21, RT.02/RW.07, Cikalang, Kec. Tawang, 
                  Kab. Tasikmalaya, Jawa Barat 46115
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Jam Operasional</h3>
                  <p className="text-gray-600">
                    <strong>Senin - Jumat:</strong> 08:00 - 14:00 WIB<br />
                    <strong>Sabtu:</strong> 08:00 - 12:00 WIB<br />
                    <strong>Minggu:</strong> Tutup
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Pelayanan</h3>
                  <ul className="text-gray-600 space-y-1 list-disc list-inside">
                    <li>Pemeriksaan Tumbuh Kembang</li>
                    <li>Penimbangan & Pengukuran</li>
                    <li>Analisis Status Gizi (WHO)</li>
                    <li>Konsultasi Gizi</li>
                    <li>Pemberian Vitamin A</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pelayanan */}
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🏥</span> Pelayanan yang Tersedia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">📊 Pemeriksaan Rutin</h3>
                <p className="text-sm text-gray-600">
                  Pemeriksaan bulanan untuk memantau pertumbuhan dan perkembangan balita, 
                  termasuk pengukuran berat badan, tinggi badan, lingkar kepala, dan lingkar lengan.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">📈 Analisis Status Gizi</h3>
                <p className="text-sm text-gray-600">
                  Analisis status gizi menggunakan standar WHO (Z-Score) untuk menentukan 
                  status gizi balita secara akurat dan terkomputerisasi.
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">💊 Pemberian Vitamin</h3>
                <p className="text-sm text-gray-600">
                  Pemberian Vitamin A dan suplemen gizi lainnya sesuai dengan program 
                  kesehatan nasional untuk balita.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">💬 Konsultasi</h3>
                <p className="text-sm text-gray-600">
                  Konsultasi gizi dan kesehatan balita oleh kader posyandu yang terlatih 
                  untuk membantu orang tua dalam merawat anak.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Teknologi */}
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💻</span> Teknologi yang Digunakan
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Posyandu Sakura menggunakan sistem terkomputerisasi berbasis Cloud Computing 
                untuk memberikan pelayanan yang lebih akurat dan efisien.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">☁️</div>
                  <h3 className="font-semibold text-gray-800 mb-1">Cloud Computing</h3>
                  <p className="text-xs text-gray-600">
                    Serverless Functions untuk analisis data
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="font-semibold text-gray-800 mb-1">Standar WHO</h3>
                  <p className="text-xs text-gray-600">
                    Analisis menggunakan Z-Score WHO
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">📱</div>
                  <h3 className="font-semibold text-gray-800 mb-1">Akses Digital</h3>
                  <p className="text-xs text-gray-600">
                    Dashboard untuk orang tua
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Keunggulan */}
        <div className="card bg-white shadow-md border border-gray-200">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>⭐</span> Keunggulan Posyandu Sakura
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Akurat & Terkomputerisasi</h3>
                  <p className="text-sm text-gray-600">
                    Perhitungan status gizi dilakukan secara otomatis menggunakan standar WHO, 
                    mengurangi human error dan meningkatkan akurasi.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Akses Mudah untuk Orang Tua</h3>
                  <p className="text-sm text-gray-600">
                    Orang tua dapat mengakses data anak mereka kapan saja melalui dashboard digital, 
                    melihat grafik perkembangan dan riwayat pemeriksaan.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Data Real-time</h3>
                  <p className="text-sm text-gray-600">
                    Data pemeriksaan tersimpan secara real-time di cloud, memungkinkan akses 
                    cepat dan update otomatis tanpa perlu refresh halaman.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Standar Internasional</h3>
                  <p className="text-sm text-gray-600">
                    Menggunakan standar WHO Growth Standards untuk analisis status gizi, 
                    memastikan hasil yang akurat dan dapat dipertanggungjawabkan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cara Bergabung */}
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>👨‍👩‍👧</span> Cara Bergabung
            </h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <span className="font-bold text-blue-600">1.</span>
                <p>Datang ke Posyandu Sakura pada jam operasional dengan membawa KTP dan Kartu Keluarga</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-blue-600">2.</span>
                <p>Daftarkan anak Anda ke kader posyandu untuk mendapatkan akun orang tua</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-blue-600">3.</span>
                <p>Setelah terdaftar, Anda akan mendapatkan akses ke dashboard digital untuk memantau perkembangan anak</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-blue-600">4.</span>
                <p>Ikuti jadwal pemeriksaan rutin bulanan untuk memantau tumbuh kembang anak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-6">
          <Link 
            to="/" 
            className="btn btn-primary btn-lg"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Tentang;

