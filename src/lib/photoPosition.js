/**
 * Comprehensive 2D Photo Position & Zoom Parser and Formatter
 * Supports horizontal (X), vertical (Y), and continuous zoom scaling (1.0x - 3.0x).
 */

export function parsePhotoPosition(posStr) {
  if (!posStr || typeof posStr !== "string") {
    return {
      x: 50,
      y: 50,
      zoom: 1,
      objectPosition: "50% 50%",
      style: { objectPosition: "50% 50%" },
    };
  }

  const parts = posStr.trim().split(/\s+/);
  let rawX = parts[0] || "50%";
  let rawY = parts[1] || "50%";
  let zoom = 1;

  if (parts.length >= 3) {
    const parsedZoom = parseFloat(parts[2]);
    if (!isNaN(parsedZoom) && parsedZoom >= 1 && parsedZoom <= 4) {
      zoom = Math.round(parsedZoom * 100) / 100;
    }
  }

  // Handle keywords
  if (rawX === "center") rawX = "50%";
  if (rawX === "left") rawX = "0%";
  if (rawX === "right") rawX = "100%";

  if (rawY === "center") rawY = "50%";
  if (rawY === "top") rawY = "0%";
  if (rawY === "bottom") rawY = "100%";

  const numX = Math.max(0, Math.min(100, Math.round(parseFloat(rawX) || 50)));
  const numY = Math.max(0, Math.min(100, Math.round(parseFloat(rawY) || 50)));

  const objectPosition = `${numX}% ${numY}%`;
  const style = {
    objectPosition,
    ...(zoom > 1
      ? {
          transform: `scale(${zoom})`,
          transformOrigin: `${numX}% ${numY}%`,
        }
      : {}),
  };

  return {
    x: numX,
    y: numY,
    zoom,
    objectPosition,
    style,
    formatString: () => (zoom > 1 ? `${numX}% ${numY}% ${zoom}` : `${numX}% ${numY}%`),
  };
}

export function formatPhotoPosition(x, y, zoom = 1) {
  const cleanX = Math.max(0, Math.min(100, Math.round(x)));
  const cleanY = Math.max(0, Math.min(100, Math.round(y)));
  const cleanZoom = Math.max(1, Math.min(3, Math.round((zoom || 1) * 100) / 100));
  return cleanZoom > 1 ? `${cleanX}% ${cleanY}% ${cleanZoom}` : `${cleanX}% ${cleanY}%`;
}
