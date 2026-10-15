/* Drop-in list renderer for teacher-materials.html and student-materials.html. */
(() => {
  const API = 'https://academy-backend-eatl.onrender.com/api/annotation-materials';
  const token = () => sessionStorage.getItem('token') || localStorage.getItem('token') || '';
  function escapeHtml(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function mount() {
    if (document.getElementById('gpaAnnotationMaterialsV1')) return document.getElementById('gpaAnnotationMaterialsV1');
    const root = document.createElement('section'); root.id = 'gpaAnnotationMaterialsV1';
    root.innerHTML = `<style>#gpaAnnotationMaterialsV1{font-family:Arial,sans-serif;margin:18px 0;color:#15243b}#gpaAnnotationMaterialsV1 .gpa-am-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}#gpaAnnotationMaterialsV1 h2{margin:0;font-size:21px}#gpaAnnotationMaterialsV1 .gpa-am-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(245px,1fr));gap:14px}#gpaAnnotationMaterialsV1 .gpa-am-card{background:#fff;border:1px solid #e1e7ef;border-radius:12px;padding:16px;box-shadow:0 4px 16px #10213a0b}#gpaAnnotationMaterialsV1 .gpa-am-card h3{margin:0 0 8px;font-size:16px}#gpaAnnotationMaterialsV1 .gpa-am-meta{font-size:13px;line-height:1.65;color:#526177}#gpaAnnotationMaterialsV1 button{border:0;border-radius:7px;padding:9px 12px;background:#145be8;color:#fff;font-weight:600;cursor:pointer;margin-top:12px}#gpaAnnotationMaterialsV1 .gpa-am-status{padding:18px;background:#fff;border-radius:10px;color:#64748b}#gpaAnnotationMaterialsV1 .gpa-am-refresh{margin:0;background:#e8efff;color:#1547a7}</style><div class="gpa-am-head"><h2>📚 Saved Learning Materials</h2><button class="gpa-am-refresh" type="button">Refresh</button></div><div class="gpa-am-content"><div class="gpa-am-status">Loading saved learning materials…</div></div>`;
    const host = document.querySelector('main') || document.querySelector('#main-content') || document.querySelector('.main-content') || document.querySelector('#content') || document.body;
    host.prepend(root); root.querySelector('.gpa-am-refresh').addEventListener('click', load); return root;
  }
  async function load() {
    const root = mount(), content = root.querySelector('.gpa-am-content');
    const auth = token();
    if (!auth) { content.innerHTML = '<div class="gpa-am-status">Please sign in again to view learning materials.</div>'; return; }
    content.innerHTML = '<div class="gpa-am-status">Loading saved learning materials…</div>';
    try {
      const response = await fetch(`${API}/mine`, { headers: { Authorization: `Bearer ${auth}` } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load materials.');
      const materials = Array.isArray(result.materials) ? result.materials : [];
      if (!materials.length) { content.innerHTML = '<div class="gpa-am-status">No saved learning materials are available for your assigned periods yet.</div>'; return; }
      content.innerHTML = `<div class="gpa-am-grid">${materials.map(m => `<article class="gpa-am-card"><h3>${escapeHtml(m.subject || 'Learning Material')} — ${escapeHtml(m.topic || m.chapterName || '')}</h3><div class="gpa-am-meta"><b>Grade:</b> ${escapeHtml(m.className || '—')}<br><b>Chapter:</b> ${escapeHtml(m.chapterNo || '—')} ${escapeHtml(m.chapterName || '')}<br><b>Pages:</b> ${Number(m.totalPages || (m.pages || []).length || 1)}<br><b>Date:</b> ${escapeHtml(m.materialDate ? new Date(m.materialDate).toLocaleDateString() : '—')}<br><b>Teacher:</b> ${escapeHtml(m.teacherName || '—')}</div><button type="button" data-id="${escapeHtml(m._id)}">View Material</button></article>`).join('')}</div>`;
      content.querySelectorAll('button[data-id]').forEach(btn => btn.addEventListener('click', () => { location.href = `annotation-material-viewer.html?id=${encodeURIComponent(btn.dataset.id)}`; }));
    } catch (error) { console.error('GPA MATERIAL LIST:', error); content.innerHTML = `<div class="gpa-am-status">${escapeHtml(error.message || 'Unable to load materials.')}</div>`; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
