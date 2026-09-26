const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTli82ISMD1kEMgEnz8IQ9_yi0eNv-ip37C1qF0QFVR9YM7FLy11TeRwOp_4e5wD4WIUEWtheEHfX1F/pub?gid=435625430&single=true&output=csv';

const ALL_TRACKED_FIELDS = [
  // 1. Kependudukan & Pribadi
  { key: 'Nik', label: 'NIK (16 Digit)', category: 'Kependudukan', criticall: true },
  { key: 'Jenis Kelamin', label: 'Jenis Kelamin', category: 'Kependudukan', critical: true },
  { key: 'Tempat Lahir', label: 'Tempat Lahir', category: 'Kependudukan', critical: false },
  { key: 'Tanggal Lahir', label: 'Tanggal Lahir', category: 'Kependudukan', critical: true },
  { key: 'Agama', label: 'Agama', category: 'Kependudukan', critical: false },
  { key: 'Golongan Darah', label: 'Golongan Darah', category: 'Kependudukan', critical: false },
  { key: 'Nomor Kartu Keluarga', label: 'No. Kartu Keluarga', category: 'Kependudukan', critical: false },
  { key: 'Nama Ibu Kandung', label: 'Nama Ibu Kandung', category: 'Kependudukan', critical: false },
  { key: 'Status Pernikahan', label: 'Status Pernikahan', category: 'Kependudukan', critical: false },
  { key: 'Jumlah Anak', label: 'Jumlah Anak', category: 'Kependudukan', critical: false },

  // 2. Kontak & Domisili
  { key: 'Nomor Telepon', label: 'No. Telepon / WhatsApp', category: 'Kontak', critical: true },
  { key: 'Email', label: 'Alamat Email', category: 'Kontak', critical: true },
  { key: 'Alamat Sesuai KTP', label: 'Alamat Sesuai KTP', category: 'Kontak', critical: false },
  { key: 'Alamat Domisili', label: 'Alamat Domisili', category: 'Kontak', critical: false },
  { key: 'Nama Kontak Darurat', label: 'Nama Kontak Darurat', category: 'Kontak', critical: false },
  { key: 'No HP Kontak Darurat', label: 'No. HP Kontak Darurat', category: 'Kontak', critical: false },
  { key: 'Hubungan Kontak Darurat', label: 'Hubungan Kontak Darurat', category: 'Kontak', critical: false },

  // 3. Kepegawaian & Posisi
  { key: 'TMK', label: 'Tanggal Masuk Kerja (TMK)', category: 'Kepegawaian', critical: true },
  { key: 'NIP Baru', label: 'NIP Baru', category: 'Kepegawaian', critical: true },
  { key: 'NIP Lama', label: 'NIP Lama', category: 'Kepegawaian', critical: false },
  { key: 'Departemen', label: 'Departemen', category: 'Kepegawaian', critical: true },
  { key: 'Divisi', label: 'Divisi', category: 'Kepegawaian', critical: false },
  { key: 'Jabatan/Posisi', label: 'Jabatan / Posisi', category: 'Kepegawaian', critical: true },
  { key: 'Level Jabatan', label: 'Level Jabatan', category: 'Kepegawaian', critical: true },
  { key: 'Lokasi Kerja', label: 'Lokasi Kerja', category: 'Kepegawaian', critical: false },

  // 4. Finansial, Pajak & BPJS
  { key: 'NPWP', label: 'NPWP', category: 'Finansial', critical: false },
  { key: 'Status Wajib Pajak', label: 'Status Wajib Pajak (PTKP)', category: 'Finansial', critical: false },
  { key: 'Nomor BPJS Kesehatan', label: 'No. BPJS Kesehatan', category: 'Finansial', critical: false },
  { key: 'Nomor BPJS Ketenagakerjaan', label: 'No. BPJS Ketenagakerjaan', category: 'Finansial', critical: false },
  { key: 'Nama Bank', label: 'Nama Bank Payroll', category: 'Finansial', critical: false },
  { key: 'No Rekening Bank', label: 'Nomor Rekening Bank', category: 'Finansial', critical: false },

  // 5. Pendidikan
  { key: 'Pendidikan Terakhir', label: 'Pendidikan Terakhir', category: 'Pendidikan', critical: true },
  { key: 'Nama Institusi Pendidikan', label: 'Nama Universitas / Sekolah', category: 'Pendidikan', critical: false },
  { key: 'Program Studi (Jurusan)', label: 'Program Studi (Jurusan)', category: 'Pendidikan', critical: false },
  { key: 'Tahun Kelulusan', label: 'Tahun Kelulusan', category: 'Pendidikan', critical: false }
];

let rawEmployees = [];
let filteredEmployees = [];
let currentPage = 1;
const rowsPerPage = 15;
let missingDocChart = null;
let activeMissingField = null;