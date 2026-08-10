import { FontDefinition, GELB_FONTS } from '../config/gelbConfig';
import { GELB_LOGO_DATA_URL } from '../assets/gelbAssetsData';

const FONTS_STORAGE_KEY = 'gelb_custom_fonts';
const LOGO_STORAGE_KEY = 'gelb_official_logo';

export const POPULAR_GOOGLE_FONTS = {
  header: [
    'Cinzel Decorative',
    'Cinzel',
    'Playfair Display',
    'Montserrat',
    'Cormorant Garamond',
    'Merriweather',
    'Oswald',
    'Lora',
    'Bebas Neue',
    'Spectral',
  ],
  body: [
    'Montserrat',
    'Open Sans',
    'Roboto',
    'Lato',
    'Raleway',
    'Inter',
    'Poppins',
    'Source Sans 3',
    'Nunito',
    'Merriweather',
  ],
  signature: [
    'Great Vibes',
    'Dancing Script',
    'Pacifico',
    'Sacramento',
    'Alex Brush',
    'Satisfy',
    'Parisienne',
    'Caveat',
    'Pinyon Script',
  ],
};

export function getSavedFonts(): FontDefinition[] {
  try {
    const saved = localStorage.getItem(FONTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar fontes salvas:', e);
  }
  return GELB_FONTS;
}

export function saveSavedFonts(fonts: FontDefinition[]): void {
  try {
    localStorage.setItem(FONTS_STORAGE_KEY, JSON.stringify(fonts));
    loadGoogleFontsToHead(fonts);
  } catch (e) {
    console.warn('Erro ao salvar fontes:', e);
  }
}

export function resetSavedFonts(): FontDefinition[] {
  try {
    localStorage.removeItem(FONTS_STORAGE_KEY);
    loadGoogleFontsToHead(GELB_FONTS);
  } catch (e) {
    console.warn('Erro ao resetar fontes:', e);
  }
  return GELB_FONTS;
}

export function getOfficialLogo(): string {
  try {
    const saved = localStorage.getItem(LOGO_STORAGE_KEY);
    if (saved) {
      return saved;
    }
  } catch (e) {
    console.warn('Erro ao carregar logo oficial salva:', e);
  }
  return GELB_LOGO_DATA_URL;
}

export function saveOfficialLogo(logoDataUrl: string): void {
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, logoDataUrl);
  } catch (e) {
    console.warn('Erro ao salvar logo oficial:', e);
  }
}

export function resetOfficialLogo(): void {
  try {
    localStorage.removeItem(LOGO_STORAGE_KEY);
  } catch (e) {
    console.warn('Erro ao resetar logo oficial:', e);
  }
}

/**
 * Carrega dinamicamente as fontes do Google Fonts no <head> da página
 */
export function loadGoogleFontsToHead(fonts: FontDefinition[]): void {
  fonts.forEach((f) => {
    const rawName = f.googleFontName || f.name.split('(')[0].trim();
    if (!rawName) return;
    const fontId = `google-font-dyn-${f.id}`;
    let link = document.getElementById(fontId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const formattedName = rawName.replace(/\s+/g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
  });
}
