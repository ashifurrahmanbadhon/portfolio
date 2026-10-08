/**
 * Triggers a direct file download of the CV without navigating away from the current page.
 */
export async function triggerCvDownload(e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  const fileName = 'Ashifur_Rahman_CV.pdf';

  try {
    const res = await fetch('/api/download-cv');
    if (!res.ok) throw new Error('Download request failed');

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);
  } catch (err) {
    // Hidden iframe fallback ensures the window URL NEVER changes
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = '/api/download-cv';
    document.body.appendChild(iframe);
    setTimeout(() => {
      iframe.remove();
    }, 8000);
  }
}
