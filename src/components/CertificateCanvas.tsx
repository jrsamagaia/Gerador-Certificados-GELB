import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CertificateData } from '../types/certificate';
import { GELB_TEXT_TEMPLATES } from '../config/gelbConfig';
import { GELB_LOGO_DATA_URL, FLOR_DE_LIS_DATA_URL, ESCOTEIROS_DO_BRASIL_LOGO_DATA_URL } from '../assets/gelbAssetsData';
import { getVerificationUrl } from '../utils/qrUtils';
import { getOfficialLogo } from '../utils/gelbSettings';

interface CertificateCanvasProps {
  certificate: CertificateData;
  containerId?: string;
  isPrintPreview?: boolean;
}

export const CertificateCanvas: React.FC<CertificateCanvasProps> = ({
  certificate,
  containerId = 'certificate-render-canvas',
  isPrintPreview = false,
}) => {
  const verificationUrl = getVerificationUrl(certificate.hash);

  // Seleção de borda com base no estilo
  const getBorderClasses = () => {
    switch (certificate.borderStyle) {
      case 'gold-honor':
        return 'border-[12px] border-amber-600 outline outline-4 outline-amber-400 outline-offset-[-16px] bg-gradient-to-br from-amber-50/60 via-white to-amber-50/40';
      case 'scout-green':
        return 'border-[12px] border-emerald-800 outline outline-4 outline-amber-500 outline-offset-[-16px] bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/30';
      case 'minimalist':
        return 'border-[8px] border-blue-900 bg-white';
      case 'classic-gelb':
      default:
        return 'border-[14px] border-[#0F2C59] outline outline-4 outline-[#FBBF24] outline-offset-[-18px] bg-gradient-to-b from-slate-50/80 via-white to-amber-50/20';
    }
  };

  // Monta o título dinâmico com base na Categoria e Modelo
  const getTitle = () => {
    if (certificate.model) {
      return certificate.model.toUpperCase();
    }
    switch (certificate.type) {
      case 'honra': return 'CERTIFICADO DE HONRA AO MÉRITO';
      case 'conclusao': return 'CERTIFICADO DE CONCLUSÃO';
      case 'promessa': return 'CERTIFICADO DE PROMESSA ESCOTEIRA';
      case 'insignia': return 'CERTIFICADO DE INSÍGNIA ESCOTEIRA';
      default: return 'CERTIFICADO DE PARTICIPAÇÃO';
    }
  };

  // Monta o texto descritivo do certificado
  const renderBodyText = () => {
    if (certificate.customText && certificate.customText.trim() !== '') {
      return certificate.customText;
    }

    const group = certificate.groupName || 'Grupo Escoteiro Leões de Blumenau - GELB 32/SC';

    // Regras por categoria da interface das imagens
    if (certificate.category === 'Progressão') {
      let txt = `${group} confere o certificado de ${certificate.model || 'Progressão Escoteira'}, em reconhecimento à sua evolução, aprendizado e participação exemplar no Movimento Escoteiro.`;
      if (certificate.responsaveis) {
        txt += ` Agradecemos aos responsáveis (${certificate.responsaveis}) pelo apoio continuo.`;
      }
      return txt;
    }

    if (certificate.category === 'Especialidades') {
      const esp = certificate.nomeEspecialidade || 'Especialidade Escoteira';
      const niv = certificate.nivelConquistado || '1';
      const itens = certificate.itensCompletados ? ` (itens completados: ${certificate.itensCompletados})` : '';
      return `${group} certifica a conquista da especialidade de ${esp} - Nível ${niv}${itens}, em reconhecimento ao cumprimento de todos os requisitos exigidos.`;
    }

    if (certificate.category === 'Promessas') {
      return `${group} certifica a realização solene da Promessa Escoteira, em compromisso de cumprir os deveres para com Deus e a Pátria, ajudar o próximo e obedecer à Lei Escoteira.`;
    }

    if (certificate.category === 'Insígnias de Modalidade') {
      return `${group} confere a ${certificate.model || 'Insígnia de Modalidade'}, celebrando a dedicação e conhecimento técnico nas atividades escoteiras especializadas.`;
    }

    if (certificate.category === 'Interesse Especial') {
      const r = certificate.ramo ? ` do ramo ${certificate.ramo}` : '';
      return `${group} certifica a conquista da ${certificate.model || 'Insígnia de Interesse Especial'}${r}, demonstrando engajamento socioambiental e espírito cidadão.`;
    }

    if (certificate.category === 'Monitoria') {
      const mp = certificate.matilhaPatrulha ? ` na Matilha/Patrulha ${certificate.matilhaPatrulha}` : '';
      return `${group} certifica o desempenho com responsabilidade e liderança na função de ${certificate.model || 'Monitor'}${mp}.`;
    }

    if (certificate.category === 'Atividade') {
      const anos = certificate.quantidadeAnos || '1';
      return `${group} confere a Estrela de Atividade correspondente a ${anos} ano(s) de dedicação, assiduidade e espírito de servir.`;
    }

    if (certificate.category === 'Expansão') {
      const membros = certificate.quantidadeNovosMembros ? ` por trazer ${certificate.quantidadeNovosMembros} novo(s) membro(s) para o escotismo` : '';
      return `${group} certifica a conquista do distintivo de ${certificate.model || 'Recrutador'}${membros}, contribuindo para o crescimento do Movimento Escoteiro.`;
    }

    // Padrão fallback
    return `${group} certifica a participação ativa na atividade ${certificate.eventName || 'Oficial GELB'}, realizada em ${certificate.location || 'Blumenau - SC'}.`;
  };

  return (
    <div
      id={containerId}
      className={`relative w-[1122px] h-[793px] mx-auto overflow-hidden shadow-2xl transition-all ${getBorderClasses()} ${
        isPrintPreview ? 'scale-100' : ''
      }`}
      style={{
        boxSizing: 'border-box',
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {/* Cantoneiras Escoteiras Decorativas de Canto */}
      <div className="absolute top-5 left-5 w-12 h-12 border-t-2 border-l-2 border-[#FBBF24] z-10 pointer-events-none" />
      <div className="absolute top-5 right-5 w-12 h-12 border-t-2 border-r-2 border-[#FBBF24] z-10 pointer-events-none" />
      <div className="absolute bottom-5 left-5 w-12 h-12 border-b-2 border-l-2 border-[#FBBF24] z-10 pointer-events-none" />
      <div className="absolute bottom-5 right-5 w-12 h-12 border-b-2 border-r-2 border-[#FBBF24] z-10 pointer-events-none" />

      {/* Marca d'água de Flor de Lis no fundo */}
      {certificate.showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] z-0">
          <img src={FLOR_DE_LIS_DATA_URL} alt="Marca d'água Flor de Lis GELB" className="w-[520px] h-[520px] object-contain" />
        </div>
      )}

      {/* Conteúdo Principal do Certificado */}
      <div className="relative z-10 h-full flex flex-col justify-between p-12 text-slate-800">
        
        {/* CABEÇALHO OFICIAL */}
        <div className="flex items-center justify-between border-b-2 border-amber-400/60 pb-4">
          {/* LOGO DA UEL / GRUPO ESCOTEIRO NO CANTO SUPERIOR ESQUERDO */}
          <div className="flex items-center gap-4">
            <img
              src={certificate.uelLogoPath || (certificate.logoPath && certificate.logoPath.startsWith('data:') ? certificate.logoPath : getOfficialLogo())}
              alt="Logo UEL / Grupo Escoteiro"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="w-20 h-20 object-contain drop-shadow-md"
            />
            <div>
              <h3 className="text-lg font-bold tracking-wide text-[#0F2C59] uppercase font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
                {certificate.groupName || 'O GRUPO ESCOTEIRO LEÕES DE BLUMENAU'}
              </h3>
              <p className="text-xs font-semibold text-amber-700 tracking-wider uppercase">
                GELB 32/SC &bull; Fundado em 1958 &bull; Blumenau / SC
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Reconhecido de Utilidade Pública &bull; União dos Escoteiros do Brasil
              </p>
            </div>
          </div>

          {/* CANTO SUPERIOR DIREITO: LOGO ESCOTEIROS SC (se selecionada) */}
          <div className="flex flex-col items-center justify-center min-w-[64px]">
            {certificate.scLogoPath ? (
              <img
                src={certificate.scLogoPath}
                alt="Logo Escoteiros SC"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="h-16 w-auto object-contain"
              />
            ) : null}
          </div>
        </div>

        {/* TÍTULO PRINCIPAL DO CERTIFICADO */}
        <div className="text-center my-2">
          <h1
            className="text-3xl font-extrabold text-[#0F2C59] tracking-wider uppercase drop-shadow-sm leading-tight"
            style={{ fontFamily: "'Cinzel Decorative', 'Playfair Display', serif" }}
          >
            {getTitle()}
          </h1>
          <div className="w-48 h-1 bg-amber-400 mx-auto mt-2 rounded-full" />
        </div>

        {/* NOME DO HOMENAGEADO / RECEPTOR */}
        <div className="text-center my-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
            Conferido a:
          </p>
          <h2
            className="text-4xl font-bold text-amber-900 border-b-2 border-amber-300 inline-block px-8 py-1 my-1"
            style={{ fontFamily: "'Playfair Display', 'Great Vibes', serif" }}
          >
            {certificate.recipientName || 'Nome do Escoteiro'}
          </h2>
          {certificate.recipientRegistration && (
            <p className="text-xs font-semibold text-[#0F2C59] mt-1">
              Registro UEB nº: <span className="font-bold text-slate-900">{certificate.recipientRegistration}</span>
            </p>
          )}
        </div>

        {/* CORPO DO TEXTO */}
        <div className="px-8 text-center">
          <p className="text-base text-slate-700 leading-relaxed font-medium max-w-4xl mx-auto">
            {renderBodyText()}
          </p>
          <p className="text-sm font-semibold text-[#0F2C59] mt-3">
            {certificate.location || 'Blumenau - SC'}, {certificate.eventDate || `${certificate.dia || '25'} de ${certificate.mes || 'Agosto'} de ${certificate.ano || '2026'}`}.
          </p>
        </div>

        {/* ESTRUTURA VISUAL DE EMBLEMA ESCOTEIRO DEPENDENDO DO MODELO */}
        {certificate.category === 'Promessas' && (
          <div className="flex justify-center -my-2">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white text-xl shadow-md border-2 border-white">
              🐺
            </div>
          </div>
        )}

        {certificate.category === 'Atividade' && (
          <div className="flex justify-center gap-2 -my-2">
            {[...Array(Math.min(parseInt(certificate.quantidadeAnos || '1') || 1, 6))].map((_, i) => (
              <span key={i} className="text-amber-500 text-xl">⭐</span>
            ))}
          </div>
        )}

        {/* RODAPÉ: ASSINATURAS E QR CODE DE AUTENTICIDADE */}
        <div className="pt-3 border-t border-slate-200 flex items-end justify-between">
          
          {/* QR CODE E CÓDIGO DE AUTENTICAÇÃO */}
          <div className="flex items-center gap-3 bg-slate-100/90 p-2 px-3 rounded-lg border border-slate-200">
            <QRCodeSVG value={verificationUrl} size={58} level="M" fgColor="#0F2C59" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-[#0F2C59] uppercase tracking-wider">
                Verificação de Autenticidade
              </p>
              <p className="text-[11px] font-mono font-bold text-slate-800 tracking-wider my-0.5">
                {certificate.hash}
              </p>
              <p className="text-[9px] text-slate-500">
                GELB 32/SC &bull; Certificado Oficial Validado
              </p>
            </div>
          </div>

          {/* ASSINATURAS OFICIAIS */}
          <div className="flex items-center gap-10">
            {certificate.signatories && certificate.signatories.filter(s => s.enabled).map((sig) => (
              <div key={sig.id} className="text-center w-44">
                <div className="h-10 flex items-center justify-center mb-1">
                  {sig.signatureImage ? (
                    <img src={sig.signatureImage} alt={`Assinatura ${sig.name}`} className="h-10 max-w-full object-contain" />
                  ) : (
                    <div
                      className="text-2xl text-[#0F2C59] font-serif italic"
                      style={{ fontFamily: "'Great Vibes', cursive" }}
                    >
                      {sig.name}
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-700 pt-1">
                  <p className="text-xs font-bold text-[#0F2C59] uppercase">{sig.name}</p>
                  <p className="text-[10px] text-slate-600 font-medium">{sig.role}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

