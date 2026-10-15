/* GPA Annotation Page: save complete multi-page learning material + unsaved-change protection. */
(function () {
  const API = 'https://academy-backend-eatl.onrender.com/api/annotation-materials';
  let savedSnapshot = '';
  let saving = false;

  function readDetails() {
    const params = new URLSearchParams(location.search);
    let stored = {};
    try { stored = JSON.parse(sessionStorage.getItem('learningMaterialDetails') || '{}'); } catch (_) {}
    // Older versions saved details under the URL key in localStorage.
    const key = params.get('key');
    if (key) { try { stored = { ...JSON.parse(localStorage.getItem(key) || '{}'), ...stored }; } catch (_) {} }
    return {
      teacher: stored.teacher || stored.teacherId || sessionStorage.getItem('teacherId') || localStorage.getItem('teacherId') || '',
      teacherName: stored.teacherName || sessionStorage.getItem('teacherName') || localStorage.getItem('teacherName') || '',
      className: stored.className || params.get('className') || params.get('grade') || '',
      subject: stored.subject || params.get('subject') || 'General',
      chapterNo: stored.chapterNo || stored.chapterNumber || params.get('chapterNumber') || '',
      chapterName: stored.chapterName || params.get('chapterName') || '',
      topic: stored.topic || params.get('topic') || '',
      description: stored.description || params.get('description') || '',
      materialDate: stored.materialDate || new Date().toISOString(),
      room: stored.room || params.get('room') || ('annotation-' + (params.get('periodId') || 'unassigned')),
      periodId: stored.periodId || params.get('periodId') || params.get('period') || '',
      studentNames: stored.studentNames || stored.students || []
    };
  }

  function collectDocument() {
    const canvas = window.AnnotationCanvasV1;
    if (!canvas || typeof canvas.getAllPages !== 'function') throw new Error('Annotation pages are not ready yet. Please wait and try again.');
    const rawPages = canvas.getAllPages();
    const pages = rawPages.map((history, i) => ({
      pageNumber: i + 1,
      history: Array.isArray(history) ? history : [],
      background: typeof canvas.getPageBackground === 'function' ? (canvas.getPageBackground(i) || 'white') : 'white'
    }));
    // Older getPageBackground implementations return the current page only.
    // Read each background by selecting the page only if the API explicitly supports it;
    // otherwise the current background is kept and other pages default to white.
    if (typeof canvas.getAllPageBackgrounds === 'function') {
      const bgs = canvas.getAllPageBackgrounds();
      pages.forEach((p, i) => p.background = bgs[i] || 'white');
    }
    return pages;
  }

  function snapshot() {
    try { return JSON.stringify(collectDocument()); } catch (_) { return ''; }
  }
  function markSaved() { savedSnapshot = snapshot(); }
  function hasUnsavedChanges() { const now = snapshot(); return !!now && now !== savedSnapshot; }

  async function saveMaterial() {
    if (saving) return false;
    const details = readDetails();
    if (!details.teacher || !details.teacherName) {
      alert('Teacher information was not found. Please sign in again, then reopen the annotation page.');
      return false;
    }
    if (!details.periodId) {
      alert('The assigned period ID is missing. Please open annotation from the period Attend Class flow.');
      return false;
    }
    let pages;
    try { pages = collectDocument(); } catch (error) { alert(error.message); return false; }
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) { alert('Your login session was not found. Please sign in again.'); return false; }
    const button = document.getElementById('annotationSavePdfV1');
    const oldLabel = button ? button.textContent : '';
    saving = true;
    if (button) { button.disabled = true; button.textContent = 'Saving…'; }
    try {
      const payload = {
        teacher: details.teacher, teacherName: details.teacherName, className: details.className,
        subject: details.subject, chapterNo: String(details.chapterNo || '1'),
        chapterName: details.chapterName || details.topic || 'Learning Material', topic: details.topic || 'General',
        description: details.description, materialDate: details.materialDate, room: details.room,
        periodId: details.periodId,
        pages: pages.map(p => p.history), pageBackgrounds: pages.map(p => p.background)
      };
      const existingId = sessionStorage.getItem('gopesAnnotationMaterialId');
      const response = await fetch(existingId ? `${API}/${encodeURIComponent(existingId)}` : API, {
        method: existingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.message || 'The learning material could not be saved.');
      if (result.material && result.material._id) sessionStorage.setItem('gopesAnnotationMaterialId', result.material._id);
      markSaved();
      if (window.AnnotationCanvasV1 && typeof window.AnnotationCanvasV1.saveAnnotationState === 'function') window.AnnotationCanvasV1.saveAnnotationState();
      alert('Learning material saved successfully. All pages have been sent to the server.');
      return true;
    } catch (error) {
      console.error('ANNOTATION MATERIAL SAVE ERROR:', error);
      alert(error.message || 'Unable to save the learning material. Please try again.');
      return false;
    } finally {
      saving = false;
      if (button) { button.disabled = false; button.textContent = oldLabel || 'Save'; }
    }
  }

  function addLeaveDialog() {
    if (document.getElementById('annotationUnsavedDialogV1')) return;
    const overlay = document.createElement('div');
    overlay.id = 'annotationUnsavedDialogV1';
    overlay.hidden = true;
    overlay.innerHTML = `<div class="annotationUnsavedCardV1" role="dialog" aria-modal="true" aria-labelledby="annotationUnsavedTitleV1"><h2 id="annotationUnsavedTitleV1">Save changes before leaving?</h2><p>This learning material has unsaved changes.</p><div class="annotationUnsavedActionsV1"><button type="button" data-choice="save">Save</button><button type="button" data-choice="discard">Don't Save</button><button type="button" data-choice="cancel">Cancel</button></div></div>`;
    const style = document.createElement('style');
    style.textContent = '#annotationUnsavedDialogV1{position:fixed;inset:0;z-index:999999;background:#0009;display:flex;align-items:center;justify-content:center;padding:16px}#annotationUnsavedDialogV1[hidden]{display:none}.annotationUnsavedCardV1{background:#fff;color:#172033;width:min(440px,100%);border-radius:14px;padding:24px;box-shadow:0 20px 60px #0005;font-family:Arial,sans-serif}.annotationUnsavedCardV1 h2{font-size:20px;margin:0 0 10px}.annotationUnsavedCardV1 p{color:#536071}.annotationUnsavedActionsV1{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;margin-top:22px}.annotationUnsavedActionsV1 button{border:0;border-radius:7px;padding:10px 13px;cursor:pointer;font-weight:600}.annotationUnsavedActionsV1 [data-choice=save]{background:#155eef;color:white}.annotationUnsavedActionsV1 [data-choice=discard],.annotationUnsavedActionsV1 [data-choice=cancel]{background:#e9edf3;color:#172033}';
    document.head.appendChild(style); document.body.appendChild(overlay);
    let pendingHref = null;
    function close() { overlay.hidden = true; pendingHref = null; }
    overlay.addEventListener('click', async e => {
      const choice = e.target && e.target.dataset && e.target.dataset.choice;
      if (!choice) { if (e.target === overlay) close(); return; }
      if (choice === 'cancel') { close(); return; }
      if (choice === 'save') { const ok = await saveMaterial(); if (!ok) return; }
      if (choice === 'discard' || choice === 'save') {
        const target = pendingHref; close();
        if (target) location.href = target;
      }
    });
    document.addEventListener('click', e => {
      const link = e.target.closest && e.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.href.startsWith('javascript:') || link.href.startsWith('mailto:')) return;
      if (!hasUnsavedChanges()) return;
      e.preventDefault(); pendingHref = link.href; overlay.hidden = false;
    }, true);
    window.addEventListener('beforeunload', e => {
      if (hasUnsavedChanges()) { e.preventDefault(); e.returnValue = ''; }
    });
  }

  function init() {
    const params = new URLSearchParams(location.search);
    let saved = {};
    try { saved = JSON.parse(sessionStorage.getItem('learningMaterialDetails') || '{}'); } catch (_) {}
    const subject = params.get('subject') || saved.subject || 'Subject';
    const chapter = params.get('chapterNumber') || saved.chapterNo || saved.chapterNumber || '';
    const topic = params.get('topic') || saved.topic || 'Topic';
    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    setText('materialSubject', subject); setText('materialChapterNumber', chapter ? 'Chapter No. ' + chapter : ''); setText('materialTopic', topic);
    // annotationToolbarV1.js already delegates the Save button to AnnotationPageV1.saveMaterial.
    // Do not attach a second click handler, which would create duplicate records.
    addLeaveDialog();
    // Establish a baseline after the canvas has initialized; a short delay avoids treating initial render as edits.
    setTimeout(markSaved, 900);
    // Editing interactions update the comparison automatically; no interval or storage backup is used here.
    const workspace = document.getElementById('annotationWorkspaceV1');
    if (workspace) workspace.addEventListener('pointerup', () => { /* snapshot comparison detects edits */ });
    window.AnnotationPageV1 = { saveMaterial, hasUnsavedChanges, markSaved };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
