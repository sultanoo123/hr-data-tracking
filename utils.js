// Pengecekan Nilai Kosong (Mendeteksi teks dummy seperti 0, null, -, dll.)
function isValueEmpty(val, fieldKey = '') {
  if (val === null || val === undefined) return true;
  const str = String(val).trim().toLowerCase();

  // Nilai kosong umum
  if (str === '' || str === 'null' || str === '-' || str === 'undefined' || str === '#n/a' || str === 'nan') {
    return true;
  }

  // Khusus email, nomor telepon, NIK, dan dokumen: angka 0 dianggap kosong
  if (str === '0') {
    if (fieldKey === 'Jumlah Anak') return false; // 0 anak adalah nilai sah
    return true;
  }

  return false;
}

// Normalisasi Nomor WhatsApp (Menangani 08..., 8..., 628..., dan +628...)
function normalizePhoneNumber(phone) {
  if (isValueEmpty(phone, 'Nomor Telepon')) return '';
  let digits = String(phone).replace(/[^0-9]/g, '');
  if (!digits || digits === '0') return '';

  if (digits.startsWith('08')) {
    return '62' + digits.slice(1);
  } else if (digits.startsWith('8')) {
    return '62' + digits;
  } else if (digits.startsWith('62')) {
    return digits;
  } else if (digits.length >= 9) {
    return '62' + digits;
  }

  return '';
}

// Validasi Alamat Email Asli
function isValidEmail(email) {
  if (isValueEmpty(email, 'Email')) return false;
  const str = String(email).trim().toLowerCase();
  return str.includes('@') && str.includes('.') && str.length > 5;
}

// Formatter Tanggal & Tampilan
function formatDisplayValue(key, val) {
  if (isValueEmpty(val, key)) return '-';
  const str = String(val).trim();

  const isDateField = key.toLowerCase().includes('tanggal') || key.toUpperCase() === 'TMK';
  if (isDateField || (str.includes('T') && (str.endsWith('Z') || str.includes('+') || str.includes('-')))) {
    const dateObj = new Date(str);
    if (!isNaN(dateObj.getTime())) {
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  return str;
}