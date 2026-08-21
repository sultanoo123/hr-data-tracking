function processEmployeeData(dataRows) {
  return dataRows.map((row, index) => {
    const missingAll = [];
    const fieldsAudit = {};

    ALL_TRACKED_FIELDS.forEach(field => {
      const val = row[field.key];
      const empty = isValueEmpty(val, field.key);
      fieldsAudit[field.key] = !empty;
      if (empty) missingAll.push(field.key);
    });

    const totalFields = ALL_TRACKED_FIELDS.length;
    const filledCount = totalFields - missingAll.length;
    const completenessScore = Math.round((filledCount / totalFields) * 100);

    return {
      id: index + 1,
      nik: row['NIK'] || '-',
      nip: row['NIP Baru'] || row['NIP Lama'] || '-',
      name: row['Nama Lengkap'] || `Pegawai #${index + 1}`,
      dept: row['Direktorat'] || row['Divisi'] || row['PT'] || 'Umum',
      jabatan: row['Jabatan/Posisi'] || row['Level Jabatan'] || '-',
      phone: row['Nomor Telepon'] || '',
      email: row['Email'] || '',
      statusKerja: row['Status Pegawai'] || 'Aktif',
      fieldsAudit: fieldsAudit,
      missing: missingAll,
      score: completenessScore,
      status: missingAll.length === 0 ? 'GREEN' : 'RED',
      raw: row
    };
  });
}