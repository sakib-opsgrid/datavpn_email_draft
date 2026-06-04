const OPS = ['Grameenphone', 'Robi', 'Teletalk', 'Banglalink'];
const OP_SHORT = { Grameenphone: 'GP', Robi: 'RB', Teletalk: 'TT', Banglalink: 'BL' };

// Set default mail date to today
(function () {
  const today = new Date();
  document.getElementById('mailDate').value = today.toISOString().slice(0, 10);
  updateDateRange();
})();

document.getElementById('mailDate').addEventListener('change', updateDateRange);
document.getElementById('rawData').addEventListener('input', updateRowCount);

function updateDateRange() {
  const mailDateVal = document.getElementById('mailDate').value;
  if (!mailDateVal) { document.getElementById('dateRangeDisplay').textContent = '—'; return; }
  const { startStr, endStr } = getWindow(mailDateVal);
  document.getElementById('dateRangeDisplay').textContent =
    `Data period: ${fmtDate(startStr)} – ${fmtDate(endStr)}`;
}

function updateRowCount() {
  const text = document.getElementById('rawData').value.trim();
  if (!text) { document.getElementById('rowCount').textContent = '0 rows detected'; return; }
  const count = text.split('\n').filter(l => l.trim()).length;
  document.getElementById('rowCount').textContent = `${count} rows detected`;
}

// Returns 15-day window: endDate = mailDate - 1, startDate = endDate - 14
function getWindow(mailDateVal) {
  const mail = new Date(mailDateVal);
  const end = new Date(mail); end.setDate(end.getDate() - 1);
  const start = new Date(end); start.setDate(start.getDate() - 14);
  return {
    startStr: end.toISOString().slice(0, 10).replace(/.*/, d => {
      const s = new Date(start); return s.toISOString().slice(0, 10);
    }),
    endStr: end.toISOString().slice(0, 10),
    startDate: start,
    endDate: end
  };
}

// Rewrite getWindow properly
function getWindow(mailDateVal) {
  const mail = new Date(mailDateVal + 'T00:00:00');
  const end = new Date(mail);
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setDate(start.getDate() - 14);
  return {
    startStr: start.toISOString().slice(0, 10),
    endStr: end.toISOString().slice(0, 10),
    startDate: start,
    endDate: end
  };
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

  const mailDateVal = document.getElementById('mailDate').value;
  if (!mailDateVal) { errEl.textContent = 'Please select a mail date.'; return; }

  const rawText = document.getElementById('rawData').value.trim();
  if (!rawText) { errEl.textContent = 'Please paste sheet data.'; return; }

  const { startStr, endStr, startDate, endDate } = getWindow(mailDateVal);
  const rows = parseData(rawText);
  if (!rows.length) { errEl.textContent = 'No valid rows found. Check format: date TAB operator.'; return; }

  // Filter to window
  const inWindow = rows.filter(r => r.date >= startStr && r.date <= endStr);

  // Build per-operator stats
  // Collect unique dates per operator (blank days excluded)
  const opDays = {}; // op -> Set of dates
  const opHits = {}; // op -> total hits
  OPS.forEach(op => { opDays[op] = new Set(); opHits[op] = 0; });

  inWindow.forEach(({ date, op }) => {
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
      days,
      avg: avg.toFixed(1),
      remark: remark(avg)
    };
  });

  // Grand total: sum hits / count of days where ANY operator had a hit
  const allDatesInWindow = new Set(inWindow.map(r => r.date));
  const grandTotal = stats.reduce((s, o) => s + o.total, 0);
  // For total avg: total hits / total active days across all ops
  // Use: total hits / number of days in window that had any data
  const grandDays = allDatesInWindow.size;
  const grandAvg = grandDays > 0 ? grandTotal / grandDays : 0;

  renderPreview({ stats, grandTotal, grandAvg, startStr, endStr });
  buildCopySource({ stats, grandTotal, grandAvg, startStr, endStr });

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('emailPreview').style.display = 'flex';
  document.getElementById('btnCopy').style.display = 'inline-block';
}

function renderPreview({ stats, grandTotal, grandAvg, startStr, endStr }) {
  const subj = `DATA VPN (P2P) Health Summary | Last 15 Days (${fmtDate(startStr)} – ${fmtDate(endStr)})`;
  document.getElementById('previewSubject').textContent = 'Subject: ' + subj;
  document.getElementById('previewIntro').textContent =
    `Please find below the Network Fluctuation (P2P / DATA VPN) Health Summary for the last 15 days (${fmtDate(startStr)} – ${fmtDate(endStr)}).`;
  document.getElementById('previewTableTitle').textContent = 'Network (P2P / DATA VPN) — MNO Health Summary';
  document.getElementById('previewPeriod').textContent = `Period: ${fmtDate(startStr)} – ${fmtDate(endStr)}`;

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

function buildCopySource({ stats, grandTotal, grandAvg, startStr, endStr }) {
  const html = `
<div style="font-family:Arial,sans-serif;font-size:14px;color:#000;line-height:1.7;">
  <p style="margin:0 0 12px;">Dear Concerned,</p>
  <p style="margin:0 0 20px;">Please find below the Network Fluctuation (P2P / DATA VPN) Health Summary for the last 15 days (${fmtDate(startStr)} – ${fmtDate(endStr)}).</p>
  <p style="margin:0 0 6px;font-size:15px;font-weight:bold;color:#003366;">Network (P2P / DATA VPN) — MNO Health Summary</p>
  <p style="margin:0 0 12px;font-size:12px;color:#555;">Period: ${fmtDate(startStr)} – ${fmtDate(endStr)}</p>
  <table style="border-collapse:collapse;width:100%;max-width:680px;">
    <thead>
      <tr style="background:#003366;">
        <th style="color:#fff;padding:9px 12px;text-align:left;font-size:13px;border:1px solid #003366;">Operator</th>
        <th style="color:#fff;padding:9px 12px;text-align:center;font-size:13px;border:1px solid #003366;">Total Hits</th>
        <th style="color:#fff;padding:9px 12px;text-align:center;font-size:13px;border:1px solid #003366;">Daily Avg</th>
        <th style="color:#fff;padding:9px 12px;text-align:left;font-size:13px;border:1px solid #003366;">Remark</th>
      </tr>
    </thead>
    <tbody>
      ${stats.map((s, i) => `
      <tr style="background:${i % 2 === 1 ? '#eef3fa' : '#ffffff'};">
        <td style="padding:9px 12px;border:1px solid #ddd;font-size:13px;">${s.name}</td>
        <td style="padding:9px 12px;border:1px solid #ddd;font-size:13px;text-align:center;">${s.total}</td>
        <td style="padding:9px 12px;border:1px solid #ddd;font-size:13px;text-align:center;">${s.avg}</td>
        <td style="padding:9px 12px;border:1px solid #ddd;font-size:13px;">${s.remark}</td>
      </tr>`).join('')}
      <tr style="background:#003366;">
        <td style="padding:9px 12px;color:#fff;font-weight:bold;font-size:13px;border:1px solid #003366;">Total</td>
        <td style="padding:9px 12px;color:#fff;font-weight:bold;font-size:13px;border:1px solid #003366;text-align:center;">${grandTotal}</td>
        <td style="padding:9px 12px;color:#fff;font-weight:bold;font-size:13px;border:1px solid #003366;text-align:center;">${grandAvg.toFixed(1)}</td>
        <td style="padding:9px 12px;color:#fff;font-weight:bold;font-size:13px;border:1px solid #003366;">${remark(grandAvg)}</td>
      </tr>
    </tbody>
  </table>
  <p style="margin:28px 0 0;">Best Regards,</p>
  <p style="margin:16px 0 0;font-weight:bold;">Senior Engineer, Service Assurance</p>
  <p style="margin:0;font-weight:bold;color:#003366;">Infozillion Teletech BD Ltd.</p>
  <p style="margin:0;">Hosaf High Tower, 12th Floor,<br>9 Mohakhali C/A, Dhaka-1212, Bangladesh</p>
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
    // Fallback: select and copy
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
