import React, { useState } from 'react';
import { Download, Printer, Save, Image, Plus, Trash2, Upload, ChevronDown, Sparkles } from 'lucide-react';
import { CertificateData, ScoutCategory, Signatory } from '../types/certificate';
import { SCOUT_CATEGORIES, CATEGORY_MODELS_MAP, ALL_MODELS } from '../data/scoutCategoriesData';
import { generateCertificateHash } from '../utils/qrUtils';
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

  const availableModels =
    selectedCategory === 'Todas'
      ? ALL_MODELS
      : CATEGORY_MODELS_MAP[selectedCategory] || [];

  const handleCategorySelect = (category: ScoutCategory) => {
    setSelectedCategory(category);
    const modelsForCategory = category === 'Todas' ? ALL_MODELS : CATEGORY_MODELS_MAP[category] || [];
    const firstModel = modelsForCategory[0] || 'Acolhida';

    setCertificate((prev) => {
      const updated = {
        ...prev,
        category,
        model: firstModel,
        eventName: `${category} - ${firstModel}`,
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
      const updated = {
        ...prev,
        model: modelName,
        eventName: `${prev.category} - ${modelName}`,
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
      </div>

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

