import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/**
 * Sanitize modern CSS colors (oklab, oklch, lab, lch) in the cloned document
 * by converting them to standard rgba(...) values where necessary.
 * IMPORTANT: Never apply stroke or fill to non-SVG HTML elements to prevent duplicate text shadows.
 */
function fixModernColorsInClonedDoc(clonedDoc: Document, targetElId?: string): void {
  const canvas = clonedDoc.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  function replaceModernColorsInString(str: string): string {
    if (!str) return str;
    if (!str.includes('oklch') && !str.includes('oklab') && !str.includes('lab(') && !str.includes('lch(')) {
      return str;
    }
    return str.replace(/(?:oklab|oklch|lab|lch)\([^)]+\)/gi, (match) => {
      if (!ctx) return match;
      try {
        ctx.fillStyle = '#ffffff';
        ctx.fillStyle = match;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
      } catch {
        return match;
      }
    });
  }

  // 1. Process all <style> elements in clonedDoc
  const styles = clonedDoc.querySelectorAll('style');
  styles.forEach((styleEl) => {
    if (styleEl.textContent && (styleEl.textContent.includes('okl') || styleEl.textContent.includes('lab(') || styleEl.textContent.includes('lch('))) {
      styleEl.textContent = replaceModernColorsInString(styleEl.textContent);
    }
  });

  // 2. Process only the target element tree to prevent global side-effects
  const root = (targetElId && clonedDoc.getElementById(targetElId)) || clonedDoc.body;
  const allElements = root.querySelectorAll<HTMLElement>('*');

  allElements.forEach((el) => {
    // Only sanitize inline styles if they contain modern color functions
    if (el.style && el.style.cssText && (el.style.cssText.includes('okl') || el.style.cssText.includes('lab(') || el.style.cssText.includes('lch('))) {
      el.style.cssText = replaceModernColorsInString(el.style.cssText);
    }

    try {
      const computed = clonedDoc.defaultView?.getComputedStyle(el);
      if (computed) {
        // Distinguish between SVG elements and standard HTML elements
        const isSvg = el instanceof SVGElement;
        const propsToInspect = isSvg
          ? ['fill', 'stroke', 'color', 'backgroundColor', 'borderColor']
          : ['color', 'backgroundColor', 'borderColor', 'outlineColor'];

        propsToInspect.forEach((prop) => {
          const val = computed.getPropertyValue(prop);
          if (val && (val.includes('okl') || val.includes('lab') || val.includes('lch'))) {
            el.style.setProperty(prop, replaceModernColorsInString(val), 'important');
          }
        });
      }
    } catch {
      // ignore computed style errors on unattached elements
    }
  });
}

/**
 * Normalizes ancestor transforms and syncs webfonts for clean canvas rendering
 */
async function prepareClonedDocument(clonedDoc: Document, targetElId: string): Promise<void> {
  // 1. Synchronize loaded fonts from parent document to iframe document
  if (document.fonts) {
    try {
      await document.fonts.ready;
      if (clonedDoc.fonts) {
        document.fonts.forEach((font) => {
          try {
            clonedDoc.fonts.add(font);
          } catch {
            // ignore duplicates
          }
        });
        await clonedDoc.fonts.ready;
      }
    } catch {
      // fallback
    }
  }

  // 2. Locate target element and strip CSS transforms and negative margins from all ancestors
  const clonedElement = clonedDoc.getElementById(targetElId);
  if (clonedElement) {
    let parent: HTMLElement | null = clonedElement.parentElement;
    while (parent && parent !== clonedDoc.body) {
      parent.style.transform = 'none';
      parent.style.webkitTransform = 'none';
      parent.style.margin = '0';
      parent.style.padding = '0';
      parent.style.width = 'auto';
      parent.style.height = 'auto';
      parent = parent.parentElement;
    }

    clonedElement.style.transform = 'none';
    clonedElement.style.webkitTransform = 'none';
    clonedElement.style.margin = '0';
  }

  // 3. Sanitize colors safely
  fixModernColorsInClonedDoc(clonedDoc, targetElId);
}

export async function exportCertificateToPdf(
  elementId: string,
  fileName: string = 'certificado-gelb.pdf'
): Promise<void> {
  // Check if dedicated unscaled export canvas is available
  const targetId = document.getElementById('export-certificate-canvas') ? 'export-certificate-canvas' : elementId;
  const element = document.getElementById(targetId);
  if (!element) {
    throw new Error(`Elemento com ID '${targetId}' não foi encontrado.`);
  }

  // Wait for webfonts before rasterizing
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  // Captura o elemento em alta resolução (scale 2 para nitidez perfeita em A4)
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: async (clonedDoc) => {
      await prepareClonedDocument(clonedDoc, targetId);
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.96);

  // PDF em orientação Paisagem (Landscape), formato A4
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 297mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 210mm

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(fileName);
}

export async function exportCertificateToPng(
  elementId: string,
  fileName: string = 'certificado-gelb.png'
): Promise<void> {
  // Check if dedicated unscaled export canvas is available
  const targetId = document.getElementById('export-certificate-canvas') ? 'export-certificate-canvas' : elementId;
  const element = document.getElementById(targetId);
  if (!element) {
    throw new Error(`Elemento com ID '${targetId}' não foi encontrado.`);
  }

  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: async (clonedDoc) => {
      await prepareClonedDocument(clonedDoc, targetId);
    },
  });

  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = image;
  link.download = fileName;
  link.click();
}

export function printCertificate(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const content = element.outerHTML;
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Imprimir Certificado GELB 32/SC</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@600;700;800&family=Great+Vibes&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=Playfair+Display:ital,wght@0,600;0,700;0,800&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .certificate-container {
            width: 297mm;
            height: 210mm;
            page-break-after: always;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          ${content}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 600);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
