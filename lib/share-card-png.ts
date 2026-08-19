/** Branded share card drawn on canvas — avoids html2canvas + Tailwind oklch failures. */

export function createShareCardCanvas(opts: {
  brand: string;
  allInLabel: string;
  allInValue: string;
  processingLabel: string;
  processingValue: string;
  gradeText?: string;
  footer: string;
}): HTMLCanvasElement {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not available");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, width, 96);
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 32px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(opts.brand, 56, 62);

  ctx.fillStyle = "#64748b";
  ctx.font = "600 24px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(opts.allInLabel, 56, 190);

  ctx.fillStyle = "#0f172a";
  ctx.font = "800 108px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(opts.allInValue, 56, 310);

  ctx.fillStyle = "#334155";
  ctx.font = "600 28px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(`${opts.processingLabel}  ${opts.processingValue}`, 56, 390);

  if (opts.gradeText) {
    ctx.fillStyle = "#1d4ed8";
    ctx.font = "700 28px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(opts.gradeText, 56, 450);
  }

  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(56, 530, width - 112, 2);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 22px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(opts.footer, 56, 578);

  return canvas;
}

export function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not encode PNG"));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}
