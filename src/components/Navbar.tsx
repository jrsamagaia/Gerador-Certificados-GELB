import React, { useState, useEffect } from 'react';
import { Award, History, FolderTree } from 'lucide-react';
import { GELB_LOGO_DATA_URL } from '../assets/gelbAssetsData';
import { getOfficialLogo } from '../utils/gelbSettings';

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
              title="Configurações GELB"
            >
              <FolderTree className="w-4 h-4" />
              <span>Configurações</span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
};
