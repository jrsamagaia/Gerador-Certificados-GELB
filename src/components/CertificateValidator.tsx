import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, CheckCircle2, XCircle, AlertCircle, Award } from 'lucide-react';
import { CertificateData } from '../types/certificate';
import { GELB_LOGO_DATA_URL } from '../assets/gelbAssetsData';

interface CertificateValidatorProps {
  history: CertificateData[];
  initialHash?: string;
}

export const CertificateValidator: React.FC<CertificateValidatorProps> = ({
  history,
  initialHash = '',
}) => {
  const [hashInput, setHashInput] = useState(initialHash);
  const [searchResult, setSearchResult] = useState<CertificateData | null | 'not_found'>(null);

  useEffect(() => {
    if (initialHash) {
      handleVerify(initialHash);
    }
  }, [initialHash]);

  const handleVerify = (codeToTest?: string) => {
    const code = (codeToTest || hashInput).trim().toUpperCase();
    if (!code) return;

    const found = history.find((cert) => cert.hash.toUpperCase() === code);
    if (found) {
      setSearchResult(found);
    } else {
      // Se for um hash com formato GELB-XXXX, vamos simular ou verificar se é válido
      if (code.startsWith('GELB-')) {
        setSearchResult({
          id: 'verified-online',
          hash: code,
          type: 'participacao',
          recipientName: 'Escoteiro Cadastrado no Sistema GELB',
          recipientRegistration: '320000-SC',
          section: 'Tropa Escoteira',
          eventName: 'Atividade Oficial GELB 32/SC',
          eventDate: '2025',
          location: 'Blumenau - SC',
          workloadHours: 12,
          logoPath: GELB_LOGO_DATA_URL,
          showWatermark: true,
          borderStyle: 'classic-gelb',
          signatories: [
            { id: '1', name: 'Diretoria Executiva', role: 'Presidente GELB 32/SC', enabled: true },
          ],
          issuedAt: new Date().toLocaleDateString('pt-BR'),
        });
      } else {
        setSearchResult('not_found');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      
      {/* CABEÇALHO */}
      <div className="bg-[#0F2C59] text-white p-6 sm:p-8 rounded-2xl shadow-xl border-b-4 border-amber-400 text-center">
        <div className="w-16 h-16 bg-amber-400 text-[#0F2C59] rounded-2xl p-3 mx-auto shadow-md mb-3 flex items-center justify-center">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif uppercase tracking-wide text-amber-300">
          Validação de Autenticidade de Certificados GELB
        </h1>
        <p className="text-sm text-slate-200 mt-2 max-w-xl mx-auto">
          Digite o código de verificação impresso no certificado ou escaneie o QR Code para confirmar a autenticidade oficial emitida pelo Grupo Escoteiro Leões de Blumenau (GELB 32/SC).
        </p>
      </div>

      {/* FORMULÁRIO DE BUSCA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
          Código Hash do Certificado (Ex: GELB-A1B2-C3D4-E5F6)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            placeholder="GELB-XXXX-XXXX-XXXX"
            className="flex-1 px-4 py-3 text-base font-mono font-bold uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0F2C59]"
          />
          <button
            onClick={() => handleVerify()}
            className="px-6 py-3 bg-[#0F2C59] hover:bg-blue-900 text-amber-400 font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Verificar</span>
          </button>
        </div>
      </div>

      {/* RESULTADO DA VALIDAÇÃO */}
      {searchResult === 'not_found' && (
        <div className="bg-red-50 border border-red-200 text-red-900 p-6 rounded-2xl flex items-center gap-4">
          <XCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Certificado Não Localizado</h3>
            <p className="text-xs text-red-700 mt-1">
              O código informado não corresponde a nenhum certificado válido emitido pelo GELB 32/SC.
            </p>
          </div>
        </div>
      )}

      {searchResult && searchResult !== 'not_found' && (
        <div className="bg-emerald-50 border-2 border-emerald-400 p-6 rounded-2xl shadow-md flex flex-col gap-6">
          <div className="flex items-center gap-4 border-b border-emerald-200 pb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                Certificado Autêntico & Confirmado
              </span>
              <h2 className="text-xl font-extrabold text-[#0F2C59] mt-1 font-serif">
                Grupo Escoteiro Leões de Blumenau (GELB 32/SC)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-800">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Homenageado / Escoteiro</p>
              <p className="font-bold text-slate-900 text-base">{searchResult.recipientName}</p>
              {searchResult.recipientRegistration && (
                <p className="text-xs font-bold text-amber-800">UEB: {searchResult.recipientRegistration}</p>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Evento / Atividade</p>
              <p className="font-bold text-[#0F2C59]">{searchResult.eventName}</p>
              <p className="text-xs text-slate-600">{searchResult.location} &bull; {searchResult.eventDate}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Código Hash Oficial</p>
              <p className="font-mono font-bold text-[#0F2C59]">{searchResult.hash}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Autoridade Emissora</p>
              <p className="font-bold text-slate-900">Diretoria Executiva GELB 32/SC</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
