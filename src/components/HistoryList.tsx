import React, { useState } from 'react';
import { Search, Download, Printer, Trash2, Eye, Award, FileText } from 'lucide-react';
import { CertificateData } from '../types/certificate';
import { exportCertificateToPdf, exportCertificateToPng, printCertificate } from '../utils/pdfGenerator';

interface HistoryListProps {
  history: CertificateData[];
  onSelectForEdit: (cert: CertificateData) => void;
  onDeleteFromHistory: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelectForEdit,
  onDeleteFromHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [certToDelete, setCertToDelete] = useState<{ id: string; name: string } | null>(null);

  const filteredHistory = history.filter((cert) => {
    const matchesSearch =
      cert.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.recipientRegistration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.hash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || cert.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      
      {/* PAINEL DE BUSCA E FILTROS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, UEB ou evento..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0F2C59]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-600 uppercase">Tipo:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-semibold text-slate-700"
          >
            <option value="all">Todos os Tipos</option>
            <option value="participacao">Participação</option>
            <option value="conclusao">Conclusão</option>
            <option value="honra">Honra ao Mérito</option>
            <option value="promessa">Promessa Escoteira</option>
            <option value="insignia">Insígnia</option>
          </select>
        </div>
      </div>

      {/* LISTAGEM DE CERTIFICADOS */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm text-slate-500">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-700 text-lg">Nenhum certificado encontrado</p>
          <p className="text-xs text-slate-500 mt-1">
            {history.length === 0
              ? 'Você ainda não salvou nenhum certificado nesta sessão.'
              : 'Tente ajustar os filtros de busca.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistory.map((cert) => (
            <div
              key={cert.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    {cert.type === 'honra' ? 'Honra ao Mérito' :
                     cert.type === 'conclusao' ? 'Conclusão' :
                     cert.type === 'promessa' ? 'Promessa Escoteira' :
                     cert.type === 'insignia' ? 'Insígnia' : 'Participação'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">{cert.hash}</span>
                </div>

                <h3 className="font-bold text-[#0F2C59] text-lg font-serif">
                  {cert.recipientName}
                </h3>
                {cert.recipientRegistration && (
                  <p className="text-xs font-bold text-amber-800 my-0.5">
                    Registro UEB nº {cert.recipientRegistration} {cert.section && `(${cert.section})`}
                  </p>
                )}

                <p className="text-xs text-slate-600 mt-2 line-clamp-1 font-medium">
                  Evento: <strong className="text-slate-800">{cert.eventName}</strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  {cert.location} &bull; Emissão: {cert.eventDate}
                </p>
              </div>

              {/* BOTÕES DE AÇÃO DO HISTÓRICO */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectForEdit(cert)}
                  className="flex items-center gap-1.5 text-xs text-[#0F2C59] hover:text-amber-600 font-bold"
                >
                  <Eye className="w-4 h-4" /> Visualizar / Editar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCertToDelete({ id: cert.id, name: cert.recipientName })}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir do histórico"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DO HISTÓRICO */}
      {certToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center font-serif">
                Excluir Certificado?
              </h3>
              <p className="text-sm text-slate-600 text-center mt-2">
                Deseja realmente remover o certificado emitido para{' '}
                <strong className="text-slate-900 font-semibold">"{certToDelete.name}"</strong>?
              </p>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCertToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteFromHistory(certToDelete.id);
                  setCertToDelete(null);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
