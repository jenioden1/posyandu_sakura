export const BULAN_ORDER = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

export const BULAN_OPTIONS = [
  { code: "Jan", label: "Januari" },
  { code: "Feb", label: "Februari" },
  { code: "Mar", label: "Maret" },
  { code: "Apr", label: "April" },
  { code: "Mei", label: "Mei" },
  { code: "Jun", label: "Juni" },
  { code: "Jul", label: "Juli" },
  { code: "Agu", label: "Agustus" },
  { code: "Sep", label: "September" },
  { code: "Okt", label: "Oktober" },
  { code: "Nov", label: "November" },
  { code: "Des", label: "Desember" }
]

export function formatTanggal(tgl) {
  if (!tgl) return "-"
  const d = new Date(tgl)
  if (isNaN(d.getTime())) return tgl
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function calculateUmur(tglLahir) {
  if (!tglLahir) return "-"
  const lahir = new Date(tglLahir)
  const sekarang = new Date()
  if (isNaN(lahir.getTime())) return "-"
  
  let tahun = sekarang.getFullYear() - lahir.getFullYear()
  let bulan = sekarang.getMonth() - lahir.getMonth()
  let hari = sekarang.getDate() - lahir.getDate()
  
  if (hari < 0) {
    bulan--
    const hariTerakhirBulan = new Date(sekarang.getFullYear(), sekarang.getMonth(), 0).getDate()
    hari += hariTerakhirBulan
  }
  
  if (bulan < 0) {
    tahun--
    bulan += 12
  }
  
  if (tahun > 0) {
    return `${tahun} tahun ${bulan} bulan`
  } else if (bulan > 0) {
    return `${bulan} bulan ${hari} hari`
  } else {
    return `${hari} hari`
  }
}

export function sortPenimbangan(penArr) {
  if (!Array.isArray(penArr)) return []
  return [...penArr].sort((a, b) => {
    const ia = BULAN_ORDER.indexOf(a.bulan_code)
    const ib = BULAN_ORDER.indexOf(b.bulan_code)
    return ia - ib
  })
}

