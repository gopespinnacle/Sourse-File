/*
 * GPA Elite Notebook Workspace V2
 * Local notebook-tree management: create, select, rename and delete notebooks,
 * sections and pages. This is a UI/data foundation only; authenticated teacher
 * mapping and server persistence must be wired to the academy backend separately.
 */
(() => {
  'use strict';
  const STORAGE_KEY = 'gpa.annotation.notebookWorkspace.v2';
  const LEGACY_KEY = 'gpa.annotation.notebookWorkspace.v1';
  const tree = document.getElementById('gpaNotebookTree');
  if (!tree) return;
  const uid = () => 'gpa_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const starter = () => ({notebooks:[{id:uid(),name:'My Teaching Notebook',sections:[{id:uid(),name:'General',pages:[{id:uid(),name:'Welcome page'}]}]}],selectedNotebook:null,selectedSection:null,selectedPage:null});
  let state;
  try { state = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY) || 'null'); } catch (_) { state = null; }
  if (!state || !Array.isArray(state.notebooks)) state = starter();
  state.notebooks = state.notebooks.map(n => ({...n, sections:Array.isArray(n.sections)?n.sections.map(s=>({...s,pages:Array.isArray(s.pages)?s.pages:[]})):[]}));
  if (!state.notebooks.length) state = starter();
  const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const nbNow = () => state.notebooks.find(n=>n.id===state.selectedNotebook) || state.notebooks[0];
  const secNow = () => nbNow()?.sections.find(s=>s.id===state.selectedSection) || nbNow()?.sections[0];
  const pageNow = () => secNow()?.pages.find(p=>p.id===state.selectedPage) || secNow()?.pages[0];
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) { console.warn('Notebook browser save unavailable',e); } };
  // Each notebook page gets its own annotation history and page background.
  // This is browser-local persistence; server/teacher mapping is a separate backend phase.
  const PAGE_CONTENT_PREFIX = 'gpa.annotation.notebookPageContent.v1.';
  let activeContentPageId = null;
  function captureActivePageContent() {
    if (!activeContentPageId || !window.AnnotationCanvasV1) return;
    try {
      const canvasApi = window.AnnotationCanvasV1;
      const payload = {
        history: typeof canvasApi.getHistory === 'function' ? canvasApi.getHistory() : [],
        background: typeof canvasApi.getPageBackground === 'function' ? canvasApi.getPageBackground() : null,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(PAGE_CONTENT_PREFIX + activeContentPageId, JSON.stringify(payload));
    } catch (e) { console.warn('Could not save notebook page content locally.', e); }
  }
  function activatePageContent(pageId, clearWhenMissing = true) {
    if (!pageId || !window.AnnotationCanvasV1) return;
    const canvasApi = window.AnnotationCanvasV1;
    try {
      const raw = localStorage.getItem(PAGE_CONTENT_PREFIX + pageId);
      const payload = raw ? JSON.parse(raw) : null;
      // On page switches, an empty page must not inherit the previous page's marks.
      // On first startup, preserve any annotation already restored by the existing session system.
      if ((payload || clearWhenMissing) && typeof canvasApi.clear === 'function') canvasApi.clear();
      if (payload && Array.isArray(payload.history) && typeof canvasApi.loadHistory === 'function') {
        canvasApi.loadHistory(payload.history);
      }
      if (payload && payload.background && typeof canvasApi.setPageBackground === 'function') {
        canvasApi.setPageBackground(payload.background);
      }
      activeContentPageId = pageId;
      if (typeof canvasApi.saveAnnotationState === 'function') canvasApi.saveAnnotationState();
      if (!payload && !clearWhenMissing) captureActivePageContent();
    } catch (e) { console.warn('Could not restore notebook page content.', e); activeContentPageId = pageId; }
  }
  // Keep the current page backed up before the tab is closed or refreshed.
  window.addEventListener('pagehide', captureActivePageContent);
  window.addEventListener('beforeunload', captureActivePageContent);
  const selectFirst = (nb) => { state.selectedNotebook=nb?.id||null; state.selectedSection=nb?.sections?.[0]?.id||null; state.selectedPage=nb?.sections?.[0]?.pages?.[0]?.id||null; };
  const renameItem = (item, label) => { const name=prompt(`Rename ${label}:`,item.name); if(name && name.trim()) item.name=name.trim(); };
  function render() {
    const filter=(document.getElementById('gpaNotebookSearch')?.value||'').trim().toLowerCase();
    if(!state.notebooks.length){tree.innerHTML='<div class="gpa-empty">No notebooks yet. Choose + Notebook to create one.</div>';return;}
    tree.innerHTML=state.notebooks.filter(n=>!filter||n.name.toLowerCase().includes(filter)).map(n=>{
      const selected=n.id===state.selectedNotebook;
      const sections=(n.sections||[]).map(s=>`<div class="gpa-tree-item"><button class="gpa-section-row ${s.id===state.selectedSection?'selected':''}" type="button" data-action="select-section" data-nb="${n.id}" data-id="${s.id}" title="Select section">${s.id===state.selectedSection?'▾':'▸'} <span class="gpa-tree-icon">▰</span><span class="gpa-tree-name">${safe(s.name)}</span></button><div class="gpa-tree-children">${(s.pages||[]).map(p=>`<div class="gpa-tree-item"><button class="gpa-page-row ${p.id===state.selectedPage?'selected':''}" type="button" data-action="select-page" data-nb="${n.id}" data-sec="${s.id}" data-id="${p.id}" title="Open page"><span class="gpa-tree-icon">▤</span><span class="gpa-tree-name">${safe(p.name)}</span></button><div class="gpa-item-actions"><button type="button" data-action="rename-page" data-nb="${n.id}" data-sec="${s.id}" data-id="${p.id}" aria-label="Rename page">Rename</button><button type="button" data-action="delete-page" data-nb="${n.id}" data-sec="${s.id}" data-id="${p.id}" aria-label="Delete page">Delete</button></div></div>`).join('')}<button class="gpa-page-row gpa-add-row" type="button" data-action="add-page" data-nb="${n.id}" data-sec="${s.id}">＋ Add page</button><div class="gpa-item-actions"><button type="button" data-action="rename-section" data-nb="${n.id}" data-id="${s.id}">Rename section</button><button type="button" data-action="delete-section" data-nb="${n.id}" data-id="${s.id}">Delete section</button></div></div></div>`).join('');
      return `<div class="gpa-notebook-block"><button class="gpa-notebook-row ${selected?'selected':''}" type="button" data-action="select-notebook" data-id="${n.id}">${selected?'▾':'▸'} <span class="gpa-tree-icon">▣</span><span class="gpa-tree-name">${safe(n.name)}</span></button>${selected?`<div class="gpa-item-actions gpa-notebook-actions"><button type="button" data-action="rename-notebook" data-id="${n.id}">Rename notebook</button><button type="button" data-action="delete-notebook" data-id="${n.id}">Delete notebook</button></div><div class="gpa-tree-children">${sections||'<div class="gpa-empty">No sections. Choose + Section.</div>'}<button class="gpa-page-row gpa-add-row" type="button" data-action="add-section" data-nb="${n.id}">＋ Add section</button></div>`:''}</div>`;
    }).join('');
    tree.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>handleAction(btn.dataset)));
    updateContext();
  }
  function handleAction(d){
    const previousPageId = pageNow()?.id || null;
    const nb=state.notebooks.find(n=>n.id===d.nb||n.id===d.id&&d.action.includes('notebook'))||nbNow();
    const sec=nb?.sections.find(s=>s.id===d.sec||s.id===d.id);
    const page=sec?.pages.find(p=>p.id===d.id);
    switch(d.action){
      case 'select-notebook': selectFirst(state.notebooks.find(n=>n.id===d.id)); break;
      case 'select-section': state.selectedNotebook=d.nb;state.selectedSection=d.id;state.selectedPage=sec?.pages?.[0]?.id||null;break;
      case 'select-page':state.selectedNotebook=d.nb;state.selectedSection=d.sec;state.selectedPage=d.id;break;
      case 'add-page':{const name=prompt('Page name:','New page');if(!name?.trim())return;const s=state.notebooks.find(n=>n.id===d.nb)?.sections.find(x=>x.id===d.sec);if(!s)return;const p={id:uid(),name:name.trim()};s.pages.push(p);state.selectedNotebook=d.nb;state.selectedSection=d.sec;state.selectedPage=p.id;break;}
      case 'add-section':{const n=state.notebooks.find(x=>x.id===d.nb);const name=prompt('Section name:','New section');if(!n||!name?.trim())return;const s={id:uid(),name:name.trim(),pages:[{id:uid(),name:'New page'}]};n.sections.push(s);state.selectedNotebook=n.id;state.selectedSection=s.id;state.selectedPage=s.pages[0].id;break;}
      case 'rename-notebook':{const n=state.notebooks.find(x=>x.id===d.id);if(!n)return;renameItem(n,'notebook');break;}
      case 'delete-notebook':{const i=state.notebooks.findIndex(x=>x.id===d.id);if(i<0)return;if(state.notebooks.length===1){alert('Keep at least one notebook.');return;}if(!confirm(`Delete notebook “${state.notebooks[i].name}” and its section/page list?`))return;state.notebooks.splice(i,1);selectFirst(state.notebooks[0]);break;}
      case 'rename-section':if(sec)renameItem(sec,'section');break;
      case 'delete-section':if(sec){if(!confirm(`Delete section “${sec.name}” and its page list?`))return;nb.sections=nb.sections.filter(x=>x.id!==sec.id);selectFirst(nb);}break;
      case 'rename-page':if(page)renameItem(page,'page');break;
      case 'delete-page':if(page){if(sec.pages.length===1){alert('Keep at least one page in each section.');return;}if(!confirm(`Delete page “${page.name}”?`))return;sec.pages=sec.pages.filter(x=>x.id!==page.id);state.selectedPage=sec.pages[0]?.id||null;}break;
    }
    if (previousPageId && previousPageId !== pageNow()?.id) captureActivePageContent();
    save();render();
    if (previousPageId !== pageNow()?.id) activatePageContent(pageNow()?.id || null);
  }
  function updateContext(){const nb=nbNow(),sec=secNow(),page=pageNow();const title=document.getElementById('materialTitle');if(title)title.textContent=[nb?.name,sec?.name,page?.name].filter(Boolean).join('  /  ');}
  document.getElementById('gpaAddNotebook')?.addEventListener('click',()=>{captureActivePageContent();const name=prompt('Notebook name:','New notebook');if(!name?.trim())return;const nb={id:uid(),name:name.trim(),sections:[{id:uid(),name:'General',pages:[{id:uid(),name:'Welcome page'}]}]};state.notebooks.push(nb);selectFirst(nb);save();render();activatePageContent(pageNow()?.id||null);});
  document.getElementById('gpaAddSection')?.addEventListener('click',()=>{const nb=nbNow();if(!nb)return;const name=prompt(`New section in “${nb.name}”:`,'New section');if(!name?.trim())return;const sec={id:uid(),name:name.trim(),pages:[{id:uid(),name:'New page'}]};nb.sections.push(sec);state.selectedNotebook=nb.id;state.selectedSection=sec.id;state.selectedPage=sec.pages[0].id;save();render();activatePageContent(pageNow()?.id||null);});
  document.getElementById('gpaNotebookSearch')?.addEventListener('input',render);
  document.querySelectorAll('[data-ribbon]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-ribbon]').forEach(b=>b.classList.toggle('active',b===btn));const panel=document.getElementById('annotationToolbarPanelV1');if(panel){panel.style.display='';if(btn.dataset.ribbon==='Draw')window.AnnotationToolbarV1?.show?.();}}));
  selectFirst(nbNow()); save(); render();
  // Wait until annotationCanvasV1's safe startup has initialized its canvas.
  const initialPageId = pageNow()?.id || null;
  const initializePageContent = () => { if (window.AnnotationCanvasV1 && window.AnnotationCanvasV1.getCanvas?.()) { activatePageContent(initialPageId, false); } else { requestAnimationFrame(initializePageContent); } };
  initializePageContent();
})();
