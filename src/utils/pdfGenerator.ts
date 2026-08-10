import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Convert any oklch(...) colors in cloned document to rgba(...) format
 * so html2canvas can parse styles without throwing errors.
 */
function fixOklchInClonedDoc(clonedDoc: Document): void {
  const canvas = clonedDoc.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  function replaceOklchInString(str: string): string {
    if (!str || !str.includes('oklch')) return str;
    return str.replace(/oklch\([^)]+\)/g, (match) => {
      if (!ctx) return match;
      try {
        ctx.fillStyle = '#000000';
        ctx.fillStyle = match;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
      } catch {
        return '#000000';
      }
    });
  }

  // 1. Process all <style> elements
  const styles = clonedDoc.querySelectorAll('style');
  styles.forEach((styleEl) => {
    if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
      styleEl.textContent = replaceOklchInString(styleEl.textContent);
    }
  });

  // 2. Process all elements with inline or computed styles
  const allElements = clonedDoc.querySelectorAll<HTMLElement>('*');
  allElements.forEach((el) => {
    if (el.style && el.style.cssText && el.style.cssText.includes('oklch')) {
      el.style.cssText = replaceOklchInString(el.style.cssText);
    }

    try {
      const computed = clonedDoc.defaultView?.getComputedStyle(el);
      if (computed) {
        const props = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke', 'boxShadow'];
        props.forEach((prop) => {
          const val = computed.getPropertyValue(prop);
          if (val && val.includes('oklch')) {
            el.style.setProperty(prop, replaceOklchInString(val), 'important');
          }
        });
      }
    } catch {
      // ignore computed style errors on unattached elements
    }
  });
}

export async function exportCertificateToPdf(
  elementId: string,
  fileName: string = 'certificado-gelb.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemento com ID '${elementId}' não foi encontrado.`);
  }

  // Captura o elemento em alta resolução (scale 2 para nitidez de impressão)
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: (clonedDoc) => {
      fixOklchInClonedDoc(clonedDoc);
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

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
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemento com ID '${elementId}' não foi encontrado.`);
  }

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: (clonedDoc) => {
      fixOklchInClonedDoc(clonedDoc);
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
