import React, { useState, useEffect } from 'react';
import { Download, Printer, Save, Image, Plus, Trash2, Upload, ChevronDown, Sparkles, FileText, CheckCircle2, Layers, Eye, X, SlidersHorizontal, Award } from 'lucide-react';
import { CertificateData, ScoutCategory, Signatory, CertificateTemplate } from '../types/certificate';
import { SCOUT_CATEGORIES, CATEGORY_MODELS_MAP, ALL_MODELS } from '../data/scoutCategoriesData';
import { generateCertificateHash } from '../utils/qrUtils';
import { getTemplateForCategoryAndModel, initDefaultTemplates, deleteTemplate } from '../utils/customTemplatesStorage';
import confetti from 'canvas-confetti';

interface CertificateFormProps {
  certificate: CertificateData;
  setCertificate: React.Dispatch<React.SetStateAction<CertificateData>>;
  onSaveToHistory: (cert: CertificateData) => void;
  onDownloadPdf: () => void;
  onDownloadPng: () => void;
  onPrint: () => void;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({
  certificate,
  setCertificate,
  onSaveToHistory,
  onDownloadPdf,
  onDownloadPng,
  onPrint,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ScoutCategory>(certificate.category || 'Progressão');
  const [uelLogoFileName, setUelLogoFileName] = useState<string>('Nenhum arquivo escolhido');
  const [scLogoFileName, setScLogoFileName] = useState<string>('Nenhum arquivo escolhido');
  const [showSignatoriesModal, setShowSignatoriesModal] = useState<boolean>(false);
  const [matchedTemplate, setMatchedTemplate] = useState<CertificateTemplate | null>(null);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState<boolean>(false);
  const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState<boolean>(false);

  // Monitora e sincroniza modelos específicos do core para a categoria e modelo selecionados
  useEffect(() => {
    let isMounted = true;
    const checkTemplate = async () => {
      try {
        await initDefaultTemplates();
        const tpl = await getTemplateForCategoryAndModel(certificate.category, certificate.model);
        if (isMounted) {
          setMatchedTemplate(tpl);
          if (tpl) {
            // Se encontrou template e ainda não estava configurado, ativa automaticamente
            setCertificate((prev) => {
              if (prev.customTemplateId === tpl.id && prev.useCustomTemplate) {
                return prev;
              }
              return {
                ...prev,
                customTemplateId: tpl.id,
                customTemplateName: tpl.name,
                customTemplateBackground: tpl.previewImageDataUrl,
                useCustomTemplate: prev.useCustomTemplate !== false,
              };
            });
          }
        }
      } catch (err) {
        console.warn('Erro ao verificar modelo específico no core:', err);
      }
    };

    checkTemplate();

    const handleTemplatesUpdated = () => {
      checkTemplate();
    };

    window.addEventListener('gelb_templates_updated', handleTemplatesUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('gelb_templates_updated', handleTemplatesUpdated);
    };
  }, [certificate.category, certificate.model]);

  const availableModels =
    selectedCategory === 'Todas'
      ? ALL_MODELS
      : CATEGORY_MODELS_MAP[selectedCategory] || [];

  const handleCategorySelect = (category: ScoutCategory) => {
    setSelectedCategory(category);
    const modelsForCategory = category === 'Todas' ? ALL_MODELS : CATEGORY_MODELS_MAP[category] || [];
    const firstModel = modelsForCategory[0] || 'Acolhida';

    setCertificate((prev) => {
      let inferredRamo = prev.ramo;
      if (firstModel === 'Especialidade Lobinho' || firstModel.includes('Lobinho')) inferredRamo = 'Lobinho';
      else if (firstModel === 'Especialidade Escoteiro' || firstModel.includes('Escoteiro')) inferredRamo = 'Escoteiro';
      else if (firstModel === 'Especialidade Sênior' || firstModel.includes('Sênior')) inferredRamo = 'Sênior';
      else if (firstModel === 'Especialidade Pioneiro' || firstModel.includes('Pioneiro')) inferredRamo = 'Pioneiro';

      const updated = {
        ...prev,
        category,
        model: firstModel,
        eventName: `${category} - ${firstModel}`,
        ramo: inferredRamo,
      };
      updated.hash = generateCertificateHash(
        updated.recipientName,
        updated.recipientRegistration,
        updated.eventName,
        updated.eventDate
      );
      return updated;
    });
  };

  const handleModelSelect = (modelName: string) => {
    setCertificate((prev) => {
      let inferredRamo = prev.ramo;
      if (modelName === 'Especialidade Lobinho' || modelName.includes('Lobinho')) inferredRamo = 'Lobinho';
      else if (modelName === 'Especialidade Escoteiro' || modelName.includes('Escoteiro')) inferredRamo = 'Escoteiro';
      else if (modelName === 'Especialidade Sênior' || modelName.includes('Sênior')) inferredRamo = 'Sênior';
      else if (modelName === 'Especialidade Pioneiro' || modelName.includes('Pioneiro')) inferredRamo = 'Pioneiro';

      const updated = {
        ...prev,
        model: modelName,
        eventName: `${prev.category} - ${modelName}`,
        ramo: inferredRamo,
      };
      updated.hash = generateCertificateHash(
        updated.recipientName,
        updated.recipientRegistration,
        updated.eventName,
        updated.eventDate
      );
      return updated;
    });
  };

  const handleInputChange = (field: keyof CertificateData, value: any) => {
    setCertificate((prev) => {
      const updated = { ...prev, [field]: value };

      // Se atualizar componentes da data (dia, mes, ano), recria eventDate
      if (field === 'dia' || field === 'mes' || field === 'ano') {
        const d = field === 'dia' ? value : prev.dia || '25';
        const m = field === 'mes' ? value : prev.mes || 'Agosto';
        const a = field === 'ano' ? value : prev.ano || '2026';
        updated.eventDate = `${d} de ${m} de ${a}`;
      }

      if (
        field === 'recipientName' ||
        field === 'recipientRegistration' ||
        field === 'eventName' ||
        field === 'eventDate' ||
        field === 'dia' ||
        field === 'mes' ||
        field === 'ano'
      ) {
        updated.hash = generateCertificateHash(
          updated.recipientName,
          updated.recipientRegistration,
          updated.eventName,
          updated.eventDate
        );
      }
      return updated;
    });
  };

  const handleUelLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUelLogoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleInputChange('uelLogoPath', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScLogoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleInputChange('scLogoPath', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatoryChange = (id: string, key: keyof Signatory, value: any) => {
    setCertificate((prev) => ({
      ...prev,
      signatories: prev.signatories.map((sig) =>
        sig.id === id ? { ...sig, [key]: value } : sig
      ),
    }));
  };

  const addSignatory = () => {
    const newSig: Signatory = {
      id: Date.now().toString(),
      name: 'Chefe de Seção / Diretor',
      role: 'Grupo Escoteiro GELB 32/SC',
      enabled: true,
    };
    setCertificate((prev) => ({
      ...prev,
      signatories: [...prev.signatories, newSig],
    }));
  };

  const removeSignatory = (id: string) => {
    setCertificate((prev) => ({
      ...prev,
      signatories: prev.signatories.filter((s) => s.id !== id),
    }));
  };

  const handleSave = () => {
    onSaveToHistory(certificate);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0F2C59', '#FBBF24', '#22C55E', '#3B82F6'],
    });
  };

  return (
    <div className="bg-[#242220] text-stone-100 rounded-2xl border border-stone-700/80 p-5 sm:p-7 shadow-2xl flex flex-col gap-5">
      
      {/* TÍTULO DO GERADOR */}
      <div className="flex items-center gap-2 border-b border-stone-700/60 pb-3">
        <span className="text-2xl text-amber-400">⚜️</span>
        <h2 className="text-xl sm:text-2xl font-bold text-blue-500 font-sans tracking-tight">
          Gerador de Certificados
        </h2>
      </div>

      {/* SELEÇÃO DE CATEGORIA E MODELO */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider">
          Selecione a categoria e o modelo:
        </label>

        {/* CÁPSULAS DE CATEGORIA (PILLS) */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {SCOUT_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400 shadow-md'
                    : 'bg-[#383432] text-stone-300 hover:bg-[#48423f] border border-stone-600/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* GRADE DE MODELOS DA CATEGORIA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {availableModels.map((modelName) => {
            const isSelected = certificate.model === modelName;
            return (
              <button
                key={modelName}
                type="button"
                onClick={() => handleModelSelect(modelName)}
                className={`p-3 text-xs sm:text-sm font-semibold rounded-lg text-center transition-all ${
                  isSelected
                    ? 'bg-[#383432] text-white border-2 border-blue-500 shadow-md font-bold'
                    : 'bg-[#302d2b] text-stone-300 border border-stone-600/80 hover:bg-[#3a3633]'
                }`}
              >
                {modelName}
              </button>
            );
          })}
        </div>

        {/* BANNER INFORMATIVO SE HOUVER MODELO ESPECÍFICO EM PDF NO CORE */}
        {matchedTemplate && (
          <div className="bg-gradient-to-r from-blue-950/80 to-[#122849] border-2 border-amber-400/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg mt-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-400 text-[#0F2C59] rounded-lg shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Modelo em PDF do Core Vinculado
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.2 rounded-full">
                    {matchedTemplate.isDefault ? 'Padrão Ativo' : 'Disponível'}
                  </span>
                </div>
                <p className="text-xs font-bold text-white mt-0.5">
                  {matchedTemplate.name}
                </p>
                <p className="text-[11px] text-slate-300">
                  Arquivo: {matchedTemplate.fileName} ({(matchedTemplate.fileSize / 1024).toFixed(0)} KB)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60">
              <button
                type="button"
                onClick={() => setShowPdfPreviewModal(true)}
                className="px-2.5 py-1.5 bg-blue-900/60 hover:bg-blue-800 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-blue-400/30"
                title="Visualizar modelo em PDF"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCertificate((prev) => ({
                    ...prev,
                    useCustomTemplate: !prev.useCustomTemplate,
                  }));
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  certificate.useCustomTemplate !== false
                    ? 'bg-amber-400 text-[#0F2C59] border-amber-500 font-bold hover:bg-amber-300'
                    : 'bg-stone-800 text-stone-300 border-stone-600 hover:bg-stone-700'
                }`}
                title="Ativar ou desativar o uso deste modelo PDF"
              >
                {certificate.useCustomTemplate !== false ? '✓ Modelo Ativo' : 'Modelo Desativado'}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteTemplateModal(true)}
                className="px-2.5 py-1.5 bg-red-950/70 hover:bg-red-900 text-red-300 hover:text-red-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-red-700/50"
                title="Excluir este modelo do sistema para não utilizar mais"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Excluir Modelo</span>
              </button>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMAÇÃO PARA EXCLUIR MODELO PDF DIRETAMENTE DO FORMULÁRIO */}
        {showDeleteTemplateModal && matchedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-[#24211e] text-stone-100 w-full max-w-md rounded-2xl shadow-2xl border border-stone-700 overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-900/50 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-700/40">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  Excluir Modelo "{matchedTemplate.name}"?
                </h3>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                  Deseja realmente remover este certificado do sistema? Se removido, o app não irá mais sugerir ou utilizar este arquivo como modelo de fundo.
                </p>
              </div>

              <div className="bg-[#1b1917] px-6 py-3.5 border-t border-stone-700/80 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteTemplateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await deleteTemplate(matchedTemplate.id);
                      setMatchedTemplate(null);
                      setCertificate((prev) => ({
                        ...prev,
                        useCustomTemplate: false,
                        customTemplateId: undefined,
                        customTemplateName: undefined,
                        customTemplateBackground: undefined,
                        templateMode: 'hybrid-system',
                        fillMode: 'center-diploma',
                      }));
                      setShowDeleteTemplateModal(false);
                    } catch (err) {
                      console.error('Erro ao excluir modelo:', err);
                    }
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-md flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sim, Excluir Definitivamente</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAINEL DE AJUSTES E CALIBRAÇÃO ESPECIALISTA DE PREENCHIMENTO */}
        {matchedTemplate && certificate.useCustomTemplate !== false && (
          <div className="bg-[#1e1c1a] border border-amber-500/40 rounded-xl p-4 space-y-4 shadow-inner mt-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-700/60 pb-2.5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Calibração & Preenchimento de Campos no Certificado
                </span>
              </div>

              {/* BOTÃO DE AUTO-CALIBRAÇÃO INTELIGENTE PARA ACOLHIDA */}
              <button
                type="button"
                onClick={() => {
                  setCertificate((prev) => ({
                    ...prev,
                    fillMode: 'fields-on-lines',
                    templateMode: 'faithful-structure',
                    fieldRecipientY: 31.8,
                    fieldRecipientX: 43.0,
                    fieldRecipientFontSize: 22,
                    fieldResponsaveisY: 36.2,
                    fieldResponsaveisX: 46.5,
                    fieldResponsaveisFontSize: 17,
                    fieldProgressionStageY: 40.5,
                    fieldProgressionStageX: 44.0,
                    fieldProgressionStageFontSize: 17,
                    showProgressionStageOnTemplate: true,
                    progressionStage: prev.progressionStage || 'Acolhida dos Filhotes',
                    fieldGroupY: 44.8,
                    fieldGroupX: 41.5,
                    fieldGroupFontSize: 17,
                    fieldDateY: 54.8,
                    fieldCityX: 34.2,
                    fieldDayX: 44.8,
                    fieldMonthX: 55.5,
                    fieldYearX: 67.5,
                    fieldDateFontSize: 15,
                    fieldSignaturesY: 66.0,
                    fieldSigLeftX: 35.5,
                    fieldSigRightX: 62.5,
                    showResponsaveisOnTemplate: true,
                    showGroupOnTemplate: true,
                    showDateOnTemplate: true,
                    showSignaturesOnTemplate: true,
                    nameFontFamily: "'Montserrat', sans-serif",
                    nameColor: '#0F2C59',
                  }));
                  confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0F2C59] font-black rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-all self-start sm:self-auto"
                title="Calibra automaticamente as posições para o Certificado de Acolhida dos Filhotes"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Calibrar para Linhas de Acolhida</span>
              </button>
            </div>

            {/* SELEÇÃO DO MODO DE PREENCHIMENTO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  handleInputChange('fillMode', 'fields-on-lines');
                  handleInputChange('templateMode', 'faithful-structure');
                }}
                className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                  certificate.fillMode === 'fields-on-lines' || (!certificate.fillMode && certificate.category === 'Progressão')
                    ? 'bg-amber-500/15 border-amber-400 text-amber-200 font-bold'
                    : 'bg-[#292624] border-stone-700 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Modo Especialista (Preencher Linhas Pré-Impressas)</span>
                </div>
                <div className="text-[10px] text-stone-300 mt-1">
                  Ideal para Acolhida dos Filhotes: insere nome, pais, grupo e data sobre as linhas pontilhadas.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleInputChange('fillMode', 'center-diploma');
                  handleInputChange('templateMode', 'faithful-structure');
                }}
                className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                  certificate.fillMode === 'center-diploma'
                    ? 'bg-amber-500/15 border-amber-400 text-amber-200 font-bold'
                    : 'bg-[#292624] border-stone-700 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Modo Diploma Clássico (Nome Centralizado)</span>
                </div>
                <div className="text-[10px] text-stone-300 mt-1">
                  Exibe o nome grande e centralizado no meio do certificado.
                </div>
              </button>
            </div>

            {/* SEÇÃO 1: MODO ESPECIALISTA DE PREENCHIMENTO DE LINHAS */}
            {(certificate.fillMode === 'fields-on-lines' || (!certificate.fillMode && certificate.category === 'Progressão')) ? (
              <div className="space-y-3 pt-1">
                {/* LINHA 1: FILHOTE / HOMENAGEADO */}
                <div className="bg-[#2a2624] p-3 rounded-lg border border-stone-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      Linha 1: Nome do Filhote / Homenageado
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      Y: {certificate.fieldRecipientY ?? 31.8}% &bull; X: {certificate.fieldRecipientX ?? 43.0}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-stone-400 mb-0.5">Posição Vertical (Y):</label>
                      <input
                        type="range"
                        min="20"
                        max="60"
                        step="0.2"
                        value={certificate.fieldRecipientY ?? 31.8}
                        onChange={(e) => handleInputChange('fieldRecipientY', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 mb-0.5">Início Horizontal (X):</label>
                      <input
                        type="range"
                        min="25"
                        max="65"
                        step="0.5"
                        value={certificate.fieldRecipientX ?? 43.0}
                        onChange={(e) => handleInputChange('fieldRecipientX', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 mb-0.5">
                        Tamanho da Fonte: <strong className="text-amber-400">{certificate.fieldRecipientFontSize ?? 22}px</strong>
                      </label>
                      <input
                        type="range"
                        min="16"
                        max="32"
                        step="1"
                        value={certificate.fieldRecipientFontSize ?? 22}
                        onChange={(e) => handleInputChange('fieldRecipientFontSize', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* LINHA 2: RESPONSÁVEIS / PAIS */}
                <div className="bg-[#2a2624] p-3 rounded-lg border border-stone-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="chk-resp"
                        checked={certificate.showResponsaveisOnTemplate !== false}
                        onChange={(e) => handleInputChange('showResponsaveisOnTemplate', e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 bg-stone-800 border-stone-600"
                      />
                      <label htmlFor="chk-resp" className="text-xs font-bold text-stone-200 cursor-pointer">
                        Linha 2: Pais / Responsáveis Legais
                      </label>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400">
                      Y: {certificate.fieldResponsaveisY ?? 36.2}% &bull; X: {certificate.fieldResponsaveisX ?? 46.5}%
                    </span>
                  </div>

                  {certificate.showResponsaveisOnTemplate !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">Posição Vertical (Y):</label>
                        <input
                          type="range"
                          min="25"
                          max="60"
                          step="0.2"
                          value={certificate.fieldResponsaveisY ?? 36.2}
                          onChange={(e) => handleInputChange('fieldResponsaveisY', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">Início Horizontal (X):</label>
                        <input
                          type="range"
                          min="30"
                          max="65"
                          step="0.5"
                          value={certificate.fieldResponsaveisX ?? 46.5}
                          onChange={(e) => handleInputChange('fieldResponsaveisX', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">
                          Tamanho da Fonte: <strong className="text-amber-400">{certificate.fieldResponsaveisFontSize ?? 17}px</strong>
                        </label>
                        <input
                          type="range"
                          min="13"
                          max="26"
                          step="1"
                          value={certificate.fieldResponsaveisFontSize ?? 17}
                          onChange={(e) => handleInputChange('fieldResponsaveisFontSize', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* LINHA: PROGRESSÃO DE ETAPA DE (Entre Pais/Responsáveis e Grupo) */}
                <div className="bg-[#2a2624] p-3 rounded-lg border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="chk-prog-stage"
                        checked={certificate.showProgressionStageOnTemplate !== false}
                        onChange={(e) => handleInputChange('showProgressionStageOnTemplate', e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 bg-stone-800 border-stone-600"
                      />
                      <label htmlFor="chk-prog-stage" className="text-xs font-bold text-amber-200 cursor-pointer flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Progressão de etapa de:</span>
                      </label>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400">
                      Y: {certificate.fieldProgressionStageY ?? 40.5}% &bull; X: {certificate.fieldProgressionStageX ?? 44.0}%
                    </span>
                  </div>

                  {certificate.showProgressionStageOnTemplate !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">Posição Vertical (Y):</label>
                        <input
                          type="range"
                          min="30"
                          max="65"
                          step="0.2"
                          value={certificate.fieldProgressionStageY ?? 40.5}
                          onChange={(e) => handleInputChange('fieldProgressionStageY', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">Início Horizontal (X):</label>
                        <input
                          type="range"
                          min="25"
                          max="65"
                          step="0.5"
                          value={certificate.fieldProgressionStageX ?? 44.0}
                          onChange={(e) => handleInputChange('fieldProgressionStageX', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">
                          Tamanho da Fonte: <strong className="text-amber-400">{certificate.fieldProgressionStageFontSize ?? 17}px</strong>
                        </label>
                        <input
                          type="range"
                          min="13"
                          max="26"
                          step="1"
                          value={certificate.fieldProgressionStageFontSize ?? 17}
                          onChange={(e) => handleInputChange('fieldProgressionStageFontSize', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* LINHA 3: GRUPO ESCOTEIRO / NINHADA */}
                <div className="bg-[#2a2624] p-3 rounded-lg border border-stone-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="chk-grp"
                        checked={certificate.showGroupOnTemplate !== false}
                        onChange={(e) => handleInputChange('showGroupOnTemplate', e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 bg-stone-800 border-stone-600"
                      />
                      <label htmlFor="chk-grp" className="text-xs font-bold text-stone-200 cursor-pointer">
                        Linha 3: Grupo Escoteiro / Ninhada
                      </label>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400">
                      Y: {certificate.fieldGroupY ?? 44.8}% &bull; X: {certificate.fieldGroupX ?? 41.5}%
                    </span>
                  </div>

                  {certificate.showGroupOnTemplate !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">Posição Vertical (Y):</label>
                        <input
                          type="range"
                          min="35"
                          max="65"
                          step="0.2"
                          value={certificate.fieldGroupY ?? 44.8}
                          onChange={(e) => handleInputChange('fieldGroupY', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">Início Horizontal (X):</label>
                        <input
                          type="range"
                          min="25"
                          max="60"
                          step="0.5"
                          value={certificate.fieldGroupX ?? 41.5}
                          onChange={(e) => handleInputChange('fieldGroupX', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">
                          Tamanho da Fonte: <strong className="text-amber-400">{certificate.fieldGroupFontSize ?? 17}px</strong>
                        </label>
                        <input
                          type="range"
                          min="13"
                          max="26"
                          step="1"
                          value={certificate.fieldGroupFontSize ?? 17}
                          onChange={(e) => handleInputChange('fieldGroupFontSize', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* LINHA 4: DATA FRACIONADA (CIDADE, DIA, MÊS, ANO) */}
                <div className="bg-[#2a2624] p-3 rounded-lg border border-stone-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="chk-date-frac"
                        checked={certificate.showDateOnTemplate !== false}
                        onChange={(e) => handleInputChange('showDateOnTemplate', e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 bg-stone-800 border-stone-600"
                      />
                      <label htmlFor="chk-date-frac" className="text-xs font-bold text-stone-200 cursor-pointer">
                        Linha 4: Data Fracionada (Cidade, Dia, Mês, Ano)
                      </label>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400">
                      Y: {certificate.fieldDateY ?? 54.8}%
                    </span>
                  </div>

                  {certificate.showDateOnTemplate !== false && (
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-stone-400 mb-0.5">
                            Posição Vertical da Data (Y): <strong className="text-amber-400">{certificate.fieldDateY ?? 54.8}%</strong>
                          </label>
                          <input
                            type="range"
                            min="42"
                            max="75"
                            step="0.2"
                            value={certificate.fieldDateY ?? 54.8}
                            onChange={(e) => handleInputChange('fieldDateY', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-stone-400 mb-0.5">
                            Tamanho da Fonte da Data: <strong className="text-amber-400">{certificate.fieldDateFontSize ?? 15}px</strong>
                          </label>
                          <input
                            type="range"
                            min="11"
                            max="22"
                            step="1"
                            value={certificate.fieldDateFontSize ?? 15}
                            onChange={(e) => handleInputChange('fieldDateFontSize', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-stone-700/50">
                        <div>
                          <label className="block text-[9px] text-stone-400 mb-0.5">X Cidade ({certificate.fieldCityX ?? 34.2}%):</label>
                          <input
                            type="range"
                            min="22"
                            max="45"
                            step="0.5"
                            value={certificate.fieldCityX ?? 34.2}
                            onChange={(e) => handleInputChange('fieldCityX', parseFloat(e.target.value))}
                            className="w-full h-1 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-stone-400 mb-0.5">X Dia ({certificate.fieldDayX ?? 44.8}%):</label>
                          <input
                            type="range"
                            min="38"
                            max="52"
                            step="0.5"
                            value={certificate.fieldDayX ?? 44.8}
                            onChange={(e) => handleInputChange('fieldDayX', parseFloat(e.target.value))}
                            className="w-full h-1 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-stone-400 mb-0.5">X Mês ({certificate.fieldMonthX ?? 55.5}%):</label>
                          <input
                            type="range"
                            min="48"
                            max="65"
                            step="0.5"
                            value={certificate.fieldMonthX ?? 55.5}
                            onChange={(e) => handleInputChange('fieldMonthX', parseFloat(e.target.value))}
                            className="w-full h-1 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-stone-400 mb-0.5">X Ano ({certificate.fieldYearX ?? 67.5}%):</label>
                          <input
                            type="range"
                            min="60"
                            max="78"
                            step="0.5"
                            value={certificate.fieldYearX ?? 67.5}
                            onChange={(e) => handleInputChange('fieldYearX', parseFloat(e.target.value))}
                            className="w-full h-1 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* LINHA 5: ASSINATURAS SOBRE AS LINHAS INFERIORES */}
                <div className="bg-[#2a2624] p-3 rounded-lg border border-stone-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="chk-sigs-lines"
                        checked={certificate.showSignaturesOnTemplate !== false}
                        onChange={(e) => handleInputChange('showSignaturesOnTemplate', e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 bg-stone-800 border-stone-600"
                      />
                      <label htmlFor="chk-sigs-lines" className="text-xs font-bold text-stone-200 cursor-pointer">
                        Linha 5: Assinaturas Digitais sobre os Traços
                      </label>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400">
                      Y: {certificate.fieldSignaturesY ?? 66.0}%
                    </span>
                  </div>

                  {certificate.showSignaturesOnTemplate !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">
                          Posição Vertical (Y): <strong className="text-amber-400">{certificate.fieldSignaturesY ?? 66.0}%</strong>
                        </label>
                        <input
                          type="range"
                          min="50"
                          max="85"
                          step="0.5"
                          value={certificate.fieldSignaturesY ?? 66.0}
                          onChange={(e) => handleInputChange('fieldSignaturesY', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">
                          Linha Esquerda (X): <strong className="text-amber-400">{certificate.fieldSigLeftX ?? 35.5}%</strong>
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="48"
                          step="0.5"
                          value={certificate.fieldSigLeftX ?? 35.5}
                          onChange={(e) => handleInputChange('fieldSigLeftX', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-stone-400 mb-0.5">
                          Linha Direita (X): <strong className="text-amber-400">{certificate.fieldSigRightX ?? 62.5}%</strong>
                        </label>
                        <input
                          type="range"
                          min="52"
                          max="80"
                          step="0.5"
                          value={certificate.fieldSigRightX ?? 62.5}
                          onChange={(e) => handleInputChange('fieldSigRightX', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ESTILO GLOBAL: FONTE E COR DAS LINHAS */}
                <div className="bg-[#2a2624] p-3 rounded-lg border border-stone-700/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                      Família da Fonte de Preenchimento
                    </label>
                    <select
                      value={certificate.nameFontFamily || "'Montserrat', sans-serif"}
                      onChange={(e) => handleInputChange('nameFontFamily', e.target.value)}
                      className="w-full bg-[#1e1c1a] text-stone-200 border border-stone-600 rounded px-2 py-1 text-xs focus:ring-amber-500"
                    >
                      <option value="'Montserrat', sans-serif">Montserrat (Moderna e Legível)</option>
                      <option value="'Playfair Display', serif">Playfair Display (Serifada Elegante)</option>
                      <option value="'Great Vibes', cursive">Great Vibes (Manuscrita / Caligrafia)</option>
                      <option value="'Nunito', sans-serif">Nunito (Amigável e Arredondada)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                      Cor da Tinta do Preenchimento
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[
                        { color: '#0F2C59', title: 'Azul Marinho GELB' },
                        { color: '#1E293B', title: 'Grafite Escuro' },
                        { color: '#000000', title: 'Preto Clássico' },
                        { color: '#1D4ED8', title: 'Azul Caneta' },
                        { color: '#92400E', title: 'Dourado Escuro' },
                      ].map((item) => (
                        <button
                          key={item.color}
                          type="button"
                          onClick={() => handleInputChange('nameColor', item.color)}
                          style={{ backgroundColor: item.color }}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            (certificate.nameColor || '#0F2C59') === item.color
                              ? 'border-amber-400 scale-110 shadow-md'
                              : 'border-stone-600 hover:border-stone-400'
                          }`}
                          title={item.title}
                        />
                      ))}
                      <input
                        type="color"
                        value={certificate.nameColor || '#0F2C59'}
                        onChange={(e) => handleInputChange('nameColor', e.target.value)}
                        className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded"
                        title="Cor personalizada"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SEÇÃO 2: MODO DIPLOMA CLÁSSICO */
              <div className="space-y-3.5 pt-1">
                {/* 1. Nome do Homenageado */}
                <div className="bg-[#2a2624] p-3 rounded-lg border border-stone-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                      Posição Vertical do Nome
                    </label>
                    <span className="text-xs font-bold text-amber-400">
                      Altura: {certificate.namePosY ?? 52}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="20"
                      max="85"
                      step="0.5"
                      value={certificate.namePosY ?? 52}
                      onChange={(e) => handleInputChange('namePosY', parseFloat(e.target.value))}
                      className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleInputChange('namePosY', Math.max(20, (certificate.namePosY ?? 52) - 1))}
                        className="px-2 py-1 bg-stone-800 hover:bg-stone-700 rounded text-xs font-bold text-stone-300"
                        title="Subir nome 1%"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('namePosY', Math.min(85, (certificate.namePosY ?? 52) + 1))}
                        className="px-2 py-1 bg-stone-800 hover:bg-stone-700 rounded text-xs font-bold text-stone-300"
                        title="Descer nome 1%"
                      >
                        ▼
                      </button>
                    </div>
                  </div>

                  {/* Fonte, Tamanho e Cor */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        Tamanho da Fonte: <span className="text-amber-400 font-bold">{certificate.nameFontSize ?? 36}px</span>
                      </label>
                      <input
                        type="range"
                        min="22"
                        max="58"
                        step="1"
                        value={certificate.nameFontSize ?? 36}
                        onChange={(e) => handleInputChange('nameFontSize', parseInt(e.target.value))}
                        className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        Família da Fonte
                      </label>
                      <select
                        value={certificate.nameFontFamily || "'Playfair Display', serif"}
                        onChange={(e) => handleInputChange('nameFontFamily', e.target.value)}
                        className="w-full bg-[#1e1c1a] text-stone-200 border border-stone-600 rounded px-2 py-1 text-xs focus:ring-amber-500"
                      >
                        <option value="'Playfair Display', serif">Playfair Display (Serifada Elegante)</option>
                        <option value="'Great Vibes', cursive">Great Vibes (Caligráfica / Manuscrita)</option>
                        <option value="'Cinzel', serif">Cinzel (Clássica Romana)</option>
                        <option value="'Montserrat', sans-serif">Montserrat (Moderna / Sem serifa)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                        Cor do Nome
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[
                          { color: '#0F2C59', title: 'Azul GELB' },
                          { color: '#000000', title: 'Preto' },
                          { color: '#92400E', title: 'Dourado Escuro' },
                          { color: '#065F46', title: 'Verde' },
                        ].map((item) => (
                          <button
                            key={item.color}
                            type="button"
                            onClick={() => handleInputChange('nameColor', item.color)}
                            style={{ backgroundColor: item.color }}
                            className={`w-5 h-5 rounded-full border-2 transition-all ${
                              (certificate.nameColor || '#0F2C59') === item.color
                                ? 'border-amber-400 scale-110 shadow-md'
                                : 'border-stone-600 hover:border-stone-400'
                            }`}
                            title={item.title}
                          />
                        ))}
                        <input
                          type="color"
                          value={certificate.nameColor || '#0F2C59'}
                          onChange={(e) => handleInputChange('nameColor', e.target.value)}
                          className="w-6 h-6 bg-transparent border-0 cursor-pointer rounded"
                          title="Cor personalizada"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-stone-700/50">
                    <input
                      type="checkbox"
                      id="show-reg-tpl"
                      checked={certificate.showRegistrationOnTemplate !== false}
                      onChange={(e) => handleInputChange('showRegistrationOnTemplate', e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400 bg-stone-800 border-stone-600"
                    />
                    <label htmlFor="show-reg-tpl" className="text-xs text-stone-300 cursor-pointer">
                      Exibir Registro UEB abaixo do nome do homenageado
                    </label>
                  </div>
                </div>

                {/* 2. Controles de Data e Assinaturas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Data */}
                  <div className="bg-[#2a2624] p-3 rounded-lg border border-stone-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                        Exibir Data no Modelo
                      </label>
                      <input
                        type="checkbox"
                        checked={certificate.showDateOnTemplate !== false}
                        onChange={(e) => handleInputChange('showDateOnTemplate', e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 bg-stone-800 border-stone-600"
                      />
                    </div>
                    {certificate.showDateOnTemplate !== false && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-stone-400">
                          <span>Posição Vertical:</span>
                          <span className="text-amber-400 font-bold">{certificate.datePosY ?? 68}%</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="90"
                          step="0.5"
                          value={certificate.datePosY ?? 68}
                          onChange={(e) => handleInputChange('datePosY', parseFloat(e.target.value))}
                          className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Assinaturas Digitais */}
                  <div className="bg-[#2a2624] p-3 rounded-lg border border-stone-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                        Assinaturas Digitais
                      </label>
                      <input
                        type="checkbox"
                        checked={certificate.showSignaturesOnTemplate ?? false}
                        onChange={(e) => handleInputChange('showSignaturesOnTemplate', e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 bg-stone-800 border-stone-600"
                      />
                    </div>
                    {certificate.showSignaturesOnTemplate && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-stone-400">
                          <span>Posição Vertical:</span>
                          <span className="text-amber-400 font-bold">{certificate.signaturesPosY ?? 82}%</span>
                        </div>
                        <input
                          type="range"
                          min="55"
                          max="92"
                          step="0.5"
                          value={certificate.signaturesPosY ?? 82}
                          onChange={(e) => handleInputChange('signaturesPosY', parseFloat(e.target.value))}
                          className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE PREVIEW DO PDF DO MODELO VINCULADO */}
      {showPdfPreviewModal && matchedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-[#0F2C59] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold font-serif uppercase tracking-wide text-amber-300">
                    {matchedTemplate.name}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {matchedTemplate.category} &bull; {matchedTemplate.model} &bull; {matchedTemplate.fileName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPdfPreviewModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-100">
              <iframe
                src={matchedTemplate.pdfDataUrl}
                title={matchedTemplate.name}
                className="w-full h-[520px] border border-slate-300 rounded-xl bg-white shadow-inner"
              />
            </div>

            <div className="bg-white p-3 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowPdfPreviewModal(false)}
                className="bg-[#0F2C59] hover:bg-blue-900 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD DE LOGO DA UEL (OPCIONAL) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider">
          Adicionar logo da UEL (opcional):
        </label>
        <div className="bg-[#302d2b] border border-stone-600 rounded-lg p-2.5 flex items-center justify-between gap-3">
          <label className="cursor-pointer bg-stone-100 hover:bg-white text-stone-900 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5 text-stone-800" />
            <span>Escolher arquivo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUelLogoUpload}
              className="hidden"
            />
          </label>
          <span className="text-xs text-stone-400 truncate max-w-[200px] sm:max-w-[280px]">
            {uelLogoFileName}
          </span>
          {certificate.uelLogoPath && (
            <button
              type="button"
              onClick={() => {
                handleInputChange('uelLogoPath', undefined);
                setUelLogoFileName('Nenhum arquivo escolhido');
              }}
              className="text-xs text-red-400 hover:text-red-300 font-bold"
            >
              Remover
            </button>
          )}
        </div>
        {!certificate.uelLogoPath && (
          <p className="text-[11px] text-stone-400 font-medium">Nenhuma logo selecionada</p>
        )}
      </div>

      {/* UPLOAD DE LOGO DOS ESCOTEIROS SC (OPCIONAL) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider">
          Adicionar logo dos Escoteiros SC (opcional):
        </label>
        <div className="bg-[#302d2b] border border-stone-600 rounded-lg p-2.5 flex items-center justify-between gap-3">
          <label className="cursor-pointer bg-stone-100 hover:bg-white text-stone-900 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5 text-stone-800" />
            <span>Escolher arquivo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleScLogoUpload}
              className="hidden"
            />
          </label>
          <span className="text-xs text-stone-400 truncate max-w-[200px] sm:max-w-[280px]">
            {scLogoFileName}
          </span>
          {certificate.scLogoPath && (
            <button
              type="button"
              onClick={() => {
                handleInputChange('scLogoPath', undefined);
                setScLogoFileName('Nenhum arquivo escolhido');
              }}
              className="text-xs text-red-400 hover:text-red-300 font-bold"
            >
              Remover
            </button>
          )}
        </div>
        {!certificate.scLogoPath && (
          <p className="text-[11px] text-stone-400 font-medium">Nenhuma logo selecionada</p>
        )}
      </div>

      {/* FORMULÁRIO DINÂMICO DE ACORDO COM O MODELO / CATEGORIA SELECIONADA */}
      <div className="space-y-4 pt-1">
        
        {/* NOME DO JOVEM */}
        <div>
          <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
            Nome do jovem:
          </label>
          <input
            type="text"
            value={certificate.recipientName}
            onChange={(e) => handleInputChange('recipientName', e.target.value)}
            placeholder="Ex: Gabriel Schmidt Silva"
            className="w-full px-3.5 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* REGISTRO UEB */}
        <div>
          <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
            Registro UEB:
          </label>
          <input
            type="text"
            value={certificate.recipientRegistration || ''}
            onChange={(e) => handleInputChange('recipientRegistration', e.target.value)}
            placeholder="Ex: 329182-1"
            className="w-full px-3.5 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* RESPONSÁVEIS (Quando Acolhida / Progressão) */}
        {(certificate.category === 'Progressão' || certificate.model.includes('Acolhida')) && (
          <div>
            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
              Responsáveis:
            </label>
            <input
              type="text"
              value={certificate.responsaveis || ''}
              onChange={(e) => handleInputChange('responsaveis', e.target.value)}
              placeholder="Ex: Carlos Silva e Maria Schmidt"
              className="w-full px-3.5 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* PROGRESSÃO DE ETAPA DE (Entre Linha 2 Pais/Responsáveis e Linha 3 Grupo Escoteiro) */}
        {(certificate.category === 'Progressão' || certificate.model.includes('Acolhida') || certificate.progressionStage !== undefined) && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg space-y-1">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Progressão de etapa de:</span>
              </span>
              <span className="text-[10px] text-stone-400 font-normal normal-case">Exigido em certificados de progressão pessoal</span>
            </label>
            <input
              type="text"
              value={certificate.progressionStage ?? ''}
              onChange={(e) => handleInputChange('progressionStage', e.target.value)}
              placeholder="Ex: Acolhida dos Filhotes / Lobo Saltador / Pista / Rumo"
              className="w-full px-3.5 py-2 text-sm bg-[#302d2b] border border-amber-500/40 rounded-lg text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none"
            />
          </div>
        )}

        {/* NOME DO GRUPO ESCOTEIRO (Se aplicável) */}
        {(certificate.category === 'Progressão' || certificate.category === 'Promessas') && (
          <div>
            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
              Nome do Grupo Escoteiro:
            </label>
            <input
              type="text"
              value={certificate.groupName || 'Grupo Escoteiro Leões de Blumenau - GELB 32/SC'}
              onChange={(e) => handleInputChange('groupName', e.target.value)}
              placeholder="Grupo Escoteiro Leões de Blumenau - GELB 32/SC"
              className="w-full px-3.5 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* CAMPOS DE ESPECIALIDADES */}
        {certificate.category === 'Especialidades' && (
          <>
            <div>
              <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
                Nome da especialidade:
              </label>
              <input
                type="text"
                value={certificate.nomeEspecialidade || ''}
                onChange={(e) => handleInputChange('nomeEspecialidade', e.target.value)}
                placeholder="Ex: Radioamadorismo"
                className="w-full px-3.5 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
                  Nível conquistado:
                </label>
                <select
                  value={certificate.nivelConquistado || '1'}
                  onChange={(e) => handleInputChange('nivelConquistado', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="1">Nível 1</option>
                  <option value="2">Nível 2</option>
                  <option value="3">Nível 3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
                  Itens completados:
                </label>
                <input
                  type="text"
                  value={certificate.itensCompletados || ''}
                  onChange={(e) => handleInputChange('itensCompletados', e.target.value)}
                  placeholder="Ex: 1, 3, 5 e 8"
                  className="w-full px-3.5 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </>
        )}

        {/* RAMO (Interesse Especial) */}
        {certificate.category === 'Interesse Especial' && (
          <div>
            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
              Ramo:
            </label>
            <input
              type="text"
              value={certificate.ramo || ''}
              onChange={(e) => handleInputChange('ramo', e.target.value)}
              placeholder="Ex: Lobinho / Escoteiro"
              className="w-full px-3.5 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* MATILHA / PATRULHA (Monitoria) */}
        {certificate.category === 'Monitoria' && (
          <div>
            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
              Matilha / Patrulha:
            </label>
            <input
              type="text"
              value={certificate.matilhaPatrulha || ''}
              onChange={(e) => handleInputChange('matilhaPatrulha', e.target.value)}
              placeholder="Ex: Preta / Xavante"
              className="w-full px-3.5 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* QUANTIDADE DE ANOS (Atividade) */}
        {certificate.category === 'Atividade' && (
          <div>
            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
              Quantidade de anos:
            </label>
            <input
              type="text"
              value={certificate.quantidadeAnos || ''}
              onChange={(e) => handleInputChange('quantidadeAnos', e.target.value)}
              placeholder="Ex: 1, 2, 3..."
              className="w-full px-3.5 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* QUANTIDADE DE NOVOS MEMBROS (Expansão) */}
        {certificate.category === 'Expansão' && (
          <div>
            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
              Quantidade de novos membros (ou UELs):
            </label>
            <input
              type="text"
              value={certificate.quantidadeNovosMembros || ''}
              onChange={(e) => handleInputChange('quantidadeNovosMembros', e.target.value)}
              placeholder="Ex: 3 novos membros"
              className="w-full px-3.5 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* LOCAL (CIDADE) */}
        <div>
          <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
            Local (Cidade):
          </label>
          <input
            type="text"
            value={certificate.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Ex: Foz do Iguaçu / Blumenau - SC"
            className="w-full px-3.5 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* DATA EM TRÊS CAMPOS: DIA, MÊS, ANO */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
              Dia:
            </label>
            <input
              type="text"
              value={certificate.dia || '25'}
              onChange={(e) => handleInputChange('dia', e.target.value)}
              placeholder="25"
              className="w-full px-3 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
              Mês:
            </label>
            <input
              type="text"
              value={certificate.mes || 'Agosto'}
              onChange={(e) => handleInputChange('mes', e.target.value)}
              placeholder="Agosto"
              className="w-full px-3 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
              Ano:
            </label>
            <input
              type="text"
              value={certificate.ano || '2026'}
              onChange={(e) => handleInputChange('ano', e.target.value)}
              placeholder="2026"
              className="w-full px-3 py-2 text-sm bg-[#302d2b] border border-stone-600 rounded-lg text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* PAINEL DE ASSINATURAS EXPANSÍVEL */}
      <div className="bg-[#1e1c1a] p-3.5 rounded-xl border border-stone-700/80 mt-2">
        <button
          type="button"
          onClick={() => setShowSignatoriesModal(!showSignatoriesModal)}
          className="w-full flex items-center justify-between text-xs font-bold text-stone-300 uppercase tracking-wider"
        >
          <span>Assinaturas Oficiais GELB ({certificate.signatories.length})</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showSignatoriesModal ? 'rotate-180' : ''}`} />
        </button>

        {showSignatoriesModal && (
          <div className="space-y-2 mt-3 pt-2 border-t border-stone-700">
            {certificate.signatories.map((sig) => (
              <div key={sig.id} className="flex items-center gap-2 bg-[#2a2725] p-2 rounded-lg border border-stone-600">
                <input
                  type="checkbox"
                  checked={sig.enabled}
                  onChange={(e) => handleSignatoryChange(sig.id, 'enabled', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500"
                />
                <input
                  type="text"
                  value={sig.name}
                  onChange={(e) => handleSignatoryChange(sig.id, 'name', e.target.value)}
                  className="flex-1 px-2 py-1 text-xs bg-[#1e1c1a] border border-stone-600 rounded text-stone-200"
                  placeholder="Nome do Assinante"
                />
                <input
                  type="text"
                  value={sig.role}
                  onChange={(e) => handleSignatoryChange(sig.id, 'role', e.target.value)}
                  className="flex-1 px-2 py-1 text-xs bg-[#1e1c1a] border border-stone-600 rounded text-stone-200"
                  placeholder="Cargo"
                />
                {certificate.signatories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSignatory(sig.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSignatory}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 pt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Assinante
            </button>
          </div>
        )}
      </div>

      {/* BOTÕES DE AÇÃO E DOWLOAD */}
      <div className="pt-3 border-t border-stone-700/80 flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#383432] hover:bg-[#45403d] text-stone-200 font-bold text-xs rounded-lg transition-colors border border-stone-600"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>Salvar no Histórico</span>
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-stone-700 hover:bg-stone-600 text-white font-bold text-xs rounded-lg transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir</span>
        </button>

        <button
          type="button"
          onClick={onDownloadPng}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition-colors"
        >
          <Image className="w-4 h-4" />
          <span>Baixar PNG</span>
        </button>

        <button
          type="button"
          onClick={onDownloadPdf}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-lg shadow-lg transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Baixar PDF Oficial</span>
        </button>
      </div>

    </div>
  );
};

