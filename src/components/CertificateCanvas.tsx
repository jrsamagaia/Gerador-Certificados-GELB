import React from 'react';
import { CertificateData } from '../types/certificate';
import { GELB_TEXT_TEMPLATES } from '../config/gelbConfig';
import { GELB_LOGO_DATA_URL, FLOR_DE_LIS_DATA_URL, ESCOTEIROS_DO_BRASIL_LOGO_DATA_URL } from '../assets/gelbAssetsData';
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

  // Seleção de borda com base no estilo
  const getBorderClasses = () => {
    if (certificate.useCustomTemplate && certificate.customTemplateBackground) {
      return 'border border-slate-300 bg-white shadow-xl';
    }
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

  // SE ESTIVER USANDO MODELO ESPECÍFICO EM PDF NO MODO ESTRUTURA FIEL
  // Mantém 100% da arte, bordas, brasões, títulos e textos nativos do certificado enviado,
  // inserindo exatamente as informações preenchidas sobre as linhas correspondentes
  if (
    certificate.useCustomTemplate &&
    certificate.customTemplateBackground &&
    certificate.templateMode !== 'hybrid-system'
  ) {
    // Determina se este modelo possui campos pré-impressos com linhas
    const isLineFilling =
      certificate.fillMode === 'fields-on-lines' ||
      (!certificate.fillMode &&
        (certificate.model?.toLowerCase().includes('acolhida') ||
          certificate.eventName?.toLowerCase().includes('acolhida') ||
          certificate.category === 'Progressão' ||
          certificate.customTemplateName?.toLowerCase().includes('acolhida')));

    const recipientFont = certificate.fieldRecipientFontFamily || certificate.nameFontFamily || "'Playfair Display', serif";
    const recipientColor = certificate.fieldRecipientColor || certificate.nameColor || '#0F2C59';

    // Se for modo especialista com linhas pré-impressas
    if (isLineFilling) {
      // Coordenadas calculadas para as linhas do Certificado de Acolhida e modelos similares
      const recY = certificate.fieldRecipientY ?? 31.8;
      const recX = certificate.fieldRecipientX ?? 43.0;
      const recSize = certificate.fieldRecipientFontSize ?? 22;

      const respY = certificate.fieldResponsaveisY ?? 36.2;
      const respX = certificate.fieldResponsaveisX ?? 46.5;
      const respSize = certificate.fieldResponsaveisFontSize ?? 17;

      const groupY = certificate.fieldGroupY ?? 44.8;
      const groupX = certificate.fieldGroupX ?? 41.5;
      const groupSize = certificate.fieldGroupFontSize ?? 17;

      const dateY = certificate.fieldDateY ?? 54.8;
      const cityX = certificate.fieldCityX ?? 34.2;
      const dayX = certificate.fieldDayX ?? 44.8;
      const monthX = certificate.fieldMonthX ?? 55.5;
      const yearX = certificate.fieldYearX ?? 67.5;
      const dateFontSize = certificate.fieldDateFontSize ?? 15;

      const sigY = certificate.fieldSignaturesY ?? 66.0;
      const sigLeftX = certificate.fieldSigLeftX ?? 35.5;
      const sigRightX = certificate.fieldSigRightX ?? 62.5;

      // Valores para preenchimento
      const cidadeVal = certificate.location ? certificate.location.split('-')[0].trim() : 'Blumenau';
      const diaVal = certificate.dia || (certificate.eventDate ? certificate.eventDate.match(/\d{1,2}/)?.[0] : '25') || '25';
      const mesVal = certificate.mes || (certificate.eventDate ? certificate.eventDate.match(/(Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)/i)?.[0] : 'Agosto') || 'Agosto';
      const anoVal = certificate.ano || (certificate.eventDate ? certificate.eventDate.match(/\d{4}/)?.[0] : '2026') || '2026';

      const enabledSignatories = certificate.signatories?.filter((s) => s.enabled) || [];
      const leftSig = enabledSignatories[0];
      const rightSig = enabledSignatories[1] || enabledSignatories[0];

      return (
        <div
          id={containerId}
          className={`relative w-[1122px] h-[793px] mx-auto overflow-hidden bg-white shadow-2xl ${
            isPrintPreview ? 'scale-100' : ''
          }`}
          style={{
            boxSizing: 'border-box',
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          {/* Camada Base: Arte e Estrutura Exata do Certificado Enviado */}
          <img
            src={certificate.customTemplateBackground}
            alt={certificate.customTemplateName || 'Certificado Enviado'}
            className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0 select-none"
          />

          {/* CAMPO 1: LINHA DO FILHOTE / HOMENAGEADO (Linha 1) */}
          <div
            className="absolute z-10 pointer-events-none"
            style={{
              top: `${recY}%`,
              left: `${recX}%`,
              width: '32%',
              transform: 'translateY(-60%)',
            }}
          >
            <div
              className="truncate"
              style={{
                fontFamily: recipientFont,
                fontSize: `${recSize}px`,
                color: recipientColor,
                fontWeight: 700,
                lineHeight: 1.15,
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.95)',
              }}
            >
              {certificate.recipientName || 'Gabriel Schmidt Silva'}
              {certificate.showRegistrationOnTemplate !== false && certificate.recipientRegistration && (
                <span
                  className="ml-2 font-normal text-[0.7em] tracking-normal"
                  style={{ opacity: 0.85, fontFamily: "'Montserrat', sans-serif" }}
                >
                  (UEB {certificate.recipientRegistration})
                </span>
              )}
            </div>
          </div>

          {/* CAMPO 2: LINHA DOS RESPONSÁVEIS / PAIS (Linha 2) */}
          {certificate.showResponsaveisOnTemplate !== false && (
            <div
              className="absolute z-10 pointer-events-none"
              style={{
                top: `${respY}%`,
                left: `${respX}%`,
                width: '28%',
                transform: 'translateY(-60%)',
              }}
            >
              <div
                className="truncate"
                style={{
                  fontFamily: recipientFont,
                  fontSize: `${respSize}px`,
                  color: recipientColor,
                  fontWeight: 600,
                  lineHeight: 1.15,
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.95)',
                }}
              >
                {certificate.responsaveis || 'Pais e Responsáveis Legais'}
              </div>
            </div>
          )}

          {/* CAMPO 3: LINHA DA NINHADA / GRUPO ESCOTEIRO (Linha 3) */}
          {certificate.showGroupOnTemplate !== false && (
            <div
              className="absolute z-10 pointer-events-none"
              style={{
                top: `${groupY}%`,
                left: `${groupX}%`,
                width: '32.5%',
                transform: 'translateY(-60%)',
              }}
            >
              <div
                className="truncate"
                style={{
                  fontFamily: recipientFont,
                  fontSize: `${groupSize}px`,
                  color: recipientColor,
                  fontWeight: 600,
                  lineHeight: 1.15,
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.95)',
                }}
              >
                {certificate.groupName || 'Leões de Blumenau - GELB 32/SC'}
              </div>
            </div>
          )}

          {/* CAMPO 4: DATA FRACIONADA SOBRE OS TRAÇOS (Linha 4) */}
          {certificate.showDateOnTemplate !== false && (
            <>
              {/* Cidade */}
              <div
                className="absolute z-10 pointer-events-none text-center"
                style={{
                  top: `${dateY}%`,
                  left: `${cityX}%`,
                  width: '14%',
                  transform: 'translate(-50%, -60%)',
                  fontFamily: recipientFont,
                  fontSize: `${dateFontSize}px`,
                  color: recipientColor,
                  fontWeight: 600,
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.95)',
                }}
              >
                {cidadeVal}
              </div>

              {/* Dia */}
              <div
                className="absolute z-10 pointer-events-none text-center"
                style={{
                  top: `${dateY}%`,
                  left: `${dayX}%`,
                  width: '5%',
                  transform: 'translate(-50%, -60%)',
                  fontFamily: recipientFont,
                  fontSize: `${dateFontSize}px`,
                  color: recipientColor,
                  fontWeight: 600,
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.95)',
                }}
              >
                {diaVal}
              </div>

              {/* Mês */}
              <div
                className="absolute z-10 pointer-events-none text-center"
                style={{
                  top: `${dateY}%`,
                  left: `${monthX}%`,
                  width: '13%',
                  transform: 'translate(-50%, -60%)',
                  fontFamily: recipientFont,
                  fontSize: `${dateFontSize}px`,
                  color: recipientColor,
                  fontWeight: 600,
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.95)',
                }}
              >
                {mesVal}
              </div>

              {/* Ano */}
              <div
                className="absolute z-10 pointer-events-none text-center"
                style={{
                  top: `${dateY}%`,
                  left: `${yearX}%`,
                  width: '8%',
                  transform: 'translate(-50%, -60%)',
                  fontFamily: recipientFont,
                  fontSize: `${dateFontSize}px`,
                  color: recipientColor,
                  fontWeight: 600,
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.95)',
                }}
              >
                {anoVal}
              </div>
            </>
          )}

          {/* CAMPO 5: ASSINATURAS SOBRE AS LINHAS INFERIORES (Linha 5) */}
          {certificate.showSignaturesOnTemplate !== false && (
            <>
              {/* Assinatura Esquerda (Presidência / GELB) */}
              {leftSig && (
                <div
                  className="absolute z-10 pointer-events-none text-center"
                  style={{
                    top: `${sigY}%`,
                    left: `${sigLeftX}%`,
                    width: '24%',
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <div className="h-10 flex items-center justify-center mb-0.5">
                    {leftSig.signatureImage ? (
                      <img
                        src={leftSig.signatureImage}
                        alt={leftSig.name}
                        className="h-10 max-w-full object-contain"
                      />
                    ) : (
                      <div
                        className="text-lg text-[#0F2C59] italic"
                        style={{ fontFamily: "'Great Vibes', cursive" }}
                      >
                        {leftSig.name}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-[#0F2C59] uppercase tracking-wide truncate">
                    {leftSig.name}
                  </p>
                </div>
              )}

              {/* Assinatura Direita (Chefia / Seção) */}
              {rightSig && (
                <div
                  className="absolute z-10 pointer-events-none text-center"
                  style={{
                    top: `${sigY}%`,
                    left: `${sigRightX}%`,
                    width: '24%',
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <div className="h-10 flex items-center justify-center mb-0.5">
                    {rightSig.signatureImage ? (
                      <img
                        src={rightSig.signatureImage}
                        alt={rightSig.name}
                        className="h-10 max-w-full object-contain"
                      />
                    ) : (
                      <div
                        className="text-lg text-[#0F2C59] italic"
                        style={{ fontFamily: "'Great Vibes', cursive" }}
                      >
                        {rightSig.name}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-[#0F2C59] uppercase tracking-wide truncate">
                    {rightSig.name}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // MODO DIPLOMA CLÁSSICO (Centralizado)
    const nameY = certificate.namePosY ?? 52;
    const nameX = certificate.namePosX ?? 50;
    const nameSize = certificate.nameFontSize ?? 36;
    const nameColor = certificate.nameColor || '#0F2C59';
    const nameFont = certificate.nameFontFamily || "'Playfair Display', serif";

    const dateY = certificate.datePosY ?? 68;
    const dateSize = certificate.dateFontSize ?? 15;
    const dateColor = certificate.dateColor || '#0F2C59';

    const sigsY = certificate.signaturesPosY ?? 82;

    return (
      <div
        id={containerId}
        className={`relative w-[1122px] h-[793px] mx-auto overflow-hidden bg-white shadow-2xl ${
          isPrintPreview ? 'scale-100' : ''
        }`}
        style={{
          boxSizing: 'border-box',
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {/* Camada Base: Arte e Estrutura Exata do Certificado Enviado */}
        <img
          src={certificate.customTemplateBackground}
          alt={certificate.customTemplateName || 'Certificado Enviado'}
          className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0 select-none"
        />

        {/* 1. NOME DO HOMENAGEADO / FILHOTE */}
        <div
          className="absolute z-10 text-center pointer-events-none transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[850px] px-4"
          style={{
            top: `${nameY}%`,
            left: `${nameX}%`,
          }}
        >
          <div
            style={{
              fontFamily: nameFont,
              fontSize: `${nameSize}px`,
              color: nameColor,
              fontWeight: 700,
              lineHeight: 1.15,
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.9)',
            }}
          >
            {certificate.recipientName || 'Nome do Escoteiro'}
          </div>

          {certificate.showRegistrationOnTemplate !== false && certificate.recipientRegistration && (
            <div
              className="text-xs font-semibold mt-1 tracking-wider"
              style={{
                color: nameColor,
                textShadow: '0 1px 1px rgba(255, 255, 255, 0.9)',
              }}
            >
              Registro UEB nº {certificate.recipientRegistration}
            </div>
          )}
        </div>

        {/* 2. DATA E LOCALIDADE */}
        {certificate.showDateOnTemplate !== false && (
          <div
            className="absolute z-10 text-center pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{
              top: `${dateY}%`,
              left: '50%',
              fontFamily: "'Montserrat', sans-serif",
              fontSize: `${dateSize}px`,
              color: dateColor,
              fontWeight: 600,
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.9)',
            }}
          >
            {certificate.location || 'Blumenau - SC'},{' '}
            {certificate.eventDate ||
              `${certificate.dia || '25'} de ${certificate.mes || 'Agosto'} de ${certificate.ano || '2026'}`}
            .
          </div>
        )}

        {/* 3. ASSINATURAS DIGITAIS SOBREPOSTAS (OPCIONAIS) */}
        {certificate.showSignaturesOnTemplate && (
          <div
            className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 w-full flex justify-center"
            style={{
              top: `${sigsY}%`,
              left: '50%',
            }}
          >
            <div className="flex items-center justify-center gap-16">
              {certificate.signatories &&
                certificate.signatories
                  .filter((s) => s.enabled)
                  .map((sig) => (
                    <div key={sig.id} className="text-center w-48">
                      <div className="h-10 flex items-center justify-center mb-0.5">
                        {sig.signatureImage && sig.signatureImage.trim() !== '' ? (
                          <img
                            src={sig.signatureImage}
                            alt={sig.name}
                            className="h-10 max-w-full object-contain"
                          />
                        ) : (
                          <div
                            className="text-xl text-[#0F2C59] font-serif italic"
                            style={{ fontFamily: "'Great Vibes', cursive" }}
                          >
                            {sig.name}
                          </div>
                        )}
                      </div>
                      <div className="border-t border-slate-700/60 pt-0.5">
                        <p className="text-[11px] font-bold text-[#0F2C59] uppercase">{sig.name}</p>
                        <p className="text-[9px] text-slate-600 font-medium">{sig.role}</p>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        )}
      </div>
    );
  }

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
      {/* Fundo do Modelo Específico em PDF (se ativo) */}
      {certificate.useCustomTemplate && certificate.customTemplateBackground && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={certificate.customTemplateBackground}
            alt="Modelo Específico do Certificado em PDF"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Cantoneiras Escoteiras Decorativas de Canto (ocultas quando usa modelo específico PDF com moldura própria) */}
      {!(certificate.useCustomTemplate && certificate.customTemplateBackground) && (
        <>
          <div className="absolute top-5 left-5 w-12 h-12 border-t-2 border-l-2 border-[#FBBF24] z-10 pointer-events-none" />
          <div className="absolute top-5 right-5 w-12 h-12 border-t-2 border-r-2 border-[#FBBF24] z-10 pointer-events-none" />
          <div className="absolute bottom-5 left-5 w-12 h-12 border-b-2 border-l-2 border-[#FBBF24] z-10 pointer-events-none" />
          <div className="absolute bottom-5 right-5 w-12 h-12 border-b-2 border-r-2 border-[#FBBF24] z-10 pointer-events-none" />
        </>
      )}

      {/* Marca d'água de Flor de Lis no fundo */}
      {certificate.showWatermark && !(certificate.useCustomTemplate && certificate.customTemplateBackground) && (
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
            {(() => {
              const uelLogo = certificate.uelLogoPath?.trim() || getOfficialLogo();
              return uelLogo && uelLogo.trim() !== '' ? (
                <img
                  src={uelLogo}
                  alt="Logo Grupo Escoteiro Leões de Blumenau - GELB 32/SC"
                  {...(!uelLogo.startsWith('data:') ? { crossOrigin: 'anonymous' } : {})}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 object-contain drop-shadow-md"
                />
              ) : null;
            })()}
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
            {certificate.scLogoPath && certificate.scLogoPath.trim() !== '' ? (
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
            className="text-3xl font-extrabold text-[#0F2C59] tracking-wider uppercase leading-tight"
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

        {/* RODAPÉ: ASSINATURAS CENTRALIZADAS */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-center">
          <div className="flex items-center justify-center gap-12 sm:gap-16">
            {certificate.signatories && certificate.signatories.filter(s => s.enabled).map((sig) => (
              <div key={sig.id} className="text-center w-48 sm:w-52">
                <div className="h-11 flex items-center justify-center mb-1">
                  {sig.signatureImage && sig.signatureImage.trim() !== '' ? (
                    <img src={sig.signatureImage} alt={`Assinatura ${sig.name}`} className="h-11 max-w-full object-contain" />
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

