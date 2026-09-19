import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { GELB_LOGO_DATA_URL } from '../assets/gelbAssetsData';

// Configura o worker do pdfjs para funcionar tanto em Vite bundle quanto em ambiente browser
try {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
} catch {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
}

/**
 * Converts a base64 PDF or image Data URL to a high-resolution PNG Data URL of page 1.
 * Maintains 100% fidelity to the uploaded document structure.
 */
export async function convertPdfToImageDataUrl(pdfOrImageDataUrl: string): Promise<string> {
  if (!pdfOrImageDataUrl) return '';

  // Se já for uma imagem (PNG/JPG/WEBP), retorna diretamente sem perda
  if (pdfOrImageDataUrl.startsWith('data:image/')) {
    return pdfOrImageDataUrl;
  }

  try {
    const base64Data = pdfOrImageDataUrl.replace(/^data:application\/pdf;base64,/, '');
    const binaryStr = atob(base64Data);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const loadingTask = pdfjsLib.getDocument({
      data: bytes,
      useSystemFonts: true,
      standardFontDataUrl: undefined,
    });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    // Renderiza em altíssima resolução para manter nitidez dos traços e textos originais (escala 3.0)
    const viewport = page.getViewport({ scale: 3.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context indisponível');

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;
    return canvas.toDataURL('image/png', 1.0);
  } catch (err) {
    console.error('Falha ao renderizar página do PDF com pdfjs-dist:', err);
    throw err;
  }
}

/**
 * Generates an elegant fallback preview image when pdf.js is offline
 */
function generateFallbackPreviewCanvas(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1122;
  canvas.height = 793;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 1122, 793);

  // Borders
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#0F2C59';
  ctx.strokeRect(10, 10, 1102, 773);

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#FBBF24';
  ctx.strokeRect(26, 26, 1070, 741);

  // Header banner
  ctx.fillStyle = '#0F2C59';
  ctx.fillRect(40, 40, 1042, 60);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px serif';
  ctx.textAlign = 'center';
  ctx.fillText('GRUPO ESCOTEIRO LEÕES DE BLUMENAU - GELB 32/SC', 561, 78);

  ctx.fillStyle = '#0F2C59';
  ctx.font = 'bold 34px serif';
  ctx.fillText('CERTIFICADO OFICIAL', 561, 240);

  ctx.fillStyle = '#4B5563';
  ctx.font = '18px sans-serif';
  ctx.fillText('Modelo de Certificado Registrado no Core GELB', 561, 310);

  return canvas.toDataURL('image/png');
}

/**
 * Generates the authentic high-resolution artwork for the "Certificado de Acolhida dos Filhotes"
 * with playful organic waves, squirrels, badges, and exact printed lines matching the official model.
 */
export function generateAuthenticAcolhidaArtworkCanvas(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1122;
  canvas.height = 793;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Fundo limpo e suave
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 1122, 793);

  // 2. Ondas orgânicas coloridas no topo e lateral (Laranja, Verde, Marrom, Vermelho)
  // Onda Laranja Topo Esquerda
  ctx.fillStyle = '#E65100';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(340, 0);
  ctx.bezierCurveTo(310, 45, 260, 70, 180, 65);
  ctx.bezierCurveTo(110, 60, 50, 95, 0, 115);
  ctx.closePath();
  ctx.fill();

  // Onda Verde Topo Centro
  ctx.fillStyle = '#2E7D32';
  ctx.beginPath();
  ctx.moveTo(290, 0);
  ctx.lineTo(650, 0);
  ctx.bezierCurveTo(620, 55, 540, 75, 460, 60);
  ctx.bezierCurveTo(390, 48, 330, 65, 290, 0);
  ctx.closePath();
  ctx.fill();

  // Onda Marrom Terra
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.moveTo(610, 0);
  ctx.lineTo(880, 0);
  ctx.bezierCurveTo(860, 45, 800, 70, 740, 65);
  ctx.bezierCurveTo(680, 60, 635, 35, 610, 0);
  ctx.closePath();
  ctx.fill();

  // Onda Vermelha Topo Direita
  ctx.fillStyle = '#C62828';
  ctx.beginPath();
  ctx.moveTo(850, 0);
  ctx.lineTo(1122, 0);
  ctx.lineTo(1122, 130);
  ctx.bezierCurveTo(1060, 110, 1010, 70, 960, 65);
  ctx.bezierCurveTo(900, 60, 870, 30, 850, 0);
  ctx.closePath();
  ctx.fill();

  // Detalhe orgânico lateral direita
  ctx.fillStyle = '#2E7D32';
  ctx.beginPath();
  ctx.moveTo(1122, 190);
  ctx.bezierCurveTo(1080, 230, 1080, 310, 1122, 350);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#E65100';
  ctx.beginPath();
  ctx.moveTo(1122, 330);
  ctx.bezierCurveTo(1090, 370, 1090, 440, 1122, 470);
  ctx.closePath();
  ctx.fill();

  // 3. TÍTULO LÚDICO: CERTIFICADO DE ACOLHIDA
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Sombra suave do título
  ctx.font = '900 52px "Fredoka", "Nunito", "Arial Rounded MT Bold", sans-serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fillText('CERTIFICADO DE ACOLHIDA', 563, 172);

  // Letras coloridas ou degradê harmonioso
  const titleGrad = ctx.createLinearGradient(320, 170, 800, 170);
  titleGrad.addColorStop(0.0, '#E65100'); // Laranja vibrante
  titleGrad.addColorStop(0.35, '#2E7D32'); // Verde escoteiro
  titleGrad.addColorStop(0.70, '#5D4037'); // Marrom terra
  titleGrad.addColorStop(1.0, '#C62828'); // Vermelho caloroso
  ctx.fillStyle = titleGrad;
  ctx.fillText('CERTIFICADO DE ACOLHIDA', 561, 170);

  // 4. PARÁGRAFO COM LINHAS ESTRUTURADAS DE PREENCHIMENTO
  ctx.textAlign = 'left';
  ctx.fillStyle = '#263238';
  ctx.font = '600 20px "Nunito", "Segoe UI", sans-serif';

  const leftMargin = 220;
  const rightMargin = 890;

  // Linha 1: Certificamos que o (a) filhote, __________________________________________
  const l1Y = 252;
  ctx.fillText('Certificamos que o (a) filhote,', leftMargin, l1Y);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(476, l1Y + 3);
  ctx.lineTo(rightMargin, l1Y + 3);
  ctx.stroke();

  // Linha 2: acompanhado (a) dos responsáveis ______________________________________
  const l2Y = 290;
  ctx.fillText('acompanhado (a) dos responsáveis', leftMargin, l2Y);
  ctx.beginPath();
  ctx.moveTo(520, l2Y + 3);
  ctx.lineTo(rightMargin, l2Y + 3);
  ctx.stroke();

  // Linha 3: realizaram sua Cerimônia de Acolhida, passando a fazer parte da nossa
  const l3Y = 328;
  ctx.fillText('realizaram sua Cerimônia de Acolhida, passando a fazer parte da nossa', leftMargin, l3Y);

  // Linha 4: Ninhada do Grupo Escoteiro __________________________________________ .
  const l4Y = 366;
  ctx.fillText('Ninhada do Grupo Escoteiro', leftMargin, l4Y);
  ctx.beginPath();
  ctx.moveTo(465, l4Y + 3);
  ctx.lineTo(rightMargin - 15, l4Y + 3);
  ctx.stroke();
  ctx.fillText('.', rightMargin - 10, l4Y);

  // 5. LINHA DE DATA FRACIONADA: ____________________ , _____ de ____________________ de _________
  const dateY = 442;
  ctx.textAlign = 'center';
  ctx.font = '600 19px "Nunito", "Segoe UI", sans-serif';
  ctx.fillStyle = '#334155';

  // Traço Cidade (Blumenau - SC)
  ctx.beginPath();
  ctx.moveTo(310, dateY + 3);
  ctx.lineTo(460, dateY + 3);
  ctx.stroke();

  ctx.fillText(',', 475, dateY);

  // Traço Dia (25)
  ctx.beginPath();
  ctx.moveTo(490, dateY + 3);
  ctx.lineTo(540, dateY + 3);
  ctx.stroke();

  ctx.fillText('de', 565, dateY);

  // Traço Mês (Agosto)
  ctx.beginPath();
  ctx.moveTo(585, dateY + 3);
  ctx.lineTo(725, dateY + 3);
  ctx.stroke();

  ctx.fillText('de', 745, dateY);

  // Traço Ano (2026)
  ctx.beginPath();
  ctx.moveTo(765, dateY + 3);
  ctx.lineTo(845, dateY + 3);
  ctx.stroke();

  // 6. LINHAS DE ASSINATURA
  const sigLineY = 535;

  // Linha Esquerda
  ctx.beginPath();
  ctx.moveTo(310, sigLineY);
  ctx.lineTo(500, sigLineY);
  ctx.stroke();

  // Linha Direita
  ctx.beginPath();
  ctx.moveTo(610, sigLineY);
  ctx.lineTo(800, sigLineY);
  ctx.stroke();

  // Subtítulos das assinaturas
  ctx.font = 'bold 13px "Nunito", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Diretoria Executiva / GELB', 405, sigLineY + 20);
  ctx.fillText('Chefe da Seção / Filhotes', 705, sigLineY + 20);

  // 7. MASCOTES ESQUILOS NO CANTO INFERIOR ESQUERDO
  // Morrinho verde suave
  ctx.fillStyle = '#81C784';
  ctx.beginPath();
  ctx.ellipse(140, 760, 160, 75, 0, 0, Math.PI * 2);
  ctx.fill();

  // Esquilo Mãe
  ctx.fillStyle = '#A0522D';
  // Corpo
  ctx.beginPath();
  ctx.ellipse(135, 690, 32, 45, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Barriga bege
  ctx.fillStyle = '#F5DEB3';
  ctx.beginPath();
  ctx.ellipse(145, 695, 18, 30, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Cabeça
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.arc(155, 640, 24, 0, Math.PI * 2);
  ctx.fill();
  // Orelhas
  ctx.beginPath();
  ctx.moveTo(145, 622);
  ctx.lineTo(152, 605);
  ctx.lineTo(158, 622);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(160, 622);
  ctx.lineTo(168, 608);
  ctx.lineTo(172, 625);
  ctx.closePath();
  ctx.fill();
  // Olho
  ctx.fillStyle = '#212121';
  ctx.beginPath();
  ctx.arc(162, 638, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Focinho
  ctx.fillStyle = '#3E2723';
  ctx.beginPath();
  ctx.arc(172, 644, 3, 0, Math.PI * 2);
  ctx.fill();
  // Rabo felpudo grande
  ctx.fillStyle = '#8D4018';
  ctx.beginPath();
  ctx.moveTo(110, 720);
  ctx.bezierCurveTo(70, 700, 60, 610, 105, 595);
  ctx.bezierCurveTo(125, 590, 130, 625, 120, 655);
  ctx.bezierCurveTo(115, 675, 120, 705, 125, 715);
  ctx.closePath();
  ctx.fill();

  // Filhote de Esquilo ao lado
  ctx.fillStyle = '#B86834';
  ctx.beginPath();
  ctx.ellipse(195, 712, 18, 26, 0.15, 0, Math.PI * 2);
  ctx.fill();
  // Barriguinha filhote
  ctx.fillStyle = '#F5DEB3';
  ctx.beginPath();
  ctx.ellipse(190, 715, 10, 16, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Cabecinha filhote
  ctx.fillStyle = '#B86834';
  ctx.beginPath();
  ctx.arc(190, 680, 15, 0, Math.PI * 2);
  ctx.fill();
  // Olhinho
  ctx.fillStyle = '#212121';
  ctx.beginPath();
  ctx.arc(186, 679, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Rabinho do filhote
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.moveTo(210, 725);
  ctx.bezierCurveTo(230, 715, 235, 680, 218, 670);
  ctx.bezierCurveTo(210, 680, 210, 710, 205, 725);
  ctx.closePath();
  ctx.fill();

  // 8. BRASÕES NO CANTO INFERIOR DIREITO
  // Logo FILHOTES
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(895, 655, 95, 80, 12);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#E0E0E0';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '900 17px "Nunito", sans-serif';
  ctx.fillStyle = '#E65100';
  ctx.fillText('FILHOTES', 942, 695);
  ctx.font = 'bold 9px "Nunito", sans-serif';
  ctx.fillStyle = '#2E7D32';
  ctx.fillText('RAMO ESCOTEIRO', 942, 712);

  // Flor-de-lis Escoteiros do Brasil
  ctx.beginPath();
  ctx.roundRect(1005, 655, 85, 80, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1B5E20';
  ctx.font = 'bold 22px serif';
  ctx.fillText('⚜', 1047, 690);
  ctx.font = 'bold 8px "Nunito", sans-serif';
  ctx.fillText('ESCOTEIROS', 1047, 710);
  ctx.fillText('DO BRASIL', 1047, 720);

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Generates the official Starter PDF for "Certificado de Acolhida dos Filhotes"
 * and returns its base64 PDF Data URL and its rasterized preview PNG.
 */
export async function createDefaultAcolhidaFilhotesPdf(): Promise<{
  pdfDataUrl: string;
  previewImageDataUrl: string;
}> {
  // Gera a imagem autêntica de alta fidelidade
  const previewImageDataUrl = generateAuthenticAcolhidaArtworkCanvas();

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4', // 297mm x 210mm
  });

  // Insere a imagem da arte diretamente na página 1 do PDF em resolução perfeita
  doc.addImage(previewImageDataUrl, 'PNG', 0, 0, 297, 210);

  const pdfDataUrl = doc.output('datauristring');
  return { pdfDataUrl, previewImageDataUrl };
}
