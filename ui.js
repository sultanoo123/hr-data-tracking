let currentChartStats = [];

// Pemetaan Email PIC 5 Departemen Standar
const DEPT_PIC_EMAILS = {
  'Human Resources (HR)': 'pic.hr@corp-demo.com',
  'Finance & Accounting': 'pic.finance@corp-demo.com',
  'Information Technology (IT)': 'pic.it@corp-demo.com',
  'Sales & Marketing': 'pic.salesmarketing@corp-demo.com',
  'Operations & Supply Chain': 'pic.operations@corp-demo.com',
  'DEFAULT': 'hr.operations@corp-demo.com'
};

// 1. Render Tabel Paginasi
function renderTable() {
  const tbody = document.getElementById('employee-table-body');
  const total = filteredEmployees.length;
  const selectedCategory = document.getElementById('category-audit-filter').value;

  if (total === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400 font-medium">Tidak ada data pegawai yang sesuai filter.</td></tr>`;
    document.getElementById('pagination-info').innerText = '0 data';
    return;
  }

  const start = (currentPage - 1) * rowsPerPage;
  const end = Math.min(start + rowsPerPage, total);
  const pageData = filteredEmployees.slice(start, end);

  tbody.innerHTML = pageData.map(emp => {
    let displayedMissing = emp.missing;
    let categoryTotal = ALL_TRACKED_FIELDS.length;
    let categoryFilled = categoryTotal - emp.missing.length;
    let displayScore = emp.score;

    if (selectedCategory !== 'ALL') {
      const categoryFields = ALL_TRACKED_FIELDS.filter(f => f.category === selectedCategory).map(f => f.key);
      displayedMissing = emp.missing.filter(k => categoryFields.includes(k));
      categoryTotal = categoryFields.length;
      categoryFilled = categoryTotal - displayedMissing.length;
      displayScore = Math.round((categoryFilled / categoryTotal) * 100);
    }

    const missingBadges = displayedMissing.length
      ? displayedMissing.slice(0, 2).map(m => `<span class="inline-block bg-rose-50 text-rose-700 border border-rose-200 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-mono m-0.5">${m}</span>`).join('') + (displayedMissing.length > 2 ? `<span class="text-[9px] sm:text-[10px] text-slate-400 font-medium ml-0.5">+${displayedMissing.length - 2}</span>` : '')
      : `<span class="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded">Lengkap</span>`;

    const scoreColor = displayScore === 100 ? 'text-emerald-700' : displayScore >= 70 ? 'text-amber-700' : 'text-rose-700';

    return `
      <tr onclick="openEmployeeDetail(${emp.id})" class="hover:bg-slate-50 cursor-pointer transition active:bg-slate-100">
        <td class="py-2.5 px-2">
          <p class="font-semibold text-slate-900 text-xs sm:text-sm truncate max-w-[130px] sm:max-w-none">${emp.name}</p>
          <p class="text-[10px] text-slate-400 font-mono">NIK: ${emp.nik}</p>
        </td>
        <td class="py-2.5 px-2">
          <p class="text-slate-800 text-xs font-medium truncate max-w-[120px] sm:max-w-none">${emp.dept}</p>
          <p class="text-slate-400 text-[10px] truncate max-w-[120px] sm:max-w-none">${emp.jabatan}</p>
        </td>
        <td class="py-2.5 px-2 text-center">
          ${missingBadges}
        </td>
        <td class="py-2.5 px-2 text-center font-semibold text-xs ${scoreColor}">
          <div>${displayScore}%</div>
          ${selectedCategory !== 'ALL' ? `<div class="text-[9px] text-slate-400 font-normal">Tot: ${emp.score}%</div>` : ''}
        </td>
        <td class="py-2.5 px-2 text-right">
          <span class="text-xs text-slate-500 hover:text-slate-900 font-bold">&rarr;</span>
        </td>
      </tr>
    `;
  }).join('');

  document.getElementById('pagination-info').innerText = `${start + 1}–${end} dari ${total.toLocaleString('id-ID')}`;
  document.getElementById('btn-prev-page').disabled = (currentPage === 1);
  document.getElementById('btn-next-page').disabled = (end >= total);
}

// 2. Update KPI Cards
function updateKPIs() {
  const total = rawEmployees.length;
  const complete = rawEmployees.filter(e => e.missing.length === 0).length;
  const critical = total - complete;
  const avgScore = total ? Math.round(rawEmployees.reduce((acc, curr) => acc + curr.score, 0) / total) : 0;

  document.getElementById('kpi-total-emp').innerText = total.toLocaleString('id-ID');
  document.getElementById('kpi-complete-emp').innerText = complete.toLocaleString('id-ID');
  document.getElementById('kpi-critical-emp').innerText = critical.toLocaleString('id-ID');
  
  const complianceEl = document.getElementById('kpi-compliance-rate');
  const badgeEl = document.getElementById('kpi-compliance-badge');
  complianceEl.innerText = `${avgScore}%`;

  if (avgScore >= 80) {
    badgeEl.className = 'text-[10px] sm:text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded';
    badgeEl.innerText = 'Baik';
  } else if (avgScore >= 50) {
    badgeEl.className = 'text-[10px] sm:text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded';
    badgeEl.innerText = 'Audit';
  } else {
    badgeEl.className = 'text-[10px] sm:text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded';
    badgeEl.innerText = 'Kritis';
  }
}

// 3. Inisialisasi Chart (Responsif Mobile)
function initOrUpdateChart() {
  const selectedCategory = document.getElementById('category-audit-filter').value;
  
  let targetFields = ALL_TRACKED_FIELDS;
  if (selectedCategory !== 'ALL') {
    targetFields = ALL_TRACKED_FIELDS.filter(f => f.category === selectedCategory);
  }

  let stats = targetFields.map(f => ({
    key: f.key,
    label: f.label,
    count: rawEmployees.filter(e => e.missing.includes(f.key)).length
  }));

  stats.sort((a, b) => b.count - a.count);

  if (selectedCategory === 'ALL') {
    stats = stats.slice(0, 8);
    document.getElementById('chart-title').innerText = 'Top 8 Atribut Kosong';
  } else {
    document.getElementById('chart-title').innerText = `Atribut Kosong: ${selectedCategory}`;
  }

  currentChartStats = stats;

  const labels = stats.map(s => s.label);
  const dataCounts = stats.map(s => s.count);

  const canvas = document.getElementById('missingDocChart');
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 400, 0);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(1, '#059669');

  if (missingDocChart) {
    missingDocChart.data.labels = labels;
    missingDocChart.data.datasets[0].data = dataCounts;
    missingDocChart.data.datasets[0].backgroundColor = gradient;
    missingDocChart.update();
    return;
  }

  missingDocChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Jumlah Kosong',
        data: dataCounts,
        backgroundColor: gradient,
        borderRadius: 4,
        barThickness: window.innerWidth < 640 ? 12 : 16
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 5, bottom: 5, right: 10 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { size: 11, weight: 'bold' },
          bodyFont: { size: 10 },
          padding: 8,
          cornerRadius: 6,
          callbacks: {
            label: function(context) {
              const total = rawEmployees.length || 1;
              const val = context.raw || 0;
              const pct = ((val / total) * 100).toFixed(1);
              return ` ${val.toLocaleString('id-ID')} pegawai (${pct}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: '#f1f5f9' },
          ticks: { font: { size: 9 }, color: '#64748b' }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 10, weight: '500' }, color: '#334155' }
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const selected = currentChartStats[index];
          if (selected) {
            activeMissingField = selected.key;
            applyFilters();
            document.getElementById('table-subtitle').innerText = `Filter: ${selected.label}`;
            document.getElementById('reset-filter-btn').classList.remove('hidden');
          }
        }
      }
    }
  });
}

// 4. Populasi Dropdown Departemen
function populateDeptDropdown() {
  const depts = [...new Set(rawEmployees.map(e => e.dept))].filter(Boolean).sort();
  const select = document.getElementById('dept-filter');
  select.innerHTML = '<option value="ALL">Semua Departemen</option>';
  depts.forEach(d => {
    select.innerHTML += `<option value="${d}">${d}</option>`;
  });
}

// 5. Buka Drawer Pegawai (Dengan Sticky Action Footer di Layar Mobile)
function openEmployeeDetail(id) {
  const emp = rawEmployees.find(e => e.id === id);
  if (!emp) return;

  const categories = ['Kependudukan', 'Kontak', 'Kepegawaian', 'Finansial', 'Pendidikan'];
  
  const categorySectionsHtml = categories.map(catName => {
    const fieldsInCat = ALL_TRACKED_FIELDS.filter(f => f.category === catName);
    const listItems = fieldsInCat.map(f => {
      const isFilled = emp.fieldsAudit[f.key];
      const val = isFilled ? formatDisplayValue(f.key, emp.raw[f.key]) : '-';
      return `
        <div class="flex items-center justify-between p-2 rounded border text-xs ${isFilled ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'}">
          <div class="pr-2 truncate">
            <span class="font-medium ${isFilled ? 'text-slate-800' : 'text-rose-900'}">${f.label}</span>
            <p class="text-[11px] text-slate-500 truncate">${isFilled ? val : '<span class="text-rose-600 italic">Data Belum Diisi</span>'}</p>
          </div>
          <span class="text-[10px] font-semibold shrink-0 px-2 py-0.5 rounded ${isFilled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
            ${isFilled ? 'Lengkap' : 'Kosong'}
          </span>
        </div>
      `;
    }).join('');

    return `
      <div class="space-y-1.5">
        <h5 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${catName}</h5>
        <div class="space-y-1">${listItems}</div>
      </div>
    `;
  }).join('');

  // Validasi kontak
  const cleanWa = normalizePhoneNumber(emp.phone);
  const hasPhone = Boolean(cleanWa);
  const hasEmail = isValidEmail(emp.email);

  const missingListFormatted = emp.missing.map(m => `• ${m}`).join('\n');
  const missingTextShort = emp.missing.slice(0, 8).join(', ') + (emp.missing.length > 8 ? ' dan atribut lainnya' : '');

  // Template Pesan Email & WA
  const emailSubject = `[PENTING] Pengingat Kelengkapan Master Data HR - ${emp.name}`;
  const emailBodyText = `Yth. ${emp.name},\n\nBerdasarkan audit kelengkapan master data HR, skor Anda ${emp.score}% (${35 - emp.missing.length}/35 terisi).\n\nMohon segera melengkapi atribut berikut:\n${missingListFormatted}\n\nTerima kasih.\nHR Operations`;

  const targetEmailAddress = hasEmail ? emp.email : '';
  const gmailDirectUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmailAddress)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;

  const picEmail = DEPT_PIC_EMAILS[emp.dept] || DEPT_PIC_EMAILS['DEFAULT'];
  const escalateEmailBody = `Yth. PIC / Pimpinan Departemen ${emp.dept},\n\nMohon bantuannya menindaklanjuti kelengkapan data pegawai yang belum memiliki kontak terdaftar:\n\nNama: ${emp.name}\nNIK: ${emp.nik}\nJabatan: ${emp.jabatan}\n\nAtribut Belum Terisi:\n${missingListFormatted}\n\nTerima kasih.`;
  const gmailEscalateUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(picEmail)}&su=${encodeURIComponent(`[ESKALASI HR] Kelengkapan Data: ${emp.name}`)}&body=${encodeURIComponent(escalateEmailBody)}`;

  // Konten Profil & Checklist
  document.getElementById('drawer-content').innerHTML = `
    <div class="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-slate-800 text-white font-bold rounded-lg flex items-center justify-center text-base sm:text-lg shrink-0">
          ${emp.name.charAt(0)}
        </div>
        <div class="truncate">
          <h3 class="font-bold text-slate-900 text-sm sm:text-base truncate">${emp.name}</h3>
          <p class="text-xs text-slate-500 truncate">${emp.jabatan} &bull; ${emp.dept}</p>
          <p class="text-[11px] text-slate-400 font-mono mt-0.5">NIK: ${emp.nik}</p>
        </div>
      </div>
      <div class="mt-3 pt-3 border-t border-slate-200/80 flex justify-between text-xs">
        <div><span class="text-slate-500">Kelengkapan:</span> <span class="font-bold text-slate-900">${emp.score}% (${35 - emp.missing.length}/35)</span></div>
        <div><span class="text-slate-500">Status:</span> <span class="font-semibold text-slate-900">${emp.statusKerja}</span></div>
      </div>
    </div>

    <!-- 5 Kategori Checklist -->
    <div class="space-y-4">
      ${categorySectionsHtml}
    </div>
  `;

  // Tombol Aksi di Bagian Bawah yang Melayang (Sticky Footer)
  let actionButtonsHtml = '';
  if (hasEmail || hasPhone) {
    actionButtonsHtml = `
      ${hasEmail ? `
        <a href="${gmailDirectUrl}" target="_blank" class="w-full flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition text-xs shadow-sm">
          Buka & Kirim via Gmail Web (${emp.email})
        </a>
      ` : ''}

      ${hasPhone ? `
        <a href="https://api.whatsapp.com/send?phone=${cleanWa}&text=${encodeURIComponent(`Halo ${emp.name},\n\nMohon melengkapi atribut master data SDM yang kosong:\n${missingListFormatted}\n\nTerima kasih.`)}" target="_blank" class="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition text-xs shadow-sm">
          Kirim Notifikasi WhatsApp (+${cleanWa})
        </a>
      ` : ''}
    `;
  } else {
    actionButtonsHtml = `
      <div class="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-lg text-xs space-y-0.5">
        <p class="font-bold text-[11px]">Kontak Pribadi Kosong</p>
        <p class="text-[10px] text-amber-800">Sistem mengarahkan ke PIC Departemen <b>${emp.dept}</b>.</p>
      </div>

      <a href="${gmailEscalateUrl}" target="_blank" class="w-full flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition text-xs shadow-sm">
        Eskalasi ke Gmail PIC (${picEmail})
      </a>

      <button onclick="copyAuditSummary('${encodeURIComponent(emp.name)}', '${encodeURIComponent(emp.dept)}', '${encodeURIComponent(missingTextShort)}')" class="w-full flex items-center justify-center bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-medium py-2 rounded-lg transition text-xs">
        Salin Ringkasan Audit
      </button>
    `;
  }

  document.getElementById('drawer-actions-container').innerHTML = actionButtonsHtml;

  document.getElementById('drawer-backdrop').classList.remove('hidden');
  document.getElementById('detail-drawer').classList.remove('translate-x-full');
}

function closeDrawer() {
  document.getElementById('detail-drawer').classList.add('translate-x-full');
  document.getElementById('drawer-backdrop').classList.add('hidden');
}

// Salin Ringkasan Audit
function copyAuditSummary(name, dept, missing) {
  const decodedName = decodeURIComponent(name);
  const decodedDept = decodeURIComponent(dept);
  const decodedMissing = decodeURIComponent(missing);
  const text = `[AUDIT HR DATA QUALITY]\nNama: ${decodedName}\nDepartemen: ${decodedDept}\nAtribut Belum Terisi:\n${decodedMissing}\n\nMohon bantuannya untuk menindaklanjuti kelengkapan data pegawai tersebut.`;
  
  navigator.clipboard.writeText(text).then(() => {
    alert('Ringkasan audit berhasil disalin ke clipboard!');
  }).catch(() => {
    alert('Gagal menyalin ke clipboard.');
  });
}