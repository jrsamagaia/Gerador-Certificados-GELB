import React, { useState } from 'react';
import { FileText, Download, Play, CheckCircle2, UserPlus, Sparkles, Layers } from 'lucide-react';
import { CertificateData, CertificateType, ScoutSection, BatchRecipient } from '../types/certificate';
import { generateCertificateHash } from '../utils/qrUtils';
import { exportCertificateToPdf } from '../utils/pdfGenerator';
import { GELB_LOGO_DATA_URL } from '../assets/gelbAssetsData';

interface BatchGeneratorProps {
  baseCertificate: CertificateData;
  onSaveBatchToHistory: (certs: CertificateData[]) => void;
}

export const BatchGenerator: React.FC<BatchGeneratorProps> = ({
  baseCertificate,
  onSaveBatchToHistory,
}) => {
  const [eventName, setEventName] = useState('Acampamento de Grupo GELB 2025');
  const [eventDate, setEventDate] = useState('18 de Outubro de 2025');
  const [location, setLocation] = useState('Blumenau - SC');
  const [workloadHours, setWorkloadHours] = useState(16);
  const [certType, setCertType] = useState<CertificateType>('participacao');
  
  const [rawText, setRawText] = useState(
    `Gabriel Schmidt Silva, 329182-1, Tropa Escoteira\nMariana Souza Costa, 318293-2, Alcatéia (Lobinhos)\nMatheus Henrique Fischer, 340192-3, Tropa Senior\nCamila Beatriz Voltolini, 301293-0, Clã Pionense\nRodrigo Becker, 102938-4, Adultos / Chefia`
  );

  const [generatedBatch, setGeneratedBatch] = useState<CertificateData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);

  const parseRecipients = (): BatchRecipient[] => {
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    return lines.map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      return {
        name: parts[0] || 'Escoteiro sem nome',
        registration: parts[1] || '',
        section: (parts[2] as ScoutSection) || 'Geral GELB',
      };
    });
  };

  const handleGenerateBatch = () => {
    setIsGenerating(true);
    const recipients = parseRecipients();

    const batch: CertificateData[] = recipients.map((r, idx) => {
      const hash = generateCertificateHash(r.name, r.registration, eventName, eventDate);
      return {
        ...baseCertificate,
        id: `batch-${Date.now()}-${idx}`,
        hash,
        type: certType,
        recipientName: r.name,
        recipientRegistration: r.registration,
        section: r.section,
        eventName,
        eventDate,
        location,
        workloadHours,
        issuedAt: new Date().toLocaleDateString('pt-BR'),
      };
    });

    setGeneratedBatch(batch);
    onSaveBatchToHistory(batch);
    setIsGenerating(false);
  };

  const handleDownloadAllPdf = async () => {
    if (generatedBatch.length === 0) return;

    for (let i = 0; i < generatedBatch.length; i++) {
      setExportProgress({ current: i + 1, total: generatedBatch.length });
      const cert = generatedBatch[i];
      const elementId = `batch-cert-item-${i}`;
      const fileName = `certificado-gelb-${cert.recipientName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      try {
        await exportCertificateToPdf(elementId, fileName);
      } catch (err) {
        console.error('Erro ao baixar certificado em lote:', err);
      }
    }
    setExportProgress(null);
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      
      {/* CABEÇALHO */}
      <div className="bg-[#0F2C59] text-white p-6 sm:p-8 rounded-2xl shadow-xl border-b-4 border-amber-400">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-400 text-[#0F2C59] rounded-xl shadow-md">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif uppercase tracking-wide text-amber-300">
              Gerador de Certificados em Lote GELB 32/SC
            </h1>
            <p className="text-sm text-slate-200 mt-1">
              Emita dezenas de certificados oficiais do Grupo Escoteiro Leões de Blumenau simultaneamente a partir de listas de participantes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORMULÁRIO DE LOTE */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5">
          <h2 className="text-base font-bold text-[#0F2C59] border-b pb-2">
            1. Dados do Evento e Configuração do Lote
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nome do Evento GELB *
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F2C59]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Data Oficial
              </label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Carga Horária
              </label>
              <input
                type="number"
                value={workloadHours}
                onChange={(e) => setWorkloadHours(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tipo de Certificado
            </label>
            <select
              value={certType}
              onChange={(e) => setCertType(e.target.value as CertificateType)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="participacao">Certificado de Participação</option>
              <option value="conclusao">Certificado de Conclusão de Curso</option>
              <option value="honra">Certificado de Honra ao Mérito</option>
              <option value="promessa">Certificado de Promessa Escoteira</option>
              <option value="insignia">Conquista de Insígnia</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Lista de Participantes (Formato: Nome, Registro UEB, Ramo)
            </label>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Nome completo, Registro UEB, Seção/Ramo"
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F2C59]"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Cole linhas separadas por vírgula. Exemplo: <code>Nome Completo, 123456-1, Tropa Escoteira</code>
            </p>
          </div>

          <button
            onClick={handleGenerateBatch}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#0F2C59] hover:bg-blue-900 text-amber-400 font-extrabold text-sm rounded-xl shadow-md transition-all"
          >
            <Play className="w-4 h-4 fill-amber-400" />
            <span>Gerar {parseRecipients().length} Certificados GELB</span>
          </button>
        </div>

        {/* PRÉ-VISUALIZAÇÃO DOS CERTIFICADOS GERADOS */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-[#0F2C59]">
                Certificados Gerados ({generatedBatch.length})
              </h3>
              <p className="text-xs text-slate-500">
                Prontos para download individual ou impressão conjunta
              </p>
            </div>

            {generatedBatch.length > 0 && (
              <button
                onClick={handleDownloadAllPdf}
                disabled={exportProgress !== null}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>
                  {exportProgress
                    ? `Baixando (${exportProgress.current}/${exportProgress.total})...`
                    : 'Baixar Todos os PDFs'}
                </span>
              </button>
            )}
          </div>

          {generatedBatch.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-slate-700">Nenhum lote gerado ainda</p>
              <p className="text-xs text-slate-500 mt-1">
                Configure a lista de participantes à esquerda e clique em "Gerar Certificados GELB".
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-h-[700px] overflow-y-auto p-2">
              {generatedBatch.map((cert, index) => (
                <div
                  key={cert.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0F2C59] text-amber-400 font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-bold text-slate-800 text-sm">{cert.recipientName}</span>
                      <span className="text-xs text-slate-500">({cert.recipientRegistration || 'Sem UEB'})</span>
                    </div>
                    <button
                      onClick={() => exportCertificateToPdf(`batch-cert-item-${index}`, `certificado-gelb-${index + 1}.pdf`)}
                      className="text-xs text-[#0F2C59] hover:underline font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>

                  {/* Renderizador de miniatura do certificado */}
                  <div className="transform scale-[0.45] origin-top-left -mb-[430px] -mr-[600px] pointer-events-none">
                    <div id={`batch-cert-item-${index}`}>
                      {/* Componente simplificado ou miniatura */}
                      <div className="w-[1122px] h-[793px] border-[14px] border-[#0F2C59] bg-white p-12 flex flex-col justify-between font-serif">
                        <div className="flex items-center justify-between border-b-2 border-amber-400 pb-4">
                          <div className="flex items-center gap-4">
                            <img src={GELB_LOGO_DATA_URL} className="w-20 h-20 object-contain" alt="Logo GELB" referrerPolicy="no-referrer" crossOrigin="anonymous" />
                            <div>
                              <h2 className="text-xl font-bold text-[#0F2C59]">O GRUPO ESCOTEIRO LEÕES DE BLUMENAU</h2>
                              <p className="text-xs text-amber-700 font-bold">GELB 32/SC &bull; Blumenau - SC</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-center my-6">
                          <h1 className="text-3xl font-extrabold text-[#0F2C59] uppercase">{cert.eventName}</h1>
                          <p className="text-lg text-slate-600 my-4">Certificamos que <strong className="text-amber-900">{cert.recipientName}</strong> participou com êxito.</p>
                          <p className="text-sm font-semibold text-[#0F2C59]">Blumenau - SC, {cert.eventDate}</p>
                        </div>
                        <div className="flex justify-between items-end border-t pt-4">
                          <span className="text-xs font-mono font-bold text-slate-500">Hash: {cert.hash}</span>
                          <span className="text-xs font-bold text-[#0F2C59]">Diretoria Executiva GELB 32/SC</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
