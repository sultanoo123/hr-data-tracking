// Filter Gabungan
function applyFilters() {
  const dept = document.getElementById('dept-filter').value;
  const status = document.getElementById('status-filter').value;
  const category = document.getElementById('category-audit-filter').value;
  const search = document.getElementById('search-input').value.toLowerCase().trim();

  filteredEmployees = rawEmployees.filter(emp => {
    const matchDept = (dept === 'ALL' || emp.dept === dept);
    const matchStatus = (status === 'ALL' || emp.status === status);
    
    let matchMissing = true;
    if (activeMissingField) {
      matchMissing = emp.missing.includes(activeMissingField);
    } else if (category !== 'ALL') {
      const catFields = ALL_TRACKED_FIELDS.filter(f => f.category === category).map(f => f.key);
      if (status === 'RED') {
        matchMissing = emp.missing.some(m => catFields.includes(m));
      }
    }

    const matchSearch = emp.name.toLowerCase().includes(search) || 
                        String(emp.nik).includes(search) || 
                        String(emp.nip).toLowerCase().includes(search) ||
                        emp.dept.toLowerCase().includes(search) ||
                        emp.jabatan.toLowerCase().includes(search);

    return matchDept && matchStatus && matchMissing && matchSearch;
  });

  currentPage = 1;
  renderTable();
}

// Multi-Tier Fetch Engine (Otomatis Menembus Blokir CORS Browser)
async function fetchCsvWithCorsBypass(url) {
  let targetUrl = url.trim();

  // 1. Normalisasi jika link berformat Google Sheet edit biasa
  if (targetUrl.includes('/edit') || (targetUrl.includes('/d/') && !targetUrl.includes('/pub'))) {
    const sheetIdMatch = targetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = targetUrl.match(/gid=([0-9]+)/);
    if (sheetIdMatch) {
      const sheetId = sheetIdMatch[1];
      const gid = gidMatch ? gidMatch[1] : '0';
      targetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
    }
  }

  // 2. Jalur 1: Fetch Langsung
  try {
    const res = await fetch(targetUrl);
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 50) return text;
    }
  } catch (e) {
    console.warn("Direct fetch terhalang CORS, beralih ke proxy...", e);
  }

  // 3. Jalur 2: Bypass via Proxy AllOrigins
  try {
    const proxyUrl1 = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl1);
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 50) return text;
    }
  } catch (e) {
    console.warn("Proxy 1 gagal, mencoba proxy cadangan...", e);
  }

  // 4. Jalur 3: Bypass via CorsProxy IO
  try {
    const proxyUrl2 = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl2);
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 50) return text;
    }
  } catch (e) {
    console.error("Seluruh jalur pengambilan data gagal.", e);
  }

  throw new Error("Gagal mengunduh CSV. Periksa koneksi internet atau link publikasi.");
}

// Fetch Super Cepat & Pemrosesan Langsung ke Memori RAM
async function loadDataFromGoogleSheet() {
  const statusBtn = document.getElementById('sync-status-text');
  if (statusBtn) statusBtn.innerText = 'Mengunduh Data Live...';

  try {
    const csvText = await fetchCsvWithCorsBypass(GOOGLE_SHEET_CSV_URL);
    const workbook = XLSX.read(csvText, { type: 'string' });
    const sheetName = workbook.SheetNames[0];
    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!rawData.length) throw new Error('Data sheet kosong');

    // Proses 23.804 data langsung ke variabel global RAM
    rawEmployees = processEmployeeData(rawData);
    filteredEmployees = [...rawEmployees];

    populateDeptDropdown();
    updateKPIs();
    initOrUpdateChart();
    renderTable();

    if (statusBtn) statusBtn.innerText = 'Data Terupdate';
    setTimeout(() => {
      if (statusBtn) statusBtn.innerText = 'Sinkronkan Data Live';
    }, 2000);
  } catch (error) {
    console.error('Data Fetch Error:', error);
    if (statusBtn) statusBtn.innerText = 'Gagal Sinkronisasi';
    
    const tbody = document.getElementById('employee-table-body');
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="py-8 text-center text-rose-600 font-medium">
          ${error.message}
        </td>
      </tr>
    `;
  }
}

// Inisialisasi & Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  if (GOOGLE_SHEET_CSV_URL && !GOOGLE_SHEET_CSV_URL.includes('xxxxxx')) {
    loadDataFromGoogleSheet();
  }

  const btnSync = document.getElementById('btn-sync-sheets');
  if (btnSync) {
    btnSync.addEventListener('click', loadDataFromGoogleSheet);
  }

  document.getElementById('category-audit-filter').addEventListener('change', () => {
    activeMissingField = null;
    initOrUpdateChart();
    applyFilters();
  });
  document.getElementById('dept-filter').addEventListener('change', applyFilters);
  document.getElementById('status-filter').addEventListener('change', applyFilters);
  document.getElementById('search-input').addEventListener('input', applyFilters);

  document.getElementById('btn-prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  document.getElementById('btn-next-page').addEventListener('click', () => {
    if (currentPage * rowsPerPage < filteredEmployees.length) {
      currentPage++;
      renderTable();
    }
  });

  document.getElementById('reset-filter-btn').addEventListener('click', () => {
    activeMissingField = null;
    document.getElementById('category-audit-filter').value = 'ALL';
    document.getElementById('dept-filter').value = 'ALL';
    document.getElementById('status-filter').value = 'ALL';
    document.getElementById('search-input').value = '';
    document.getElementById('table-subtitle').innerText = 'Menampilkan seluruh data karyawan';
    document.getElementById('reset-filter-btn').classList.add('hidden');
    initOrUpdateChart();
    applyFilters();
  });

  document.getElementById('close-drawer-btn').addEventListener('click', closeDrawer);
  document.getElementById('drawer-backdrop').addEventListener('click', closeDrawer);
});