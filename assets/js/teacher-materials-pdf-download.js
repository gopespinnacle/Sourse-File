/* Gopes Pinnacle Academy - Teacher Materials PDF download
   Loads a saved AnnotationMaterial and exports every saved page to A4 PDF. */
(function () {
  'use strict';

  function loadJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    if (window.__gpaJsPdfLoading) return window.__gpaJsPdfLoading;
    window.__gpaJsPdfLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => window.jspdf && window.jspdf.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error('PDF library did not initialize.'));
      script.onerror = () => reject(new Error('Could not load the PDF library. Please check your internet connection.'));
      document.head.appendChild(script);
    });
    return window.__gpaJsPdfLoading;
  }

  function loadImage(src) {
    return new Promise(resolve => {
      if (!src) return resolve(null);
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  }

  function drawPageBackground(ctx, width, height, style) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    const spacing = style === 'ruled' ? 28 : style === 'four-line' ? 32 : style === 'grid' ? 24 : style === 'dots' ? 18 : 0;
    if (!spacing) return;
    ctx.save();
    if (style === 'dots') {
      ctx.fillStyle = '#d4dbe5';
      for (let y = 9; y < height; y += spacing) for (let x = 9; x < width; x += spacing) {
        ctx.beginPath(); ctx.arc(x, y, 1.1, 0, Math.PI * 2); ctx.fill();
      }
    } else if (style === 'grid') {
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += spacing) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
      for (let y = 0; y <= height; y += spacing) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    } else if (style === 'ruled') {
      ctx.strokeStyle = '#c8d9f0'; ctx.lineWidth = 1;
      for (let y = spacing; y < height; y += spacing) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    } else if (style === 'four-line') {
      for (let y = 0; y < height; y += spacing) {
        ctx.strokeStyle = '#c7d8ed'; ctx.lineWidth = 1;
        [0, 8, 16, 24].forEach(offset => { ctx.beginPath(); ctx.moveTo(0, y + offset); ctx.lineTo(width, y + offset); ctx.stroke(); });
        ctx.strokeStyle = '#e8a3a3'; ctx.beginPath(); ctx.moveTo(0, y + 16); ctx.lineTo(width, y + 16); ctx.stroke();
      }
    }
    ctx.restore();
  }

  async function drawHistoryItem(ctx, item) {
    if (!item) return;
    const points = item.points || item.path || item.coordinates;
    if (Array.isArray(points) && points.length) {
      ctx.save();
      ctx.beginPath(); ctx.moveTo(Number(points[0].x) || 0, Number(points[0].y) || 0);
      for (let i = 1; i < points.length; i++) ctx.lineTo(Number(points[i].x) || 0, Number(points[i].y) || 0);
      ctx.globalCompositeOperation = item.type === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = item.color || '#000000';
      ctx.lineWidth = Number(item.width) || 4;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
      return;
    }
    const imageSource = item.dataUrl || item.imageData || item.src;
    if ((item.type === 'image' || item.imageData || item.dataUrl) && imageSource) {
      const image = await loadImage(imageSource);
      if (image) {
        const x = Number(item.x) || 0, y = Number(item.y) || 0;
        const w = Number(item.width) || image.naturalWidth, h = Number(item.height) || image.naturalHeight;
        try { ctx.drawImage(image, x, y, w, h); } catch (_) {}
      }
      return;
    }
    const text = item.text || item.value || item.content;
    if (typeof text === 'string' && text.length) {
      ctx.save();
      const size = Number(item.fontSize || item.size) || 24;
      ctx.fillStyle = item.color || '#111827';
      ctx.font = `${item.fontStyle || ''} ${size}px ${item.fontFamily || 'Arial'}`.trim();
      ctx.textBaseline = 'top';
      const x = Number(item.x) || 0, y = Number(item.y) || 0;
      String(text).split('\n').forEach((line, index) => ctx.fillText(line, x, y + index * size * 1.25));
      ctx.restore();
    }
  }

  async function renderSavedPage(page) {
    const width = Math.max(1, Number(page && page.width) || 794);
    const height = Math.max(1, Number(page && page.height) || 1123);
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    drawPageBackground(ctx, width, height, (page && page.background) || 'white');
    const history = Array.isArray(page && page.history) ? page.history : (Array.isArray(page) ? page : []);
    for (const item of history) await drawHistoryItem(ctx, item);
    return canvas;
  }

  function safeFilename(value) {
    return String(value || 'Learning-Material').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-').slice(0, 90);
  }

  window.downloadMaterialPDF = async function (materialId, button) {
    if (!materialId) { alert('Material ID is missing.'); return; }
    const originalText = button ? button.innerHTML : '';
    if (button) { button.disabled = true; button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing PDF…'; }
    try {
      if (!window.API_BASE && typeof API_BASE === 'undefined') throw new Error('API configuration was not found on this page.');
      const base = typeof API_BASE !== 'undefined' ? API_BASE : window.API_BASE;
      const authToken = sessionStorage.getItem('token');
      if (!authToken) throw new Error('Your login session has expired. Please sign in again.');
      const response = await fetch(`${base}/api/annotation-materials/${encodeURIComponent(materialId)}`, {
        method: 'GET', headers: { Authorization: `Bearer ${authToken}` }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || `Unable to load this material (HTTP ${response.status}).`);
      const material = result.material || result.data || result;
      const pages = Array.isArray(material.pages) ? material.pages : [];
      if (!pages.length) throw new Error('This saved material does not contain any pages.');
      const jsPDF = await loadJsPDF();
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const logo = await loadImage(new URL('images/logo.png', window.location.href).href);
      const pageW = 210, pageH = 297, margin = 12;
      const headerH = 36, contentTop = 43, contentBottom = 284;
      const subject = String(material.subject || 'Learning Material');
      const chapter = `Chapter ${material.chapterNo || ''}${material.chapterName ? ' — ' + material.chapterName : ''}`.trim();
      const topic = material.topic ? `Topic: ${material.topic}` : '';
      const teacher = material.teacherName || (typeof teacherName !== 'undefined' ? teacherName : '') || 'Teacher';
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage('a4', 'portrait');
        pdf.setFillColor(255, 255, 255); pdf.rect(0, 0, pageW, pageH, 'F');

        // Logo stays at the top-left.
        if (logo) {
          try { pdf.addImage(logo, 'PNG', margin, 8, 22, 18, undefined, 'FAST'); }
          catch (_) { pdf.setTextColor(23, 59, 103); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.text('GOPES PINNACLE', margin, 17); }
        } else {
          pdf.setTextColor(23, 59, 103); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.text('GOPES PINNACLE', margin, 15);
        }

        // Academy heading is centered; the document details sit on the right.
        pdf.setTextColor(23, 59, 103);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.text('Gopes Pinnacle Academy', pageW / 2, 14, { align: 'center' });
        pdf.setFontSize(10);
        pdf.text('Class Meterial', pageW / 2, 21, { align: 'center' });

        const detailX = pageW - margin;
        const detailWidth = 75;
        let detailY = 11;
        pdf.setTextColor(35, 45, 60);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        const subjectLines = pdf.splitTextToSize(subject, detailWidth);
        pdf.text(subjectLines, detailX, detailY, { align: 'right', maxWidth: detailWidth });
        detailY += Math.max(4, subjectLines.length * 3.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        const chapterLines = pdf.splitTextToSize(chapter || 'Learning Material', detailWidth);
        pdf.text(chapterLines, detailX, detailY, { align: 'right', maxWidth: detailWidth });
        detailY += Math.max(4, chapterLines.length * 3.2);
        if (topic) {
          const topicLines = pdf.splitTextToSize(topic, detailWidth);
          pdf.text(topicLines, detailX, detailY, { align: 'right', maxWidth: detailWidth });
          detailY += Math.max(4, topicLines.length * 3.2);
        }
        pdf.setFontSize(7.5);
        const teacherLines = pdf.splitTextToSize(`Teacher: ${teacher}`, detailWidth);
        pdf.text(teacherLines, detailX, detailY, { align: 'right', maxWidth: detailWidth });
        pdf.setDrawColor(190, 202, 218); pdf.setLineWidth(0.4); pdf.line(margin, headerH, pageW - margin, headerH);
        const canvas = await renderSavedPage(pages[i]);
        const maxW = pageW - margin * 2, maxH = contentBottom - contentTop;
        const scale = Math.min(maxW / canvas.width, maxH / canvas.height);
        const imageW = canvas.width * scale, imageH = canvas.height * scale;
        const imageX = (pageW - imageW) / 2;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', imageX, contentTop, imageW, imageH, undefined, 'FAST');
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(100, 110, 125);
        pdf.text(`Page ${i + 1} of ${pages.length}`, pageW / 2, 291, { align: 'center' });
      }
      pdf.save(`${safeFilename(subject)}-${safeFilename(material.chapterName || material.chapterNo || 'Material')}.pdf`);
    } catch (error) {
      console.error('TEACHER MATERIAL PDF DOWNLOAD:', error);
      alert(error.message || 'Could not create the PDF. Please try again.');
    } finally {
      if (button) { button.disabled = false; button.innerHTML = originalText || '⬇ Download PDF'; }
    }
  };
})();
