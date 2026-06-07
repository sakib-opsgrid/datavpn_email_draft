const OPS = ['Grameenphone', 'Robi', 'Teletalk', 'Banglalink'];

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
    const dates = rows.map(r => r.date).sort();
    document.getElementById('dateRangeDisplay').textContent =
      `Data period: ${fmtDate(dates[0])} – ${fmtDate(dates[dates.length - 1])}`;
  }
}

function fmtDate(d) {
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
}

function fmtDateShort(d) {
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(day).toString().padStart(2,'0')} -${months[parseInt(m)-1]}-${y}`;
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

  const allDatesSet = new Set(rows.map(r => r.date));
  const displayDates = [...allDatesSet].sort().reverse().slice(0, 15);

  const dateCounts = {};
  displayDates.forEach(d => {
    dateCounts[d] = {};
    OPS.forEach(op => dateCounts[d][op] = 0);
  });
  rows.forEach(({ date, op }) => {
    if (dateCounts[date]) dateCounts[date][op]++;
  });

  const tableRows = displayDates.map((date, idx) => {
    const bl = dateCounts[date]['Banglalink'];
    const gp = dateCounts[date]['Grameenphone'];
    const rb = dateCounts[date]['Robi'];
    const tt = dateCounts[date]['Teletalk'];
    return { dn: idx + 1, date, bl, gp, rb, tt, tod: bl + gp + rb + tt };
  });

  const totals = {
    bl: tableRows.reduce((s, r) => s + r.bl, 0),
    gp: tableRows.reduce((s, r) => s + r.gp, 0),
    rb: tableRows.reduce((s, r) => s + r.rb, 0),
    tt: tableRows.reduce((s, r) => s + r.tt, 0),
    tod: tableRows.reduce((s, r) => s + r.tod, 0),
  };

  renderPreview({ tableRows, totals, senderName });
  buildCopySource({ tableRows, senderName });

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('emailPreview').style.display = 'flex';
  document.getElementById('btnCopy').style.display = 'inline-block';
  document.getElementById('sigName').textContent = senderName;
}

function renderPreview({ tableRows, totals, senderName }) {
  document.getElementById('previewSubject').textContent = 'Subject: MNO-wise P2P (DataVPN) interruption record';
  document.getElementById('previewIntro').textContent =
    'Please find the MNO-wise P2P (DataVPN) interruption record for the last 15 days.';
  document.getElementById('sigName').textContent = senderName;

  const table = document.getElementById('previewTable');
  table.innerHTML = `
    <thead>
      <tr>
        <th class="th-right">D - n</th>
        <th class="th-left">DATE</th>
        <th class="th-right">Banglalink</th>
        <th class="th-right">Grameenphone</th>
        <th class="th-right">Robi</th>
        <th class="th-right">Teletalk</th>
        <th class="th-right">TOD</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows.map(r => `
        <tr>
          <td class="c">${r.dn}</td>
          <td class="date-cell">${fmtDateShort(r.date)}</td>
          <td class="c">${r.bl}</td>
          <td class="c">${r.gp}</td>
          <td class="c">${r.rb}</td>
          <td class="c">${r.tt}</td>
          <td class="c">${r.tod}</td>
        </tr>`).join('')}
    </tbody>`;
}

function buildCopySource({ tableRows, senderName }) {
  const fs = 'font-family:Arial,sans-serif;font-size:12pt;';
  const b = '1px solid #000';
  const pad = 'padding:4px 10px;';

  // Header: bold, thin border, white bg — sheet style
  const th = (val, align) =>
    `<td style="${fs}font-weight:bold;${pad}border:${b};text-align:${align};background:#fff;white-space:nowrap;">${val}</td>`;

  // Body cells
  const tdR = (val) => `<td style="${fs}${pad}border:${b};text-align:right;">${val}</td>`;
  const tdL = (val) => `<td style="${fs}${pad}border:${b};text-align:left;white-space:nowrap;">${val}</td>`;

  const bodyRows = tableRows.map(r =>
    `<tr>
      ${tdR(r.dn)}
      ${tdL(fmtDateShort(r.date))}
      ${tdR(r.bl)}
      ${tdR(r.gp)}
      ${tdR(r.rb)}
      ${tdR(r.tt)}
      ${tdR(r.tod)}
    </tr>`
  ).join('');

  const html = `
<div style="${fs}color:#000;line-height:1.6;">
  <p style="margin:0 0 10px;${fs}">Dear Concerned,</p>
  <p style="margin:0 0 16px;${fs}">Please find the MNO-wise P2P (DataVPN) interruption record for the last 15 days.</p>
  <table style="border-collapse:collapse;width:auto;">
    <thead>
      <tr>
        ${th('D - n', 'right')}
        ${th('DATE', 'left')}
        ${th('Banglalink', 'right')}
        ${th('Grameenphone', 'right')}
        ${th('Robi', 'right')}
        ${th('Teletalk', 'right')}
        ${th('TOD', 'right')}
      </tr>
    </thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <p style="margin:24px 0 0;${fs}">Best Regards,</p>
  <p style="margin:14px 0 0;${fs}font-weight:bold;">${senderName}</p>
  <p style="margin:0;${fs}">Senior Engineer, Service Assurance</p>
  <p style="margin:0;${fs}">Infozillion Teletech BD Ltd.</p>
  <p style="margin:0;${fs}">Hosaf High Tower, 12th Floor,<br>9 Mohakhali C/A, Dhaka-1212, Bangladesh</p>
</div>`;
  document.getElementById('copySource').innerHTML = html;
}

async function copyEmail() {
  const el = document.getElementById('copySource');
  try {
    const blob = new Blob([el.innerHTML], { type: 'text/html' });
    await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
  } catch (e) {
    el.style.display = 'block';
    const range = document.createRange();
    range.selectNodeContents(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    el.style.display = 'none';
  }
  const btn = document.getElementById('btnCopy');
  btn.textContent = '✓ Copied!';
  setTimeout(() => btn.textContent = '⎘ Copy Email', 2000);
}
