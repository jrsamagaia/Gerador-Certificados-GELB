import React, { useState, useEffect } from 'react';
import { Award, History, FolderTree, Cloud, LogIn, LogOut, Check } from 'lucide-react';
import { GELB_LOGO_DATA_URL } from '../assets/gelbAssetsData';
import { getOfficialLogo } from '../utils/gelbSettings';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'single' | 'batch' | 'history' | 'validate' | 'directories';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  issuedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  issuedCount,
}) => {
  const [logo, setLogo] = useState<string>(() => getOfficialLogo() || GELB_LOGO_DATA_URL);
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const updateLogo = () => {
      setLogo(getOfficialLogo() || GELB_LOGO_DATA_URL);
    };

    window.addEventListener('gelb_logo_changed', updateLogo);
    window.addEventListener('storage', updateLogo);

    return () => {
      window.removeEventListener('gelb_logo_changed', updateLogo);
      window.removeEventListener('storage', updateLogo);
    };
  }, []);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      setAuthError(err?.message || 'Não foi possível entrar com Google. Tente novamente.');
      setTimeout(() => setAuthError(null), 4000);
    }
  };

  return (
    <header className="bg-[#0F2C59] text-white shadow-lg sticky top-0 z-50 border-b-4 border-amber-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* MARCA E LOGO GELB 32/SC */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('single')}>
            <div className="bg-white p-1 rounded-xl shadow-md border-2 border-amber-400 flex items-center justify-center w-14 h-14 overflow-hidden">
              {logo && logo.trim() !== '' ? (
                <img
                  src={logo}
                  alt="Logo Grupo Escoteiro Leões de Blumenau - GELB 32/SC"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  onError={() => setLogo(GELB_LOGO_DATA_URL)}
                />
              ) : null}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-lg tracking-wide text-white uppercase">
                  GELB 32/SC
                </span>
                <span className="bg-amber-400 text-[#0F2C59] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Oficial
                </span>
              </div>
              <p className="text-xs text-amber-200 font-medium">
                Grupo Escoteiro Leões de Blumenau
              </p>
            </div>
          </div>

          {/* MENU DE NAVEGAÇÃO */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                activeTab === 'single'
                  ? 'bg-amber-400 text-[#0F2C59] shadow-md font-bold'
                  : 'text-slate-200 hover:bg-blue-900/60 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Emissor Individual</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                activeTab === 'history'
                  ? 'bg-amber-400 text-[#0F2C59] shadow-md font-bold'
                  : 'text-slate-200 hover:bg-blue-900/60 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Histórico</span>
              {issuedCount > 0 && (
                <span className="bg-amber-500 text-[#0F2C59] font-extrabold text-[10px] px-1.5 py-0.2 rounded-full ml-0.5">
                  {issuedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('directories')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                activeTab === 'directories'
                  ? 'bg-amber-400 text-[#0F2C59] shadow-md font-bold'
                  : 'text-slate-200 hover:bg-blue-900/60 hover:text-white'
              }`}
              title="Configurações GELB e Modelos de Certificados"
            >
              <FolderTree className="w-4 h-4" />
              <span>Configurações</span>
            </button>

            {/* STATUS E CONEXÃO EM NUVEM (FIREBASE) */}
            <div className="ml-2 pl-2 border-l border-blue-900/80 flex items-center">
              {user ? (
                <div className="flex items-center gap-2 bg-[#081a36] py-1 px-2.5 rounded-lg border border-amber-400/40 text-xs">
                  <div className="relative">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Usuário'}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full border border-amber-400 object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-amber-400 text-[#0F2C59] font-black text-[11px] flex items-center justify-center">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#081a36]" title="Nuvem Conectada" />
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-[11px] font-bold text-amber-200 truncate max-w-[120px]">
                      {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-300 font-semibold flex items-center gap-0.5">
                      <Cloud className="w-2.5 h-2.5" /> Nuvem Ativa
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => signOutUser()}
                    className="text-slate-400 hover:text-red-300 p-1 transition-colors"
                    title="Desconectar conta Google"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm transition-all border border-emerald-400/50"
                  title="Conectar com o Google para salvar certificados na nuvem"
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                  <span className="hidden sm:inline">Conectar Nuvem</span>
                  <span className="sm:hidden">Entrar</span>
                </button>
              )}
            </div>
          </nav>

        </div>
      </div>
    </header>
  );
};
