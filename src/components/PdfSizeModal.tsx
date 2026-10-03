import React, { useState } from 'react';
import { X, Download, FileText, Check, Sparkles, Printer, Layers, HelpCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PdfPageSize } from '../utils/pdfGenerator';

interface PdfSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (size: PdfPageSize) => Promise<void> | void;
  recipientName: string;
  eventName: string;
}

export const PdfSizeModal: React.FC<PdfSizeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  recipientName,
  eventName,
}) => {
  // Padrão memorizado ou A4
  const [selectedSize, setSelectedSize] = useState<PdfPageSize>(() => {
    const saved = localStorage.getItem('gelb_preferred_pdf_size');
    return saved === 'a5' ? 'a5' : 'a4';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [rememberPreference, setRememberPreference] = useState(true);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      if (rememberPreference) {
        localStorage.setItem('gelb_preferred_pdf_size', selectedSize);
      }
      await onConfirm(selectedSize);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#0F2C59', '#F59E0B', '#10B981', '#ffffff'],
      });
      onClose();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in text-stone-100"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-size-modal-title"
    >
      <div className="relative w-full max-w-xl bg-[#1e1c1a] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* CABEÇALHO DO MODAL */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#0F2C59] to-[#153e7e] border-b border-amber-400/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 id="pdf-size-modal-title" className="text-base sm:text-lg font-bold text-white font-serif tracking-wide flex items-center gap-2">
                <span>Escolha o Tamanho do Certificado</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-400 text-[#0F2C59] font-black">
                  PDF Oficial
                </span>
              </h3>
              <p className="text-xs text-blue-100/80">
                Selecione as dimensões para impressão do GELB 32/SC
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPO COM AS DUAS OPÇÕES VISUAIS: A4 e A5 */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Identificação do Homenageado */}
          <div className="bg-[#292624] px-3.5 py-2 rounded-xl border border-stone-700/80 flex items-center justify-between text-xs">
            <div className="truncate pr-2">
              <span className="text-stone-400">Certificado para: </span>
              <strong className="text-amber-300 font-bold">{recipientName || 'Homenageado'}</strong>
            </div>
            <div className="text-[11px] font-mono text-stone-400 bg-stone-800/90 px-2 py-0.5 rounded border border-stone-700 shrink-0">
              300 DPI Vetorial
            </div>
          </div>

          {/* GRID DE CARDS COM VISUALIZAÇÃO COMPARATIVA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* OPÇÃO 1: A4 (21 x 29,7 cm) */}
            <div
              onClick={() => setSelectedSize('a4')}
              className={`relative cursor-pointer rounded-xl p-4 transition-all border-2 flex flex-col justify-between select-none ${
                selectedSize === 'a4'
                  ? 'bg-gradient-to-b from-blue-950/60 to-[#18263e] border-amber-400 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/20'
                  : 'bg-[#252220] border-stone-700/80 hover:border-stone-500 hover:bg-[#2c2926]'
              }`}
            >
              {/* Badge superior */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  selectedSize === 'a4'
                    ? 'bg-amber-400 text-[#0F2C59]'
                    : 'bg-stone-700 text-stone-300'
                }`}>
                  Padrão Oficial UEB
                </span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  selectedSize === 'a4'
                    ? 'bg-amber-400 border-amber-400 text-[#0F2C59]'
                    : 'border-stone-600 bg-transparent'
                }`}>
                  {selectedSize === 'a4' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Diagrama Visual Proporcional A4 */}
              <div className="my-2 flex items-center justify-center">
                <div className="relative w-36 h-24 bg-gradient-to-br from-amber-50 to-stone-200 rounded-sm border-2 border-amber-600/70 shadow-md p-1.5 flex flex-col justify-between overflow-hidden">
                  <div className="border border-dashed border-amber-800/40 w-full h-full p-1 flex flex-col justify-between">
                    <div className="flex justify-between items-center opacity-70">
                      <div className="w-3 h-3 rounded-full bg-[#0F2C59]/40 flex items-center justify-center text-[7px] text-white">⚜</div>
                      <div className="h-1 w-10 bg-[#0F2C59]/30 rounded"></div>
                    </div>
                    <div className="space-y-0.5 text-center">
                      <div className="h-1 w-16 bg-[#0F2C59]/60 mx-auto rounded"></div>
                      <div className="h-0.5 w-12 bg-stone-500/50 mx-auto rounded"></div>
                    </div>
                    <div className="flex justify-between items-center opacity-60">
                      <div className="h-0.5 w-6 bg-stone-700/40"></div>
                      <div className="h-0.5 w-6 bg-stone-700/40"></div>
                    </div>
                  </div>
                  {/* Etiqueta de tamanho */}
                  <span className="absolute bottom-0.5 right-1 text-[8px] font-mono font-bold text-amber-950/70 bg-amber-200/80 px-1 rounded">
                    A4
                  </span>
                </div>
              </div>

              {/* Informações detalhadas */}
              <div className="text-center pt-2 border-t border-stone-700/50">
                <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1">
                  <span>21 × 29,7 cm</span>
                  <span className="text-[11px] text-amber-400 font-mono">(A4)</span>
                </h4>
                <p className="text-[11px] text-stone-300 font-medium mt-1 leading-tight">
                  Folha Inteira Paisagem
                </p>
                <p className="text-[10px] text-stone-400 mt-1.5 leading-snug">
                  Ideal para cerimônias solenes, porta-diplomas, quadros e molduras de parede.
                </p>
              </div>
            </div>

            {/* OPÇÃO 2: A5 (14,8 x 21 cm) */}
            <div
              onClick={() => setSelectedSize('a5')}
              className={`relative cursor-pointer rounded-xl p-4 transition-all border-2 flex flex-col justify-between select-none ${
                selectedSize === 'a5'
                  ? 'bg-gradient-to-b from-blue-950/60 to-[#18263e] border-amber-400 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/20'
                  : 'bg-[#252220] border-stone-700/80 hover:border-stone-500 hover:bg-[#2c2926]'
              }`}
            >
              {/* Badge superior */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  selectedSize === 'a5'
                    ? 'bg-amber-400 text-[#0F2C59]'
                    : 'bg-stone-700 text-stone-300'
                }`}>
                  Meia Folha &bull; Econômico
                </span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  selectedSize === 'a5'
                    ? 'bg-amber-400 border-amber-400 text-[#0F2C59]'
                    : 'border-stone-600 bg-transparent'
                }`}>
                  {selectedSize === 'a5' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Diagrama Visual Proporcional A5 */}
              <div className="my-2 flex items-center justify-center">
                <div className="relative w-28 h-20 bg-gradient-to-br from-amber-50 to-stone-200 rounded-sm border-2 border-amber-600/70 shadow-md p-1 flex flex-col justify-between overflow-hidden">
                  <div className="border border-dashed border-amber-800/40 w-full h-full p-1 flex flex-col justify-between">
                    <div className="flex justify-between items-center opacity-70">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0F2C59]/40 flex items-center justify-center text-[6px] text-white">⚜</div>
                      <div className="h-0.5 w-8 bg-[#0F2C59]/30 rounded"></div>
                    </div>
                    <div className="space-y-0.5 text-center">
                      <div className="h-0.5 w-12 bg-[#0F2C59]/60 mx-auto rounded"></div>
                      <div className="h-0.5 w-8 bg-stone-500/50 mx-auto rounded"></div>
                    </div>
                    <div className="flex justify-between items-center opacity-60">
                      <div className="h-0.5 w-4 bg-stone-700/40"></div>
                      <div className="h-0.5 w-4 bg-stone-700/40"></div>
                    </div>
                  </div>
                  {/* Etiqueta de tamanho */}
                  <span className="absolute bottom-0.5 right-1 text-[8px] font-mono font-bold text-amber-950/70 bg-amber-200/80 px-1 rounded">
                    A5
                  </span>
                </div>
              </div>

              {/* Informações detalhadas */}
              <div className="text-center pt-2 border-t border-stone-700/50">
                <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1">
                  <span>14,8 × 21 cm</span>
                  <span className="text-[11px] text-amber-400 font-mono">(A5)</span>
                </h4>
                <p className="text-[11px] text-stone-300 font-medium mt-1 leading-tight">
                  Meia Folha A4 Paisagem
                </p>
                <p className="text-[10px] text-stone-400 mt-1.5 leading-snug">
                  Ideal para cadernos escoteiros, pasta de progressão do jovem e economia de papel.
                </p>
              </div>
            </div>

          </div>

          {/* NOTA DE FIDELIDADE GEOMÉTRICA (ISO 216) */}
          <div className="bg-[#191715] p-3 rounded-xl border border-stone-700/60 flex items-start gap-2.5 text-xs text-stone-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-stone-200">
                Proporção Áurea Escoteira (1:√2) Preservada
              </p>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Tanto o formato <strong>A4 (21×29,7cm)</strong> quanto o <strong>A5 (14,8×21cm)</strong> compartilham a mesma razão matemática internacional. Os brasões, assinaturas e textos mantêm o alinhamento e a nitidez exatos.
              </p>
            </div>
          </div>

          {/* PREFERÊNCIA PARA PRÓXIMAS VEZES */}
          <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer pt-1 select-none">
            <input
              type="checkbox"
              checked={rememberPreference}
              onChange={(e) => setRememberPreference(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-400 bg-stone-800 border-stone-600"
            />
            <span>Lembrar formato selecionado ({selectedSize.toUpperCase()}) para os próximos downloads</span>
          </label>
        </div>

        {/* RODAPÉ DO MODAL COM AÇÕES */}
        <div className="bg-[#151412] px-5 py-3.5 border-t border-stone-700/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0F2C59] font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0F2C59] border-t-transparent rounded-full animate-spin" />
                <span>Gerando PDF em {selectedSize === 'a4' ? 'A4 (21x29,7cm)' : 'A5 (14,8x21cm)'}...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Baixar PDF em {selectedSize === 'a4' ? 'A4 (21×29,7 cm)' : 'A5 (14,8×21 cm)'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
