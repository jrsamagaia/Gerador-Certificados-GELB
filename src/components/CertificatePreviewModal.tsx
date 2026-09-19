import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2, Download, Printer, FileText } from 'lucide-react';
import { CertificateCanvas } from './CertificateCanvas';
import { CertificateData } from '../types/certificate';
import { exportCertificateToPdf, exportCertificateToPng, printCertificate } from '../utils/pdfGenerator';

interface CertificatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateData;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  isOpen,
  onClose,
  certificate,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.15, 1.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.15, 0.45));
  };

  const handleResetZoom = () => {
    setZoomLevel(0.85);
  };

  const handleDownloadPdf = () => {
    exportCertificateToPdf(
      'modal-certificate-canvas',
      `certificado-gelb-${certificate.recipientName.toLowerCase().replace(/\s+/g, '-')}.pdf`
    );
  };

  const handleDownloadPng = () => {
    exportCertificateToPng(
      'modal-certificate-canvas',
      `certificado-gelb-${certificate.recipientName.toLowerCase().replace(/\s+/g, '-')}.png`
    );
  };

  const handlePrint = () => {
    printCertificate('modal-certificate-canvas');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm animate-fade-in text-stone-100"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* BARRA SUPERIOR DO MODAL */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#0F2C59] border-b border-amber-400/40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-400/20 text-amber-300 rounded-lg border border-amber-400/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 id="modal-title" className="text-base font-bold text-white font-serif tracking-wide">
              Visualização Fiel do Certificado Oficial GELB
            </h3>
            <p className="text-xs text-slate-300">
              {certificate.recipientName} &bull; Formato A4 Paisagem (1122 &times; 793 px)
            </p>
          </div>
        </div>

        {/* CONTROLES DE ZOOM E AÇÕES */}
        <div className="flex items-center gap-2">
          {/* Zoom */}
          <div className="flex items-center bg-blue-950/80 rounded-lg border border-blue-400/30 px-1 py-0.5 mr-2">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-blue-900 rounded transition-colors"
              title="Diminuir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-amber-300">
              {(zoomLevel * 100).toFixed(0)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-blue-900 rounded transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-blue-900 rounded transition-colors ml-1 border-l border-blue-800"
              title="Ajustar à tela"
            >
              Ajustar
            </button>
          </div>

          {/* Download & Print */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-[#0F2C59] rounded-lg text-xs font-bold transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/80 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-all border border-blue-400/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/80 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-all border border-blue-400/30"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>

          {/* Fechar */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-2"
            title="Fechar visualização"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ÁREA CENTRAL DE RENDERIZAÇÃO DO CERTIFICADO COM SCROLL E ZOOM */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-[#121110]">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
          className="shadow-2xl rounded-sm"
        >
          <CertificateCanvas
            certificate={certificate}
            containerId="modal-certificate-canvas"
          />
        </div>
      </div>

      {/* RODAPÉ DO MODAL COM INFORMAÇÕES DE ATALHO */}
      <div className="px-6 py-2 bg-stone-900/90 border-t border-stone-800 text-xs text-stone-400 flex items-center justify-between">
        <span>
          Modelo Atual:{' '}
          <strong className="text-stone-200">
            {certificate.useCustomTemplate && certificate.customTemplateName
              ? certificate.customTemplateName
              : `${certificate.category} - ${certificate.model}`}
          </strong>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-amber-400 font-mono font-semibold">
            Hash: {certificate.hash}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-300 hover:text-white font-semibold underline text-xs"
          >
            Voltar ao Editor
          </button>
        </div>
      </div>
    </div>
  );
};
