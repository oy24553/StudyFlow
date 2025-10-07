export function exportCsv(filename, rows, headers) {
    const head = headers.map(h => h.label).join(',');
    const csv = [head, ...rows.map(r => headers.map(h => escapeCsv(h.value(r))).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

function escapeCsv(v) {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/\r?\n/g, ' ');
    if (/[",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}
