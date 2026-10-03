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
  Cloud,
  CloudUpload,
  RefreshCw,
  LogIn,
  LogOut,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { CertificateTemplate, ScoutCategory } from '../types/certificate';
import { SCOUT_CATEGORIES, CATEGORY_MODELS_MAP } from '../data/scoutCategoriesData';
import {
  getAllTemplates,
  saveTemplate,
  deleteTemplate,
  setDefaultTemplate,
  initDefaultTemplates,
  fetchCloudTemplates,
  syncAllLocalTemplatesToCloud,
  subscribeToCloudTemplates,
} from '../utils/customTemplatesStorage';
import { convertPdfToImageDataUrl } from '../utils/pdfRenderer';
import { useAuth } from '../context/AuthContext';

interface CertificateTemplatesManagerProps {
  onSelectTemplateForIssuer?: (template: CertificateTemplate) => void;
}

export const CertificateTemplatesManager: React.FC<CertificateTemplatesManagerProps> = ({
  onSelectTemplateForIssuer,
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<ScoutCategory>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<CertificateTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string } | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

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
    setTimeout(() => setNotification(null), 4000);
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

    // Sincronização em tempo real de modelos da nuvem (Firestore)
    let unsubscribeCloud: (() => void) | undefined;
    try {
      unsubscribeCloud = subscribeToCloudTemplates((cloudTemplates) => {
        if (cloudTemplates && cloudTemplates.length > 0) {
          getAllTemplates().then(setTemplates);
        }
      });
    } catch (e) {
      console.warn('Escuta em tempo real da nuvem não inicializada:', e);
    }

    const handleUpdated = () => {
      getAllTemplates().then(setTemplates);
    };

    window.addEventListener('gelb_templates_updated', handleUpdated);
    return () => {
      window.removeEventListener('gelb_templates_updated', handleUpdated);
      if (unsubscribeCloud) unsubscribeCloud();
    };
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

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      showNotification('Não foi possível autenticar com o Google. Tente novamente.', 'error');
    }
  };

  const handleManualCloudRefresh = async () => {
    setIsSyncingCloud(true);
    try {
      const cloud = await fetchCloudTemplates();
      const loaded = await getAllTemplates();
      setTemplates(loaded);
      showNotification(`Sincronização concluída! ${cloud.length} modelos atualizados da nuvem.`);
    } catch (err) {
      console.error('Erro ao sincronizar da nuvem:', err);
      showNotification('Não foi possível conectar à nuvem no momento. Verifique sua conexão.', 'error');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleSyncLocalToCloud = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSyncingCloud(true);
    try {
      const count = await syncAllLocalTemplatesToCloud();
      await loadAll();
      showNotification(`Sucesso! ${count} modelos locais foram salvos e publicados na nuvem.`);
    } catch (err) {
      console.error('Erro ao subir modelos para a nuvem:', err);
      showNotification('Erro ao salvar modelos na nuvem. Verifique suas permissões.', 'error');
    } finally {
      setIsSyncingCloud(false);
    }
  };

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

      // Se o usuário está logado, salva na nuvem e localmente. Se não estiver, salva localmente e avisa.
      await saveTemplate(newTemplate, !!user);
      await loadAll();

      if (user) {
        showNotification(`Modelo "${newTemplate.name}" publicado na NUVEM e salvo com sucesso! Já está disponível em outros computadores e no Vercel.`);
      } else {
        showNotification(`Modelo "${newTemplate.name}" salvo localmente. Conecte sua conta Google no topo para sincronizá-lo na nuvem.`);
      }

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
      showNotification(`Modelo "${templateToDelete.name}" removido com sucesso.`);
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
          className={`fixed top-24 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 text-white font-bold text-sm ${
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

      {/* PAINEL DE SINCRONIZAÇÃO EM NUVEM (FIREBASE FIRESTORE) */}
      <div className="bg-gradient-to-r from-[#0F2C59] via-[#163b75] to-[#0d2242] text-white p-5 rounded-2xl border-2 border-amber-400 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-amber-400 text-[#0F2C59] rounded-xl shadow-md shrink-0 mt-0.5">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white font-serif uppercase tracking-wide">
                Armazenamento & Sincronização em Nuvem Oficial GELB
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full uppercase">
                <Globe className="w-3 h-3 text-emerald-400" />
                Multi-Computador & Vercel
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
              Os modelos publicados aqui são salvos no banco de dados na nuvem (Firebase Firestore). Eles permanecem salvos e sincronizados ao acessar o aplicativo em outro computador, aba anônima, outro navegador ou no seu deploy do Vercel.
            </p>
            {user ? (
              <div className="flex items-center gap-2 text-xs text-amber-200 mt-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Conectado como <strong>{user.displayName || user.email}</strong> &bull; Permissão de publicação na nuvem ativa.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-200/90 mt-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>
                  Modo de Leitura Pública ativo. Conecte-se com sua conta Google para salvar ou sincronizar novos modelos na nuvem.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* AÇÕES DE SINCRONIZAÇÃO EM NUVEM */}
        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end flex-wrap">
          {user ? (
            <button
              type="button"
              onClick={handleSyncLocalToCloud}
              disabled={isSyncingCloud}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-[#0F2C59] font-black text-xs rounded-xl transition-all shadow-md"
              title="Salvar todos os modelos locais na nuvem do Firebase"
            >
              <CloudUpload className="w-4 h-4" />
              <span>{isSyncingCloud ? 'Sincronizando...' : 'Publicar Locais na Nuvem'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-[#0F2C59] font-black text-xs rounded-xl transition-all shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Conectar com Google</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleManualCloudRefresh}
            disabled={isSyncingCloud}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-900/60 hover:bg-blue-900 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-blue-700/60 transition-all"
            title="Atualizar lista de certificados da nuvem"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin text-amber-400' : ''}`} />
            <span>Atualizar Nuvem</span>
          </button>
        </div>
      </div>

      {/* CABEÇALHO DO GERENCIADOR DE MODELOS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-[#0F2C59]" />
            <h2 className="text-lg font-bold text-[#0F2C59] font-serif uppercase tracking-wide">
              Modelos Específicos de Certificados (PDF)
            </h2>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
              {templates.length} Modelos
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Faça upload e gerencie os modelos oficiais de certificados em PDF. Ao cadastrar um modelo, ele fica
            armazenado no banco em nuvem e disponível automaticamente na emissão individual e em lote em qualquer dispositivo.
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
                Cadastrar Novo Modelo Específico no Sistema
              </h3>
            </div>
            <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5" />
              {user ? 'Salva na Nuvem & Local' : 'Salva Local (Conecte Google para Nuvem)'}
            </span>
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
                      {(selectedFile.size / 1024).toFixed(1)} KB • Pronto para publicação
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-700">
            {!user ? (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="text-xs text-amber-300 hover:text-amber-200 underline font-semibold flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Conectar Google para salvar na Nuvem</span>
              </button>
            ) : (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Salvará automaticamente no Firestore
              </span>
            )}

            <div className="flex items-center gap-3">
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
                    <span>Publicando Modelo...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{user ? 'Salvar e Publicar na Nuvem' : 'Salvar Modelo'}</span>
                  </>
                )}
              </button>
            </div>
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

      {/* LISTAGEM DE MODELOS EM GRADE RESPONSIVA */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0F2C59] border-t-amber-400 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-600">Sincronizando modelos da nuvem e core...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center gap-3">
          <div className="p-4 bg-slate-100 rounded-full text-slate-400">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Nenhum modelo encontrado</h3>
          <p className="text-xs text-slate-500 max-w-md">
            {searchQuery || filterCategory !== 'Todas'
              ? 'Tente ajustar os filtros ou o termo de pesquisa.'
              : 'Faça upload do primeiro modelo em PDF para disponibilizá-lo na nuvem e no emissor.'}
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

                {/* BADGE DE NUVEM */}
                <div className="absolute top-2.5 left-2.5 bg-blue-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-amber-400/40">
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span>Nuvem</span>
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
                    <span className="truncate max-w-[150px]">{t.fileName}</span>
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
                      title="Excluir modelo"
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
              <span className="flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span>Armazenado na nuvem Firestore &bull; Data: {new Date(selectedPreviewTemplate.createdAt).toLocaleDateString('pt-BR')}</span>
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
                Excluir Modelo?
              </h3>
              <p className="text-sm text-slate-600 text-center mt-2">
                Deseja realmente remover permanentemente o modelo{' '}
                <strong className="text-slate-900 font-semibold">"{templateToDelete.name}"</strong>?
              </p>
              <p className="text-xs text-slate-400 text-center mt-1">
                Esta ação apagará o modelo deste dispositivo e do banco na nuvem.
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

      {/* MODAL DE LOGIN GOOGLE PARA AÇÕES EM NUVEM */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden">
            <div className="bg-[#0F2C59] p-6 text-white text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-[#0F2C59] flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Cloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold font-serif uppercase tracking-wide text-amber-300">
                Conectar com Google
              </h3>
              <p className="text-xs text-slate-200 mt-1">
                Para salvar, editar ou sincronizar certificados diretamente na nuvem (Firestore), autentique-se com sua conta Google.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 text-[#0F2C59] mb-1">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Acesso em qualquer lugar:
                </p>
                Os certificados que você salvar estarão disponíveis imediatamente no seu computador, celular, aba anônima e na versão publicada no Vercel.
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                    setShowAuthModal(false);
                  } catch (e: any) {
                    if (
                      e?.code === 'auth/popup-closed-by-user' ||
                      e?.code === 'auth/cancelled-popup-request'
                    ) {
                      return;
                    }
                    console.warn('Falha no login:', e?.message || e);
                  }
                }}
                className="w-full py-3 px-4 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2.5 transition-all shadow-md"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Continuar com Google</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
