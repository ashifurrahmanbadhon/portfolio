/**
 * Triggers an instant, direct file download of the CV with zero latency without navigating away.
 */
export function triggerCvDownload(e, customUrl) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  const fileName = 'Ashifur_Rahman_CV.pdf';
  const targetUrl = customUrl || '/resume.pdf';

  // Instant native download trigger — 0ms network roundtrip wait
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = targetUrl;
  link.setAttribute('download', fileName);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    try {
      link.remove();
    } catch (_) {}
  }, 300);
}
