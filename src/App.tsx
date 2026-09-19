import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { CertificateCanvas } from './components/CertificateCanvas';
import { CertificateForm } from './components/CertificateForm';
import { BatchGenerator } from './components/BatchGenerator';
import { HistoryList } from './components/HistoryList';
import { CertificateValidator } from './components/CertificateValidator';
import { DirectoryInspector } from './components/DirectoryInspector';
import { CertificateData, CertificateTemplate } from './types/certificate';
import { GELB_LOGO_DATA_URL, SIGNATURE_PRESIDENTE_DATA_URL, SIGNATURE_DIRETORIA_DATA_URL } from './assets/gelbAssetsData';
import { generateCertificateHash } from './utils/qrUtils';
import { exportCertificateToPdf, exportCertificateToPng, printCertificate } from './utils/pdfGenerator';

import { getSavedFonts, loadGoogleFontsToHead } from './utils/gelbSettings';

const INITIAL_CERTIFICATE: CertificateData = {
  id: 'gelb-cert-default',
  hash: generateCertificateHash('Gabriel Schmidt Silva', '329182-1', 'Progressão - Acolhida', '25 de Agosto de 2026'),
  type: 'participacao',
  category: 'Progressão',
  model: 'Acolhida',
  groupName: 'Grupo Escoteiro Leões de Blumenau - GELB 32/SC',
  recipientName: 'Gabriel Schmidt Silva',
  recipientRegistration: '329182-1',
  responsaveis: 'Carlos Silva e Maria Schmidt',
  section: 'Tropa Escoteira',
  eventName: 'Progressão - Acolhida',
  eventDate: '25 de Agosto de 2026',
  dia: '25',
  mes: 'Agosto',
  ano: '2026',
  location: 'Blumenau - SC',
  workloadHours: 16,
  logoPath: GELB_LOGO_DATA_URL,
  showWatermark: true,
  borderStyle: 'classic-gelb',
  signatories: [
    {
      id: 'sig-1',
      name: 'Leidiana Vargas',
      role: 'Presidente - GELB 32/SC',
      signatureImage: SIGNATURE_PRESIDENTE_DATA_URL,
      enabled: true,
    },
    {
      id: 'sig-2',
      name: 'Diretoria de Métodos Educativos',
      role: 'Grupo Escoteiro Leões de Blumenau',
      signatureImage: SIGNATURE_DIRETORIA_DATA_URL,
      enabled: true,
    },
  ],
  issuedAt: new Date().toLocaleDateString('pt-BR'),
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('single');
  const [certificate, setCertificate] = useState<CertificateData>(INITIAL_CERTIFICATE);
  const [history, setHistory] = useState<CertificateData[]>([]);

  // Carrega histórico salvo do localStorage se existir
  useEffect(() => {
    try {
      const savedFonts = getSavedFonts();
      loadGoogleFontsToHead(savedFonts);

      const saved = localStorage.getItem('gelb_certificates_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      } else {
        setHistory([INITIAL_CERTIFICATE]);
      }
    } catch (e) {
      console.warn('Não foi possível carregar o histórico local:', e);
    }
  }, []);

  const saveHistoryToStorage = (updatedHistory: CertificateData[]) => {
    setHistory(updatedHistory);
    try {
      localStorage.setItem('gelb_certificates_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn('Erro ao salvar histórico:', e);
    }
  };

  const handleSaveToHistory = (certToSave: CertificateData) => {
    const exists = history.some((c) => c.id === certToSave.id);
    let updated: CertificateData[];
    if (exists) {
      updated = history.map((c) => (c.id === certToSave.id ? certToSave : c));
    } else {
      updated = [certToSave, ...history];
    }
    saveHistoryToStorage(updated);
  };

  const handleSaveBatchToHistory = (batch: CertificateData[]) => {
    const updated = [...batch, ...history];
    saveHistoryToStorage(updated);
  };

  const handleDeleteFromHistory = (id: string) => {
    const updated = history.filter((c) => c.id !== id);
    saveHistoryToStorage(updated);
  };

  const handleSelectForEdit = (cert: CertificateData) => {
    setCertificate(cert);
    setActiveTab('single');
  };

  const handleSelectTemplateForIssuer = (template: CertificateTemplate) => {
    setCertificate((prev) => ({
      ...prev,
      category: template.category,
      model: template.model,
      eventName: `${template.category} - ${template.model}`,
      customTemplateId: template.id,
      customTemplateName: template.name,
      customTemplateBackground: template.previewImageDataUrl,
      useCustomTemplate: true,
    }));
    setActiveTab('single');
  };

  const handleDownloadPdf = () => {
    exportCertificateToPdf(
      'export-certificate-canvas',
      `certificado-gelb-${certificate.recipientName.toLowerCase().replace(/\s+/g, '-')}.pdf`
    );
  };

  const handleDownloadPng = () => {
    exportCertificateToPng(
      'export-certificate-canvas',
      `certificado-gelb-${certificate.recipientName.toLowerCase().replace(/\s+/g, '-')}.png`
    );
  };

  const handlePrint = () => {
    printCertificate('export-certificate-canvas');
  };

  return (
    <div className="min-h-screen bg-[#181615] text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      
      {/* NAVBAR NAVEGAÇÃO GELB */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        issuedCount={history.length}
      />

      {/* CONTEÚDO PRINCIPAL DE ACORDO COM A ABA ATIVA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* ABA 1: EMISSOR INDIVIDUAL (Formulário + Pré-visualização em tempo real) */}
        {activeTab === 'single' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* FORMULÁRIO DE EDIÇÃO */}
            <div className="xl:col-span-5">
              <CertificateForm
                certificate={certificate}
                setCertificate={setCertificate}
                onSaveToHistory={handleSaveToHistory}
                onDownloadPdf={handleDownloadPdf}
                onDownloadPng={handleDownloadPng}
                onPrint={handlePrint}
              />
            </div>

            {/* ÁREA DE PRÉ-VISUALIZAÇÃO DO CERTIFICADO */}
            <div className="xl:col-span-7 flex flex-col items-center gap-4">
              <div className="w-full bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-md">
                <div className="flex items-center justify-between mb-4 border-b pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#0F2C59] font-serif">
                      Pré-visualização do Certificado Oficial GELB
                    </h3>
                    <p className="text-xs text-slate-500">
                      Formato A4 Paisagem &bull; Impressão e PDF de alta resolução
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-300">
                    {certificate.hash}
                  </span>
                </div>

                {/* ESCALONAMENTO RESPONSIVO DO CERTIFICADO */}
                <div className="w-full overflow-x-auto flex justify-center py-2 bg-slate-200/60 rounded-xl border border-slate-300/80">
                  <div className="transform scale-[0.52] sm:scale-[0.65] md:scale-[0.75] lg:scale-[0.82] origin-top my-[-180px] sm:my-[-120px] md:my-[-80px]">
                    <CertificateCanvas
                      certificate={certificate}
                      containerId="main-certificate-canvas"
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ABA 2: EMISSÃO EM LOTE */}
        {activeTab === 'batch' && (
          <BatchGenerator
            baseCertificate={certificate}
            onSaveBatchToHistory={handleSaveBatchToHistory}
          />
        )}

        {/* ABA 3: HISTÓRICO DE CERTIFICADOS */}
        {activeTab === 'history' && (
          <HistoryList
            history={history}
            onSelectForEdit={handleSelectForEdit}
            onDeleteFromHistory={handleDeleteFromHistory}
          />
        )}

        {/* ABA 4: VALIDADOR DE QR CODE E HASH */}
        {activeTab === 'validate' && (
          <CertificateValidator
            history={history}
            initialHash={certificate.hash}
          />
        )}

        {/* ABA 5: INSPETOR DE DIRETÓRIOS E ASSETS GELB */}
        {activeTab === 'directories' && (
          <DirectoryInspector
            onSelectTemplateForIssuer={handleSelectTemplateForIssuer}
          />
        )}

        {/* CONTAINER OCULTO NÃO-TRANSFORMADO DEDICADO EXCLUSIVAMENTE À EXPORTAÇÃO EM ALTA RESOLUÇÃO */}
        <div
          style={{
            position: 'fixed',
            left: '-10000px',
            top: 0,
            width: '1122px',
            height: '793px',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: -9999,
          }}
          aria-hidden="true"
        >
          <CertificateCanvas
            certificate={certificate}
            containerId="export-certificate-canvas"
            isPrintPreview
          />
        </div>

      </main>

      {/* RODAPÉ INSTITUCIONAL */}
      <footer className="bg-[#0F2C59] text-slate-300 py-6 border-t-2 border-amber-400 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white">
              Grupo Escoteiro Leões de Blumenau (GELB 32/SC) &bull; Fundado em 1958
            </p>
            <p className="text-slate-400 text-[11px]">
              Sempre Alerta para Servir &bull; Blumenau - Santa Catarina
            </p>
          </div>
          <div className="text-amber-300 font-medium text-[11px]">
            Sistema de Emissão e Autenticidade de Certificados Oficial GELB
          </div>
        </div>
      </footer>

    </div>
  );
}
