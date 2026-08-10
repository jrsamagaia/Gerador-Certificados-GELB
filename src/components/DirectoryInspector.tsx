import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  CheckCircle2,
  Shield,
  Type,
  Upload,
  RotateCcw,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { FontDefinition } from '../config/gelbConfig';
import {
  getSavedFonts,
  saveSavedFonts,
  resetSavedFonts,
  getOfficialLogo,
  saveOfficialLogo,
  resetOfficialLogo,
  loadGoogleFontsToHead,
  POPULAR_GOOGLE_FONTS,
} from '../utils/gelbSettings';

export const DirectoryInspector: React.FC = () => {
  const [fonts, setFonts] = useState<FontDefinition[]>([]);
  const [officialLogo, setOfficialLogo] = useState<string>('');
  const [editingFontId, setEditingFontId] = useState<string | null>(null);
  const [customFontInput, setCustomFontInput] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadedFonts = getSavedFonts();
    setFonts(loadedFonts);
    loadGoogleFontsToHead(loadedFonts);
    setOfficialLogo(getOfficialLogo());
  }, []);

  const triggerNotify = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newLogoUrl = event.target.result as string;
          setOfficialLogo(newLogoUrl);
          saveOfficialLogo(newLogoUrl);
          triggerNotify('Logo Oficial do GELB atualizada e salva com sucesso!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    resetOfficialLogo();
    setOfficialLogo(getOfficialLogo());
    triggerNotify('Logo Oficial redefinida para o padrão GELB.');
  };

  const handleFontGoogleNameChange = (id: string, newGoogleFontName: string) => {
    const updated = fonts.map((f) => {
      if (f.id === id) {
        const cleanName = newGoogleFontName.trim();
        return {
          ...f,
          googleFontName: cleanName,
          name: `${cleanName} (Google Font)`,
          family: `'${cleanName}', ${f.fallback}`,
        };
      }
      return f;
    });
    setFonts(updated);
  };

  const handleSaveFonts = () => {
    saveSavedFonts(fonts);
    triggerNotify('Mapeamento de fontes salvo com sucesso e carregado do Google Fonts!');
  };

  const handleResetFonts = () => {
    const defaultFonts = resetSavedFonts();
    setFonts(defaultFonts);
    triggerNotify('Fontes redefinidas para o padrão oficial GELB.');
  };

  const handleAddCustomFont = (category: 'header' | 'body' | 'signature') => {
    if (!customFontInput.trim()) return;
    const fontName = customFontInput.trim();
    const id = `custom-${Date.now()}`;
    const newFont: FontDefinition = {
      id,
      name: `${fontName} (Customizada)`,
      family: `'${fontName}', sans-serif`,
      category,
      assetPath: `https://fonts.google.com/specimen/${encodeURIComponent(fontName)}`,
      fallback: category === 'signature' ? 'cursive' : category === 'header' ? 'serif' : 'sans-serif',
      googleFontName: fontName,
    };
    const updated = [...fonts, newFont];
    setFonts(updated);
    saveSavedFonts(updated);
    setCustomFontInput('');
    triggerNotify(`Fonte "${fontName}" adicionada com sucesso!`);
  };

  const handleRemoveFont = (id: string) => {
    const updated = fonts.filter((f) => f.id !== id);
    setFonts(updated);
    saveSavedFonts(updated);
    triggerNotify('Fonte removida com sucesso!');
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      {/* PAINEL DE CABEÇALHO */}
      <div className="bg-[#0F2C59] text-white p-6 sm:p-8 rounded-2xl shadow-xl border-b-4 border-amber-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-400 text-[#0F2C59] rounded-xl shadow-md">
            <FolderTree className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif uppercase tracking-wide text-amber-300">
              Configurações GELB
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1">
              Gerencie a Logo Oficial do Grupo Escoteiro e personalização de tipografia via Google Fonts.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3.5 py-2 rounded-full text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configurações Ativas</span>
        </div>
      </div>

      {/* NOTIFICAÇÃO DE SUCESSO */}
      {saveSuccessMsg && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in font-bold text-sm">
          <Check className="w-5 h-5" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* PAINEL PRINCIPAL EM DUAS COLUNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUNA 1: LOGO OFICIAL DO GELB 32/SC */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-base font-bold text-[#0F2C59] flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <span>Logo Oficial do GELB 32/SC</span>
              </h2>
              <button
                onClick={handleResetLogo}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Redefinir para logo padrão"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Esta logo será aplicada como padrão no canto superior esquerdo de todos os certificados emitidos.
            </p>

            {/* ÁREA DE PRÉ-VISUALIZAÇÃO DA LOGO */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-400 transition-colors">
              <img
                src={officialLogo}
                alt="Logo Oficial do GELB 32/SC"
                referrerPolicy="no-referrer"
                className="w-40 h-40 object-contain drop-shadow-md my-2"
              />
              <p className="text-xs font-bold text-[#0F2C59] uppercase tracking-wider text-center mt-3">
                Grupo Escoteiro Leões de Blumenau
              </p>
              <p className="text-[11px] text-slate-500 text-center font-mono">
                GELB 32/SC &bull; Padrão Oficial
              </p>
            </div>
          </div>

          {/* BOTÃO PARA ALTERAR A LOGO OFICIAL */}
          <div className="space-y-2">
            <label className="cursor-pointer bg-[#0F2C59] hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md w-full">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Carregar Nova Logo Oficial (PNG/SVG)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-500 text-center font-medium">
              A alteração é salva localmente e substitui a logo em todas as emissões.
            </p>
          </div>
        </div>

        {/* COLUNA 2: FONTES & MAPEAMENTO DE TIPOGRAFIA GOOGLE FONTS */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex flex-col gap-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0F2C59] flex items-center gap-2">
                <Type className="w-5 h-5 text-purple-600" />
                <span>Fontes & Mapeamento de Tipografia GELB</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Selecione ou insira o nome exato de qualquer fonte do catálogo{' '}
                <a
                  href="https://fonts.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-bold inline-flex items-center gap-0.5"
                >
                  Google Fonts <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            <button
              onClick={handleResetFonts}
              className="text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Restaurar fontes originais GELB"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar</span>
            </button>
          </div>

          {/* LISTA DE FONTES CONFIGURADAS */}
          <div className="flex flex-col gap-3">
            {fonts.map((font) => (
              <div
                key={font.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm hover:border-purple-300 transition-colors"
              >
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      {font.category}
                    </span>
                    <span className="text-xs font-bold text-[#0F2C59]">
                      {font.name}
                    </span>
                  </div>

                  {/* CAMPO DE EDICÃO DA FONTE DO GOOGLE */}
                  <div className="flex items-center gap-2 mt-2 w-full">
                    <select
                      value={font.googleFontName || ''}
                      onChange={(e) =>
                        handleFontGoogleNameChange(font.id, e.target.value)
                      }
                      className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:border-purple-500 focus:outline-none flex-1"
                    >
                      <option value="">Selecione da lista rápida...</option>
                      {(POPULAR_GOOGLE_FONTS[font.category] || []).map((gf) => (
                        <option key={gf} value={gf}>
                          {gf}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={font.googleFontName || ''}
                      onChange={(e) =>
                        handleFontGoogleNameChange(font.id, e.target.value)
                      }
                      placeholder="Nome Google Font (ex: Lora)"
                      className="text-xs font-mono bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:border-purple-500 focus:outline-none w-44"
                    />
                  </div>

                  {/* PRÉ-VISUALIZAÇÃO DA TIPOGRAFIA */}
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p
                      className="text-sm text-slate-800 truncate"
                      style={{
                        fontFamily: font.family,
                      }}
                    >
                      Exemplo: Certificado de Honra ao Mérito - GELB 32/SC
                    </p>
                  </div>
                </div>

                {fonts.length > 1 && (
                  <button
                    onClick={() => handleRemoveFont(font.id)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors self-end sm:self-center"
                    title="Remover fonte"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* ADICIONAR NOVA FONTE CUSTOMIZADA DO GOOGLE */}
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Adicionar nova fonte do Google Fonts:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customFontInput}
                onChange={(e) => setCustomFontInput(e.target.value)}
                placeholder="Digite o nome exato (Ex: Playfair Display, Lora, Oswald)"
                className="flex-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddCustomFont('header')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1 transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Para escolher e testar outras fontes, acesse diretamente o site oficial do{' '}
              <a
                href="https://fonts.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-bold"
              >
                Google Fonts
              </a>
              .
            </p>
          </div>

          {/* BOTÃO SALVAR FONTES */}
          <button
            onClick={handleSaveFonts}
            className="bg-[#0F2C59] hover:bg-blue-900 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md w-full mt-2"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Salvar e Carregar Fontes Selecionadas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
