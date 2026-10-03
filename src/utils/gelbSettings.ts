import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../config/firebase';
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

    // Sync to Firestore if authenticated
    if (auth.currentUser) {
      const path = 'settings/gelb';
      const ref = doc(db, 'settings', 'gelb');
      setDoc(
        ref,
        {
          id: 'gelb',
          fontsJson: JSON.stringify(fonts),
          updatedAt: new Date().toISOString(),
          updatedBy: auth.currentUser.uid,
        },
        { merge: true }
      ).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, path);
      });
    }
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
    if (saved && saved.trim() !== '') {
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gelb_logo_changed', { detail: logoDataUrl }));
    }

    // Sync to Firestore if authenticated and within limit
    if (auth.currentUser && logoDataUrl.length <= 800000) {
      const path = 'settings/gelb';
      const ref = doc(db, 'settings', 'gelb');
      setDoc(
        ref,
        {
          id: 'gelb',
          logoDataUrl,
          updatedAt: new Date().toISOString(),
          updatedBy: auth.currentUser.uid,
        },
        { merge: true }
      ).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, path);
      });
    }
  } catch (e) {
    console.warn('Erro ao salvar logo oficial:', e);
  }
}

export function resetOfficialLogo(): void {
  try {
    localStorage.removeItem(LOGO_STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gelb_logo_changed', { detail: GELB_LOGO_DATA_URL }));
    }
  } catch (e) {
    console.warn('Erro ao resetar logo oficial:', e);
  }
}

/**
 * Carrega configurações institucionais da nuvem (Firebase Firestore)
 */
export async function syncGelbSettingsFromCloud(): Promise<void> {
  const path = 'settings/gelb';
  try {
    const docRef = doc(db, 'settings', 'gelb');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.logoDataUrl && typeof data.logoDataUrl === 'string') {
        localStorage.setItem(LOGO_STORAGE_KEY, data.logoDataUrl);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gelb_logo_changed', { detail: data.logoDataUrl }));
        }
      }
      if (data.fontsJson && typeof data.fontsJson === 'string') {
        const parsed = JSON.parse(data.fontsJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(FONTS_STORAGE_KEY, data.fontsJson);
          loadGoogleFontsToHead(parsed);
        }
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
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
    let link = document.head.querySelector(`link#${fontId}`) as HTMLLinkElement | null;
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
