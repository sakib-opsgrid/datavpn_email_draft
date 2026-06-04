const OPS = ['Grameenphone', 'Robi', 'Teletalk', 'Banglalink'];
const OP_SHORT = { Grameenphone: 'GP', Robi: 'RB', Teletalk: 'TT', Banglalink: 'BL' };

document.getElementById('rawData').addEventListener('input', updateFromData);

function updateFromData() {
  const text = document.getElementById('rawData').value.trim();
  if (!text) {
    document.getElementById('rowCount').textContent = '0 rows detected';
    document.getElementById('dateRangeDisplay').textContent = '—';
    return;
  }
  const rows = parseData(text);
  document.getElementById('rowCount').textContent = `${rows.length} rows detected`;

  if (rows.length > 0) {
    // Get date range directly from data
    const dates = rows.map(r => r.date).sort();
    const startStr = dates[0];
    const endStr = dates[dates.length - 1];
    document.getElementById('dateRangeDisplay').textContent =
      `Data period: ${fmtDate(startStr)} – ${fmtDate(endStr)}`;
  }
}

function fmtDate(d) {
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
}

function remark(avg) {
  const f = Math.floor(avg);
  if (f <= 2) return 'Normal';
  if (f <= 4) return 'Higher than Normal';
  if (f <= 6) return 'Moderately Higher than Normal';
  return 'Significantly Higher than Normal';
}

function parseData(text) {
  const rows = [];
  text.trim().split('\n').forEach(line => {
    const parts = line.split('\t');
    const date = (parts[0] || '').trim();
    const op = (parts[1] || '').trim();
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/) || !OPS.includes(op)) return;
    rows.push({ date, op });
  });
  return rows;
}

function generate() {
  const errEl = document.getElementById('errorMsg');
  errEl.textContent = '';

  const senderName = document.getElementById('senderName').value.trim();
  if (!senderName) { errEl.textContent = 'Please enter your name.'; return; }

  const rawText = document.getElementById('rawData').value.trim();
  if (!rawText) { errEl.textContent = 'Please paste sheet data.'; return; }

  const rows = parseData(rawText);
  if (!rows.length) { errEl.textContent = 'No valid rows found. Check format: date TAB operator.'; return; }

  // Date range from data itself
  const dates = rows.map(r => r.date).sort();
  const startStr = dates[0];
  const endStr = dates[dates.length - 1];

  // Build per-operator stats (blank days excluded)
  const opDays = {};
  const opHits = {};
  OPS.forEach(op => { opDays[op] = new Set(); opHits[op] = 0; });

  rows.forEach(({ date, op }) => {
    opDays[op].add(date);
    opHits[op]++;
  });

  const stats = OPS.map(op => {
    const total = opHits[op];
    const days = opDays[op].size;
    const avg = days > 0 ? total / days : 0;
    return {
      name: `${op} (${OP_SHORT[op]})`,
      total,
      avg: avg.toFixed(1),
      remark: remark(avg)
    };
  });

  // Grand total
  const allDates = new Set(rows.map(r => r.date));
  const grandTotal = stats.reduce((s, o) => s + o.total, 0);
  const grandAvg = allDates.size > 0 ? grandTotal / allDates.size : 0;

  renderPreview({ stats, grandTotal, grandAvg, startStr, endStr, senderName });
  buildCopySource({ stats, grandTotal, grandAvg, startStr, endStr, senderName });

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('emailPreview').style.display = 'flex';
  document.getElementById('btnCopy').style.display = 'inline-block';
  document.getElementById('sigName').textContent = senderName;
}

function renderPreview({ stats, grandTotal, grandAvg, startStr, endStr, senderName }) {
  const subj = `DATA VPN (P2P) Health Summary | Last 15 Days (${fmtDate(startStr)} – ${fmtDate(endStr)})`;
  document.getElementById('previewSubject').textContent = 'Subject: ' + subj;
  document.getElementById('previewIntro').textContent =
    `Please find below the Network Fluctuation (P2P / DATA VPN) Health Summary for the last 15 days (${fmtDate(startStr)} – ${fmtDate(endStr)}).`;
  document.getElementById('previewTableTitle').textContent = 'Network (P2P / DATA VPN) — MNO Health Summary';
  document.getElementById('previewPeriod').textContent = `Period: ${fmtDate(startStr)} – ${fmtDate(endStr)}`;
  document.getElementById('sigName').textContent = senderName;

  const table = document.getElementById('previewTable');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Operator</th>
        <th class="c">Total Hits</th>
        <th class="c">Daily Avg</th>
        <th>Remark</th>
      </tr>
    </thead>
    <tbody>
      ${stats.map(s => `
        <tr>
          <td>${s.name}</td>
          <td class="c">${s.total}</td>
          <td class="c">${s.avg}</td>
          <td>${s.remark}</td>
        </tr>`).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td>Total</td>
        <td class="c">${grandTotal}</td>
        <td class="c">${grandAvg.toFixed(1)}</td>
        <td>${remark(grandAvg)}</td>
      </tr>
    </tfoot>`;
}

function buildCopySource({ stats, grandTotal, grandAvg, startStr, endStr, senderName }) {
  const fs = 'font-family:Arial,sans-serif;font-size:12pt;';
  const html = `
<div style="${fs}color:#000;line-height:1.7;">
  <p style="margin:0 0 12px;${fs}">Dear Concerned,</p>
  <p style="margin:0 0 20px;${fs}">Please find below the Network Fluctuation (P2P / DATA VPN) Health Summary for the last 15 days (${fmtDate(startStr)} – ${fmtDate(endStr)}).</p>
  <p style="margin:0 0 4px;${fs}font-weight:bold;color:#003366;">Network (P2P / DATA VPN) — MNO Health Summary</p>
  <p style="margin:0 0 12px;${fs}color:#555;">Period: ${fmtDate(startStr)} – ${fmtDate(endStr)}</p>
  <table style="border-collapse:collapse;width:100%;max-width:680px;">
    <thead>
      <tr style="background:#003366;">
        <th style="${fs}color:#fff;padding:9px 12px;text-align:left;border:1px solid #003366;">Operator</th>
        <th style="${fs}color:#fff;padding:9px 12px;text-align:center;border:1px solid #003366;">Total Hits</th>
        <th style="${fs}color:#fff;padding:9px 12px;text-align:center;border:1px solid #003366;">Daily Avg</th>
        <th style="${fs}color:#fff;padding:9px 12px;text-align:left;border:1px solid #003366;">Remark</th>
      </tr>
    </thead>
    <tbody>
      ${stats.map((s, i) => `
      <tr style="background:${i % 2 === 1 ? '#eef3fa' : '#ffffff'};">
        <td style="${fs}padding:9px 12px;border:1px solid #ddd;">${s.name}</td>
        <td style="${fs}padding:9px 12px;border:1px solid #ddd;text-align:center;">${s.total}</td>
        <td style="${fs}padding:9px 12px;border:1px solid #ddd;text-align:center;">${s.avg}</td>
        <td style="${fs}padding:9px 12px;border:1px solid #ddd;">${s.remark}</td>
      </tr>`).join('')}
      <tr style="background:#003366;">
        <td style="${fs}padding:9px 12px;color:#fff;font-weight:bold;border:1px solid #003366;">Total</td>
        <td style="${fs}padding:9px 12px;color:#fff;font-weight:bold;border:1px solid #003366;text-align:center;">${grandTotal}</td>
        <td style="${fs}padding:9px 12px;color:#fff;font-weight:bold;border:1px solid #003366;text-align:center;">${grandAvg.toFixed(1)}</td>
        <td style="${fs}padding:9px 12px;color:#fff;font-weight:bold;border:1px solid #003366;">${remark(grandAvg)}</td>
      </tr>
    </tbody>
  </table>
  <p style="margin:28px 0 0;${fs}">Best Regards,</p>
  <p style="margin:16px 0 0;${fs}font-weight:bold;">${senderName}</p>
  <p style="margin:0;${fs}font-weight:bold;">Senior Engineer, Service Assurance</p>
  <p style="margin:0;${fs}font-weight:bold;color:#003366;">Infozillion Teletech BD Ltd.</p>
  <p style="margin:0;${fs}">Hosaf High Tower, 12th Floor,<br>9 Mohakhali C/A, Dhaka-1212, Bangladesh</p>
</div>`;
  document.getElementById('copySource').innerHTML = html;
}

async function copyEmail() {
  const el = document.getElementById('copySource');
  try {
    const blob = new Blob([el.innerHTML], { type: 'text/html' });
    const item = new ClipboardItem({ 'text/html': blob });
    await navigator.clipboard.write([item]);
    const btn = document.getElementById('btnCopy');
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = '⎘ Copy Email', 2000);
  } catch (e) {
    el.style.display = 'block';
    const range = document.createRange();
    range.selectNodeContents(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    el.style.display = 'none';
    const btn = document.getElementById('btnCopy');
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = '⎘ Copy Email', 2000);
  }
}
