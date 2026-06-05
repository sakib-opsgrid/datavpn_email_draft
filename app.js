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
  buildCopySource({ tableRows, totals, senderName });

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
        <th class="c">D - n</th>
        <th>DATE</th>
        <th class="c">Banglalink</th>
        <th class="c">Grameenphone</th>
        <th class="c">Robi</th>
        <th class="c">Teletalk</th>
        <th class="c">TOD</th>
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
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" class="total-label">Total</td>
        <td class="c">${totals.bl}</td>
        <td class="c">${totals.gp}</td>
        <td class="c">${totals.rb}</td>
        <td class="c">${totals.tt}</td>
        <td class="c">${totals.tod}</td>
      </tr>
    </tfoot>`;
}

function buildCopySource({ tableRows, totals, senderName }) {
  const fs = 'font-family:Arial,sans-serif;font-size:11pt;';
  const b = '1px solid #000';
  const thTd = (val, extra) =>
    `<td style="${fs}font-weight:bold;padding:4px 10px;border:${b};text-align:${extra||'center'};background:#fff;">${val}</td>`;
  const td = (val, align) =>
    `<td style="${fs}padding:4px 10px;border:${b};text-align:${align||'center'};">${val}</td>`;
  const tfTd = (val, span) =>
    `<td ${span?`colspan="${span}"`:''} style="${fs}font-weight:bold;padding:4px 10px;border:${b};text-align:center;">${val}</td>`;

  const bodyRows = tableRows.map(r =>
    `<tr>
      ${td(r.dn)}
      ${td(fmtDateShort(r.date), 'left')}
      ${td(r.bl)}
      ${td(r.gp)}
      ${td(r.rb)}
      ${td(r.tt)}
      ${td(r.tod)}
    </tr>`
  ).join('');

  const html = `
<div style="${fs}color:#000;line-height:1.6;">
  <p style="margin:0 0 10px;${fs}">Dear Concerned,</p>
  <p style="margin:0 0 16px;${fs}">Please find the MNO-wise P2P (DataVPN) interruption record for the last 15 days.</p>
  <table style="border-collapse:collapse;width:auto;">
    <thead>
      <tr>
        ${thTd('D - n')}
        ${thTd('DATE', 'left')}
        ${thTd('Banglalink')}
        ${thTd('Grameenphone')}
        ${thTd('Robi')}
        ${thTd('Teletalk')}
        ${thTd('TOD')}
      </tr>
    </thead>
    <tbody>${bodyRows}</tbody>
    <tfoot>
      <tr>
        ${tfTd('Total', 2)}
        ${tfTd(totals.bl)}
        ${tfTd(totals.gp)}
        ${tfTd(totals.rb)}
        ${tfTd(totals.tt)}
        ${tfTd(totals.tod)}
      </tr>
    </tfoot>
  </table>
  <p style="margin:24px 0 0;${fs}">Best Regards,</p>
  <p style="margin:14px 0 0;${fs}font-weight:bold;">${senderName}</p>
  <p style="margin:0;${fs}font-weight:bold;">Senior Engineer, Service Assurance</p>
  <p style="margin:0;${fs}font-weight:bold;">Infozillion Teletech BD Ltd.</p>
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
