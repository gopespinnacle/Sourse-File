/*
 * GPA Elite Notebook Workspace V1
 * Front-end notebook tree and navigation shell.
 * This browser-only store is a development fallback; it is not a substitute
 * for authenticated teacher-to-notebook mapping on the academy backend.
 */
(() => {
  'use strict';
  const STORAGE_KEY = 'gpa.annotation.notebookWorkspace.v1';
  const tree = document.getElementById('gpaNotebookTree');
  if (!tree) return;

  const uid = () => 'gpa_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const starter = () => ({
    notebooks: [{
      id: uid(), name: 'My Teaching Notebook', sections: [{
        id: uid(), name: 'General', pages: [{ id: uid(), name: 'Welcome page' }]
      }]
    }], selectedNotebook: null, selectedSection: null, selectedPage: null
  });
  let state;
  try { state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (_) { state = null; }
  if (!state || !Array.isArray(state.notebooks)) state = starter();
  if (!state.notebooks.length) state = starter();
  state.selectedNotebook ||= state.notebooks[0]?.id;
  const firstNotebook = () => state.notebooks.find(n => n.id === state.selectedNotebook) || state.notebooks[0];
  const firstSection = () => firstNotebook()?.sections?.find(s => s.id === state.selectedSection) || firstNotebook()?.sections?.[0];
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { console.warn('Notebook browser save unavailable', e); } };
  const icon = (text) => `<span class="gpa-tree-icon" aria-hidden="true">${text}</span>`;
  const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function render() {
    const filter = (document.getElementById('gpaNotebookSearch')?.value || '').trim().toLowerCase();
    if (!state.notebooks.length) { tree.innerHTML = '<div class="gpa-empty">No notebooks yet. Choose + Notebook to create one.</div>'; return; }
    tree.innerHTML = state.notebooks.filter(n => !filter || n.name.toLowerCase().includes(filter)).map(n => {
      const selected = n.id === state.selectedNotebook;
      const sections = (n.sections || []).map(s => `<button class="gpa-section-row ${s.id === state.selectedSection ? 'selected' : ''}" type="button" data-section="${s.id}" data-notebook="${n.id}">${icon('▰')}<span>${safe(s.name)}</span></button>
        <div class="gpa-tree-children">${(s.pages || []).map(p => `<button class="gpa-page-row ${p.id === state.selectedPage ? 'selected' : ''}" type="button" data-page="${p.id}" data-section="${s.id}" data-notebook="${n.id}">${icon('▤')}<span>${safe(p.name)}</span></button>`).join('')}
        <button class="gpa-page-row" type="button" data-add-page="${s.id}" data-notebook="${n.id}">${icon('＋')}<span>Add page</span></button></div>`).join('');
      return `<div class="gpa-notebook-block"><button class="gpa-notebook-row ${selected ? 'selected' : ''}" type="button" data-notebook="${n.id}">${icon(selected ? '▾' : '▸')}${icon('▣')}<span>${safe(n.name)}</span></button>${selected ? `<div class="gpa-tree-children">${sections || '<div class="gpa-empty">No sections. Choose + Section.</div>'}</div>` : ''}</div>`;
    }).join('');
    tree.querySelectorAll('[data-notebook]').forEach(btn => btn.addEventListener('click', e => {
      const el = e.currentTarget;
      if (el.hasAttribute('data-section')) { state.selectedNotebook = el.dataset.notebook; state.selectedSection = el.dataset.section; const sec = firstNotebook().sections.find(x => x.id === state.selectedSection); state.selectedPage = sec?.pages?.[0]?.id || null; }
      else if (el.hasAttribute('data-page')) { state.selectedNotebook = el.dataset.notebook; state.selectedSection = el.dataset.section; state.selectedPage = el.dataset.page; }
      else { state.selectedNotebook = el.dataset.notebook; const nb = firstNotebook(); state.selectedSection = nb.sections?.[0]?.id || null; state.selectedPage = nb.sections?.[0]?.pages?.[0]?.id || null; }
      save(); render(); updateContext();
    }));
    tree.querySelectorAll('[data-add-page]').forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation(); const nb = state.notebooks.find(n => n.id === e.currentTarget.dataset.notebook); const sec = nb?.sections.find(s => s.id === e.currentTarget.dataset.addPage); if (!sec) return;
      const name = prompt('Page name:', 'New page'); if (!name || !name.trim()) return; const page = {id:uid(),name:name.trim()}; sec.pages.push(page); state.selectedNotebook=nb.id; state.selectedSection=sec.id; state.selectedPage=page.id; save(); render(); updateContext();
    }));
  }
  function updateContext() {
    const nb = firstNotebook(), sec = firstSection();
    const page = sec?.pages?.find(p => p.id === state.selectedPage) || sec?.pages?.[0];
    const title = document.getElementById('materialTitle');
    if (title && nb) title.textContent = `${nb.name}${sec ? '  /  ' + sec.name : ''}${page ? '  /  ' + page.name : ''}`;
  }
  document.getElementById('gpaAddNotebook')?.addEventListener('click', () => {
    const name = prompt('Notebook name:', 'New notebook'); if (!name || !name.trim()) return;
    const nb = {id:uid(), name:name.trim(), sections:[{id:uid(),name:'General',pages:[{id:uid(),name:'Welcome page'}]}]}; state.notebooks.push(nb); state.selectedNotebook=nb.id; state.selectedSection=nb.sections[0].id; state.selectedPage=nb.sections[0].pages[0].id; save(); render(); updateContext();
  });
  document.getElementById('gpaAddSection')?.addEventListener('click', () => {
    const nb = firstNotebook(); if (!nb) return; const name = prompt(`New section in “${nb.name}”:`, 'New section'); if (!name || !name.trim()) return;
    const sec = {id:uid(),name:name.trim(),pages:[{id:uid(),name:'New page'}]}; nb.sections.push(sec); state.selectedNotebook=nb.id; state.selectedSection=sec.id; state.selectedPage=sec.pages[0].id; save(); render(); updateContext();
  });
  document.getElementById('gpaNotebookSearch')?.addEventListener('input', render);
  document.querySelectorAll('[data-ribbon]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-ribbon]').forEach(b => b.classList.toggle('active', b === btn));
    // Existing drawing tools remain owned by AnnotationToolbarV1; ribbon tabs are visual navigation for staged expansion.
    const panel = document.getElementById('annotationToolbarPanelV1');
    if (btn.dataset.ribbon === 'Draw' && panel) { panel.style.display = ''; window.AnnotationToolbarV1?.show?.(); }
    if (btn.dataset.ribbon === 'Home' && panel) { panel.style.display = ''; }
  }));
  const nb = firstNotebook(); state.selectedNotebook = nb?.id; state.selectedSection ||= nb?.sections?.[0]?.id; state.selectedPage ||= nb?.sections?.[0]?.pages?.[0]?.id; save(); render(); updateContext();
})();
