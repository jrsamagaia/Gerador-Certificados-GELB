import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  Trash2,
  Eye,
  Download,
  Star,
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  AlertCircle,
  ExternalLink,
  X,
  Check,
} from 'lucide-react';
import { CertificateTemplate, ScoutCategory } from '../types/certificate';
import { SCOUT_CATEGORIES, CATEGORY_MODELS_MAP } from '../data/scoutCategoriesData';
import {
  getAllTemplates,
  saveTemplate,
  deleteTemplate,
  setDefaultTemplate,
  initDefaultTemplates,
} from '../utils/customTemplatesStorage';
import { convertPdfToImageDataUrl } from '../utils/pdfRenderer';

interface CertificateTemplatesManagerProps {
  onSelectTemplateForIssuer?: (template: CertificateTemplate) => void;
}

export const CertificateTemplatesManager: React.FC<CertificateTemplatesManagerProps> = ({
  onSelectTemplateForIssuer,
}) => {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<ScoutCategory>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<CertificateTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string } | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Formulário de Upload de Modelo
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>('');
  const [category, setCategory] = useState<ScoutCategory>('Progressão');
  const [model, setModel] = useState<string>('Progressão Filhotes');
  const [isCustomModel, setIsCustomModel] = useState<boolean>(false);
  const [customModelName, setCustomModelName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileBase64, setSelectedFileBase64] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      await initDefaultTemplates();
      const loaded = await getAllTemplates();
      setTemplates(loaded);
    } catch (err) {
      console.error('Erro ao carregar modelos de certificados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();

    const handleUpdated = () => {
      getAllTemplates().then(setTemplates);
    };

    window.addEventListener('gelb_templates_updated', handleUpdated);
    return () => window.removeEventListener('gelb_templates_updated', handleUpdated);
  }, []);

  // Atualiza modelo padrão quando a categoria muda no formulário
  useEffect(() => {
    if (category !== 'Todas') {
      const models = CATEGORY_MODELS_MAP[category] || [];
      if (models.length > 0) {
        setModel(models[0]);
      }
    }
  }, [category]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/') || file.name.match(/\.(png|jpe?g|webp)$/i);

    if (!isPdf && !isImage) {
      setFileError('Por favor selecione um arquivo no formato PDF (.pdf) ou Imagem (.png, .jpg).');
      setSelectedFile(null);
      setSelectedFileBase64('');
      return;
    }

    setFileError(null);
    setSelectedFile(file);

    // Sugere nome baseado no arquivo caso esteja vazio
    if (!templateName.trim()) {
      const cleanName = file.name
        .replace(/\.(pdf|png|jpe?g|webp)$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTemplateName(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedFileBase64(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedFileBase64) {
      setFileError('É necessário selecionar um arquivo PDF ou imagem do certificado.');
      return;
    }

    if (!templateName.trim()) {
      showNotification('Preencha o nome do modelo de certificado.', 'error');
      return;
    }

    const finalModel = isCustomModel ? customModelName.trim() : model;
    if (!finalModel) {
      showNotification('Selecione ou informe o modelo vinculado.', 'error');
      return;
    }

    setIsUploading(true);

    try {
      // Gera preview da página 1 do PDF ou utiliza a imagem enviada
      let previewImageDataUrl: string | undefined;
      try {
        previewImageDataUrl = await convertPdfToImageDataUrl(selectedFileBase64);
      } catch (err) {
        console.warn('Não foi possível gerar preview de imagem da página do PDF:', err);
      }

      const newTemplate: CertificateTemplate = {
        id: `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: templateName.trim(),
        category,
        model: finalModel,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        pdfDataUrl: selectedFileBase64,
        previewImageDataUrl: previewImageDataUrl || selectedFileBase64,
        description: description.trim() || undefined,
        orientation: 'landscape',
        isDefault: true,
        defaultNamePosY: 52,
        defaultNamePosX: 50,
        defaultNameFontSize: 36,
        defaultNameFontFamily: "'Playfair Display', serif",
        defaultNameColor: '#0F2C59',
        defaultDatePosY: 68,
        defaultSignaturesPosY: 82,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveTemplate(newTemplate);
      await loadAll();

      showNotification(`Modelo "${newTemplate.name}" armazenado com sucesso no core do sistema!`);

      // Limpa formulário
      setTemplateName('');
      setSelectedFile(null);
      setSelectedFileBase64('');
      setDescription('');
      setIsCustomModel(false);
      setCustomModelName('');
      setShowUploadForm(false);
    } catch (err) {
      console.error('Erro ao salvar modelo PDF:', err);
      showNotification('Erro ao armazenar o modelo PDF. Tente novamente.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setTemplateToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      await deleteTemplate(templateToDelete.id);
      await loadAll();
      showNotification(`Modelo "${templateToDelete.name}" removido com sucesso do core do sistema.`);
    } catch (err) {
      console.error('Erro ao excluir modelo:', err);
      showNotification('Erro ao remover o modelo. Tente novamente.', 'error');
    } finally {
      setTemplateToDelete(null);
    }
  };

  const handleSetDefault = async (id: string, name: string) => {
    await setDefaultTemplate(id);
    showNotification(`Modelo "${name}" definido como padrão para esta categoria e modelo.`);
  };

  const handleDownloadOriginalPdf = (t: CertificateTemplate) => {
    const link = document.createElement('a');
    link.href = t.pdfDataUrl;
    link.download = t.fileName || `${t.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtragem dos modelos
  const filteredTemplates = templates.filter((t) => {
    const matchesCat = filterCategory === 'Todas' || t.category === filterCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const availableModelsForCategory = category !== 'Todas' ? CATEGORY_MODELS_MAP[category] || [] : [];

  return (
    <div className="flex flex-col gap-6">
      {/* NOTIFICAÇÃO TOAST */}
      {notification && (
        <div
          className={`fixed top-24 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 text-white font-bold text-sm animate-bounce ${
            notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-200" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* CABEÇALHO DO GERENCIADOR DE MODELOS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-[#0F2C59]" />
            <h2 className="text-lg font-bold text-[#0F2C59] font-serif uppercase tracking-wide">
              Modelos Específicos de Certificados (PDF)
            </h2>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
              Core GELB
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Faça upload e gerencie os modelos oficiais de certificados em PDF. Ao cadastrar um modelo, ele fica
            armazenado no core do sistema e disponível automaticamente na emissão individual e em lote.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadForm(!showUploadForm)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shrink-0 ${
            showUploadForm
              ? 'bg-slate-700 text-white hover:bg-slate-800'
              : 'bg-[#0F2C59] text-white hover:bg-blue-900 ring-2 ring-amber-400'
          }`}
        >
          {showUploadForm ? (
            <>
              <X className="w-4 h-4" />
              <span>Fechar Formulário</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Fazer Upload de Modelo PDF</span>
            </>
          )}
        </button>
      </div>

      {/* FORMULÁRIO EXPANSÍVEL DE UPLOAD */}
      {showUploadForm && (
        <form
          onSubmit={handleSaveUpload}
          className="bg-gradient-to-br from-slate-900 to-[#122849] text-white p-6 rounded-2xl border-2 border-amber-400 shadow-2xl flex flex-col gap-5 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white font-serif">
                Cadastrar Novo Modelo Específico no Core
              </h3>
            </div>
            <span className="text-xs text-slate-400">Armazenamento Local e Permanente</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* NOME DO MODELO */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                Nome do Modelo de Certificado: *
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ex: Certificado de Acolhida dos Filhotes"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* SELEÇÃO DE CATEGORIA */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                Categoria Escoteira Vinculada: *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ScoutCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              >
                {SCOUT_CATEGORIES.filter((c) => c !== 'Todas').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* SELEÇÃO OU CRIAÇÃO DE MODELO */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Modelo Específico Vinculado: *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomModel(!isCustomModel)}
                  className="text-xs text-amber-300 hover:text-amber-200 underline font-semibold"
                >
                  {isCustomModel ? 'Escolher da lista existente' : '+ Digitar novo modelo personalizado'}
                </button>
              </div>

              {isCustomModel ? (
                <input
                  type="text"
                  value={customModelName}
                  onChange={(e) => setCustomModelName(e.target.value)}
                  placeholder="Ex: Acolhida dos Filhotes / Ramo Filhotes"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              ) : (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                >
                  {availableModelsForCategory.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                  <option value="Acolhida">Acolhida</option>
                  <option value="Progressão Filhotes">Progressão Filhotes</option>
                </select>
              )}
            </div>

            {/* UPLOAD DO ARQUIVO PDF */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                Arquivo do Certificado em PDF: *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-600 hover:border-amber-400 bg-slate-800/60 hover:bg-slate-800 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
              >
                <Upload className="w-8 h-8 text-amber-400 mb-2" />
                {selectedFile ? (
                  <div className="text-center">
                    <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{selectedFile.name}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Pronto para armazenamento no core
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-200">
                      Clique para escolher ou arraste o arquivo do certificado (PDF ou Imagem)
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Suporta arquivos .pdf, .png, .jpg de alta resolução (A4 Paisagem ou Retrato)
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {fileError && <p className="text-xs text-red-400 font-bold mt-1">{fileError}</p>}
            </div>

            {/* DESCRIÇÃO OU NOTAS ADICIONAIS */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                Descrição ou Observações do Modelo (Opcional):
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Ex: Modelo oficial utilizado na recepção e acolhida de novos filhotes do GELB 32/SC..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* BOTÕES DE AÇÃO DO FORMULÁRIO */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                isUploading || !selectedFile
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-400 text-[#0F2C59] hover:bg-amber-300 font-black'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0F2C59] border-t-transparent rounded-full animate-spin" />
                  <span>Processando e Armazenando no Core...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvar Modelo no Core do Sistema</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* BARRA DE FILTROS E BUSCA */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* BUSCA */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou modelo..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        {/* CÁPSULAS DE CATEGORIA */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3 h-3" /> Categoria:
          </span>
          {['Todas', 'Progressão', 'Especialidades', 'Promessas', 'Insígnias de Modalidade'].map((cat) => {
            const isActive = filterCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat as ScoutCategory)}
                className={`px-3 py-1 text-xs font-semibold rounded-full shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#0F2C59] text-amber-300 font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTA / GRADE DE MODELOS ARMAZENADOS */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0F2C59] border-t-amber-400 rounded-full animate-spin" />
          <p className="text-xs font-semibold">Carregando modelos do core do sistema...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center gap-3">
          <FileText className="w-12 h-12 text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">Nenhum modelo de certificado encontrado</h4>
          <p className="text-xs text-slate-500 max-w-md">
            Clique no botão acima "Fazer Upload de Modelo PDF" para incluir novos certificados específicos no core
            do sistema.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 shadow-md hover:shadow-lg transition-all flex flex-col overflow-hidden group"
            >
              {/* ÁREA DE PRÉ-VISUALIZAÇÃO DA PÁGINA */}
              <div
                onClick={() => setSelectedPreviewTemplate(t)}
                className="relative bg-slate-100 h-44 cursor-pointer overflow-hidden flex items-center justify-center border-b border-slate-100"
              >
                {t.previewImageDataUrl ? (
                  <img
                    src={t.previewImageDataUrl}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <FileText className="w-10 h-10 text-[#0F2C59]" />
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      {t.name}
                    </span>
                  </div>
                )}

                {/* OVERLAY DE VISUALIZAÇÃO */}
                <div className="absolute inset-0 bg-[#0F2C59]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                  <Eye className="w-4 h-4" />
                  <span>Visualizar PDF</span>
                </div>

                {/* BADGE DE MODELO ATIVO / PADRÃO */}
                {t.isDefault && (
                  <div className="absolute top-2.5 right-2.5 bg-amber-400 text-[#0F2C59] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-[#0F2C59]" />
                    <span>Padrão Ativo</span>
                  </div>
                )}
              </div>

              {/* CORPO DO CARD */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-bold uppercase bg-blue-100 text-[#0F2C59] px-2 py-0.5 rounded">
                      {t.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      &bull; {t.model}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0F2C59] leading-snug line-clamp-2">
                    {t.name}
                  </h3>

                  {t.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {t.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100">
                    <span>{t.fileName}</span>
                    <span>{(t.fileSize / 1024).toFixed(0)} KB</span>
                  </div>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewTemplate(t)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-[#0F2C59] hover:bg-slate-100 transition-colors"
                      title="Visualizar PDF completo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadOriginalPdf(t)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-[#0F2C59] hover:bg-slate-100 transition-colors"
                      title="Baixar arquivo original em PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {!t.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(t.id, t.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                        title="Definir como padrão deste modelo"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(t.id, t.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Excluir modelo do core"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {onSelectTemplateForIssuer && (
                    <button
                      type="button"
                      onClick={() => onSelectTemplateForIssuer(t)}
                      className="bg-[#0F2C59] hover:bg-blue-900 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 transition-all shadow-sm"
                    >
                      <span>Usar no Emissor</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL INTERATIVO DE PRÉ-VISUALIZAÇÃO DO PDF */}
      {selectedPreviewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-[#0F2C59] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-serif uppercase tracking-wide text-amber-300">
                  {selectedPreviewTemplate.name}
                </h3>
                <p className="text-[11px] text-slate-300">
                  {selectedPreviewTemplate.category} &bull; {selectedPreviewTemplate.model} &bull;{' '}
                  {selectedPreviewTemplate.fileName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadOriginalPdf(selectedPreviewTemplate)}
                  className="bg-amber-400 hover:bg-amber-300 text-[#0F2C59] font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPreviewTemplate(null)}
                  className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-blue-900/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-100 flex-1">
              <iframe
                src={selectedPreviewTemplate.pdfDataUrl}
                title={selectedPreviewTemplate.name}
                className="w-full h-[540px] border border-slate-300 rounded-xl bg-white shadow-inner"
              />
            </div>

            <div className="bg-white p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Data de inclusão: {new Date(selectedPreviewTemplate.createdAt).toLocaleDateString('pt-BR')}
              </span>
              {onSelectTemplateForIssuer && (
                <button
                  type="button"
                  onClick={() => {
                    const t = selectedPreviewTemplate;
                    setSelectedPreviewTemplate(null);
                    onSelectTemplateForIssuer(t);
                  }}
                  className="bg-[#0F2C59] hover:bg-blue-900 text-white font-bold px-4 py-1.5 rounded-lg transition-all"
                >
                  Emitir Certificado com Este Modelo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE MODELO */}
      {templateToDelete && (
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
                Excluir Modelo do Core?
              </h3>
              <p className="text-sm text-slate-600 text-center mt-2">
                Deseja realmente remover permanentemente o modelo{' '}
                <strong className="text-slate-900 font-semibold">"{templateToDelete.name}"</strong>?
              </p>
              <p className="text-xs text-slate-400 text-center mt-1">
                Esta ação apagará o arquivo do banco de modelos do sistema.
              </p>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setTemplateToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Modelo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
