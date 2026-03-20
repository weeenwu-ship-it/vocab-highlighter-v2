export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const raw = formData.get('data');
    if (!raw) {
      return new Response('Missing data', { status: 400 });
    }

    const { words = [], date = '' } = JSON.parse(raw);
    const dateStr = date || new Date().toLocaleDateString('zh-CN');

    const rows = words.map((w, i) => `<tr>
      <td>${i + 1}</td>
      <td class="word">${esc(w.word)}</td>
      <td class="phonetic">${esc(w.phonetic)}</td>
      <td class="pos">${esc(w.pos)}</td>
      <td>${esc(w.meaning)}</td>
    </tr>`).join('');

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8">
<style>
  body { font-family: "Microsoft YaHei", "PingFang SC", "SimSun", sans-serif; margin: 40px; }
  h1 { text-align: center; color: #1a1a2e; font-size: 24px; margin-bottom: 4px; }
  .sub { text-align: center; color: #888; font-size: 12px; margin-bottom: 20px; }
  .brand { text-align: center; color: #6C3CE1; font-size: 11px; margin-bottom: 24px; letter-spacing: 2px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #6C3CE1; color: #fff; padding: 10px 14px; font-size: 14px; text-align: left; }
  td { padding: 8px 14px; font-size: 13px; border-bottom: 1px solid #e8e6f0; }
  tr:nth-child(even) td { background: #f8f5ff; }
  .word { font-weight: bold; font-size: 14px; }
  .phonetic { color: #6C3CE1; font-family: "Consolas", monospace; }
  .pos { color: #d97706; font-weight: bold; }
</style></head>
<body>
<h1>\u751F\u8BCD\u8868</h1>
<p class="sub">\u5171 ${words.length} \u4E2A\u5355\u8BCD \u00B7 ${dateStr}</p>
<p class="brand">\u6B64\u5728\u6559\u80B2 CIZAI EDUCATION</p>
<table>
<tr><th>\u5E8F\u53F7</th><th>\u5355\u8BCD</th><th>\u97F3\u6807</th><th>\u8BCD\u6027</th><th>\u91CA\u4E49</th></tr>
${rows}
</table>
</body></html>`;

    const filename = encodeURIComponent(`生词表_${dateStr.replace(/\//g, '-')}.doc`);

    return new Response(html, {
      headers: {
        'Content-Type': 'application/msword; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${filename}`,
        'Cache-Control': 'no-cache, no-store',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function esc(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
